import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/modules/prisma/prisma.service';

describe('Payments E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clientToken: string;
  let professionalToken: string;
  let adminToken: string;
  let testJob: any;
  let testQuote: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Setup test data
    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create test users
    const client = await prisma.user.create({
      data: {
        email: 'client-test@test.com',
        name: 'Client Test',
        phone: '51999999991',
        password: '$2b$10$TestHashedPassword',
        role: 'CLIENT',
        balance: {
          create: {
            available: 0,
            held: 0,
            total_earned: 0,
            total_withdrawn: 0,
          },
        },
      },
    });

    const professional = await prisma.user.create({
      data: {
        email: 'pro-test@test.com',
        name: 'Professional Test',
        phone: '51999999992',
        password: '$2b$10$TestHashedPassword',
        role: 'PROFESSIONAL',
        professional: {
          create: {
            level: 'GOLD',
            is_available: true,
            cpf_verified: true,
            selfie_verified: true,
            address_verified: true,
          },
        },
        balance: {
          create: {
            available: 0,
            held: 0,
            total_earned: 0,
            total_withdrawn: 0,
          },
        },
      },
    });

    const admin = await prisma.user.create({
      data: {
        email: 'admin-test@test.com',
        name: 'Admin Test',
        phone: '51999999993',
        password: '$2b$10$TestHashedPassword',
        role: 'ADMIN',
      },
    });

    // Login to get tokens (simplified - in real app would use auth endpoints)
    // For testing, we'll generate mock tokens or use direct service calls
    clientToken = 'mock-client-token';
    professionalToken = 'mock-professional-token';
    adminToken = 'mock-admin-token';

    // Create test job with quote accepted
    const category = await prisma.category.findFirst();
    const mission = await prisma.mission.findFirst();

    testJob = await prisma.job.create({
      data: {
        code: 'TEST001',
        client_id: client.id,
        mission_id: mission!.id,
        status: 'QUOTE_ACCEPTED',
        price_final: 10000, // R$ 100.00
        scheduled_date: new Date(Date.now() + 86400000),
      },
    });

    testQuote = await prisma.quote.create({
      data: {
        job_id: testJob.id,
        professional_id: professional.professional![0].id,
        amount: 10000,
        status: 'ACCEPTED',
        available_dates: [new Date(Date.now() + 86400000)],
      },
    });
  }

  async function cleanupTestData() {
    await prisma.transaction.deleteMany({
      where: { user: { email: { contains: 'test.com' } } },
    });
    await prisma.paymentSplit.deleteMany();
    await prisma.payment.deleteMany({
      where: { job: { client: { email: { contains: 'test.com' } } } },
    });
    await prisma.withdrawal.deleteMany({
      where: { professional: { user: { email: { contains: 'test.com' } } } },
    });
    await prisma.refund.deleteMany();
    await prisma.quote.deleteMany({
      where: { job: { client: { email: { contains: 'test.com' } } } },
    });
    await prisma.job.deleteMany({
      where: { client: { email: { contains: 'test.com' } } },
    });
    await prisma.balance.deleteMany({
      where: { user: { email: { contains: 'test.com' } } },
    });
    await prisma.professional.deleteMany({
      where: { user: { email: { contains: 'test.com' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'test.com' } },
    });
  }

  describe('Payment Flow - PIX', () => {
    it('[FLOW 1] Client creates PIX payment for job', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          job_id: testJob.id,
          method: 'PIX',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('qr_code');
      expect(response.body).toHaveProperty('qr_code_base64');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.method).toBe('PIX');
      expect(response.body.amount).toBe(10000);
    });

    it('[FLOW 2] Webhook updates payment status to COMPLETED', async () => {
      const payment = await prisma.payment.findFirst({
        where: { job_id: testJob.id },
      });

      const response = await request(app.getHttpServer())
        .post('/payments/webhook')
        .send({
          payment_id: payment!.gateway_payment_id,
          status: 'COMPLETED',
        })
        .expect(200);

      expect(response.body.success).toBe(true);

      // Verify payment status updated
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment!.id },
        include: { splits: true },
      });

      expect(updatedPayment!.status).toBe('COMPLETED');
      expect(updatedPayment!.splits).toHaveLength(2);

      // Verify 80/20 split
      const professionalSplit = updatedPayment!.splits.find((s) => s.recipient_type === 'PROFESSIONAL');
      const platformSplit = updatedPayment!.splits.find((s) => s.recipient_type === 'PLATFORM');

      expect(professionalSplit!.amount).toBe(8000); // 80% of 10000
      expect(platformSplit!.amount).toBe(2000); // 20% of 10000
      expect(professionalSplit!.status).toBe('HELD');
      expect(platformSplit!.status).toBe('RELEASED');
    });

    it('[FLOW 3] Job status updated to PAID', async () => {
      const updatedJob = await prisma.job.findUnique({
        where: { id: testJob.id },
      });

      expect(updatedJob!.status).toBe('PAID');
    });
  });

  describe('Escrow Release Flow', () => {
    it('[FLOW 4] Client approves job completion, escrow releases', async () => {
      // First, update job to PENDING_APPROVAL
      await prisma.job.update({
        where: { id: testJob.id },
        data: { status: 'PENDING_APPROVAL' },
      });

      // Call the approve endpoint (you'd need to implement this in jobs controller)
      const response = await request(app.getHttpServer())
        .post(`/jobs/${testJob.id}/approve-completion`)
        .set('Authorization', `Bearer ${clientToken}`)
        .expect(200);

      // Verify job status is COMPLETED
      expect(response.body.status).toBe('COMPLETED');

      // Verify split status changed from HELD to RELEASED
      const payment = await prisma.payment.findFirst({
        where: { job_id: testJob.id },
        include: { splits: true },
      });

      const professionalSplit = payment!.splits.find((s) => s.recipient_type === 'PROFESSIONAL');
      expect(professionalSplit!.status).toBe('RELEASED');
      expect(professionalSplit!.released_at).toBeDefined();

      // Verify professional balance updated
      const professional = await prisma.user.findFirst({
        where: { email: 'pro-test@test.com' },
        include: { balance: true },
      });

      expect(professional!.balance!.available).toBe(8000);
      expect(professional!.balance!.total_earned).toBe(8000);

      // Verify transaction created
      const transaction = await prisma.transaction.findFirst({
        where: {
          user_id: professional!.id,
          type: 'SPLIT_PROFESSIONAL',
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction!.amount).toBe(8000);
    });
  });

  describe('Withdrawal Flow', () => {
    let withdrawalId: string;

    it('[FLOW 5] Professional requests withdrawal', async () => {
      const response = await request(app.getHttpServer())
        .post('/payments/withdrawals')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send({
          amount: 5000, // R$ 50.00
          pix_key: '51999999992',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('PENDING');
      expect(response.body.amount).toBe(5000);
      expect(response.body.pix_key).toBe('51999999992');

      withdrawalId = response.body.id;

      // Verify balance updated (available -> held)
      const professional = await prisma.user.findFirst({
        where: { email: 'pro-test@test.com' },
        include: { balance: true },
      });

      expect(professional!.balance!.available).toBe(3000); // 8000 - 5000
      expect(professional!.balance!.held).toBe(5000);
    });

    it('[FLOW 6] Admin approves withdrawal', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/payments/withdrawals/${withdrawalId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ approve: true })
        .expect(200);

      expect(response.body.status).toBeOneOf(['APPROVED', 'PROCESSING', 'COMPLETED']);

      // Eventually should reach COMPLETED
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
      });

      // Verify balance updated
      const professional = await prisma.user.findFirst({
        where: { email: 'pro-test@test.com' },
        include: { balance: true },
      });

      expect(professional!.balance!.held).toBe(0);
      expect(professional!.balance!.total_withdrawn).toBe(5000);
    });

    it('[FLOW 7] Admin rejects withdrawal', async () => {
      // Create another withdrawal
      const newWithdrawal = await prisma.withdrawal.create({
        data: {
          professional_id: (await prisma.professional.findFirst({
            where: { user: { email: 'pro-test@test.com' } },
          }))!.id,
          amount: 2000,
          pix_key: '51999999992',
          status: 'PENDING',
        },
      });

      // Update balance to reflect withdrawal request
      await prisma.balance.update({
        where: {
          user_id: (await prisma.user.findFirst({ where: { email: 'pro-test@test.com' } }))!.id,
        },
        data: {
          available: { decrement: 2000 },
          held: { increment: 2000 },
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/payments/withdrawals/${newWithdrawal.id}/approve`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          approve: false,
          rejection_reason: 'Dados bancários inválidos',
        })
        .expect(200);

      expect(response.body.status).toBe('REJECTED');
      expect(response.body.rejection_reason).toBe('Dados bancários inválidos');

      // Verify balance returned (held -> available)
      const professional = await prisma.user.findFirst({
        where: { email: 'pro-test@test.com' },
        include: { balance: true },
      });

      expect(professional!.balance!.available).toBe(3000); // Back to original
      expect(professional!.balance!.held).toBe(0);
    });
  });

  describe('Validation Tests', () => {
    it('[VAL 1] Cannot pay for job without accepted quote', async () => {
      const jobWithoutQuote = await prisma.job.create({
        data: {
          code: 'TEST002',
          client_id: (await prisma.user.findFirst({ where: { email: 'client-test@test.com' } }))!.id,
          mission_id: (await prisma.mission.findFirst())!.id,
          status: 'CREATED',
          price_final: 5000,
        },
      });

      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          job_id: jobWithoutQuote.id,
          method: 'PIX',
        })
        .expect(400);
    });

    it('[VAL 2] Cannot create duplicate payment', async () => {
      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${clientToken}`)
        .send({
          job_id: testJob.id,
          method: 'PIX',
        })
        .expect(400);
    });

    it('[VAL 3] Minimum withdrawal amount is R$ 50.00', async () => {
      await request(app.getHttpServer())
        .post('/payments/withdrawals')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send({
          amount: 4000, // R$ 40.00 - below minimum
          pix_key: '51999999992',
        })
        .expect(400);
    });

    it('[VAL 4] Cannot withdraw more than available balance', async () => {
      const professional = await prisma.user.findFirst({
        where: { email: 'pro-test@test.com' },
        include: { balance: true },
      });

      await request(app.getHttpServer())
        .post('/payments/withdrawals')
        .set('Authorization', `Bearer ${professionalToken}`)
        .send({
          amount: professional!.balance!.available + 100,
          pix_key: '51999999992',
        })
        .expect(400);
    });

    it('[VAL 5] Only client can pay for their job', async () => {
      const otherClient = await prisma.user.create({
        data: {
          email: 'other-client@test.com',
          name: 'Other Client',
          phone: '51999999994',
          password: '$2b$10$TestHashedPassword',
          role: 'CLIENT',
        },
      });

      const otherClientToken = 'mock-other-client-token';

      await request(app.getHttpServer())
        .post('/payments')
        .set('Authorization', `Bearer ${otherClientToken}`)
        .send({
          job_id: testJob.id,
          method: 'PIX',
        })
        .expect(403);
    });

    it('[VAL 6] Only admin can approve withdrawals', async () => {
      const withdrawal = await prisma.withdrawal.findFirst({
        where: { status: 'PENDING' },
      });

      if (withdrawal) {
        await request(app.getHttpServer())
          .patch(`/payments/withdrawals/${withdrawal.id}/approve`)
          .set('Authorization', `Bearer ${professionalToken}`)
          .send({ approve: true })
          .expect(403);
      }
    });
  });

  describe('Financial Stats', () => {
    it('[STATS 1] Professional can view their financial stats', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/stats/me')
        .set('Authorization', `Bearer ${professionalToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body).toHaveProperty('held');
      expect(response.body).toHaveProperty('total_earned');
      expect(response.body).toHaveProperty('total_withdrawn');
      expect(response.body.total_earned).toBeGreaterThan(0);
    });

    it('[STATS 2] Professional can view their transactions', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/transactions/me?skip=0&take=10')
        .set('Authorization', `Bearer ${professionalToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('[STATS 3] Professional can view their balance', async () => {
      const response = await request(app.getHttpServer())
        .get('/payments/balance/me')
        .set('Authorization', `Bearer ${professionalToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('available');
      expect(response.body).toHaveProperty('held');
      expect(response.body).toHaveProperty('total_earned');
      expect(response.body).toHaveProperty('total_withdrawn');
    });
  });
});
