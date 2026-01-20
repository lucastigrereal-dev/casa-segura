import { PrismaClient, Role, UserStatus, RiskLevel, JobStatus, QuoteStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@casasegura.com' },
    update: {},
    create: {
      email: 'admin@casasegura.com',
      phone: '54999999999',
      password: hashedPassword,
      name: 'Administrador',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Categories
  const categories = [
    { name: 'Elétrica', slug: 'eletrica', icon: 'Zap', color: '#F59E0B', order: 1 },
    { name: 'Hidráulica', slug: 'hidraulica', icon: 'Droplets', color: '#3B82F6', order: 2 },
    { name: 'Pintura', slug: 'pintura', icon: 'Paintbrush', color: '#EC4899', order: 3 },
    { name: 'Montagem', slug: 'montagem', icon: 'Wrench', color: '#8B5CF6', order: 4 },
    { name: 'Clima Frio', slug: 'clima-frio', icon: 'Snowflake', color: '#06B6D4', order: 5 },
  ];

  const createdCategories: Record<string, string> = {};

  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
    createdCategories[category.slug] = created.id;
    console.log(`Created category: ${created.name}`);
  }

  // Create Missions (prices in centavos - realistic for Serra Gaúcha)
  const missions = [
    // Elétrica
    {
      name: 'Troca de Tomada',
      slug: 'troca-tomada',
      description: 'Substituição de tomada simples ou dupla',
      category_slug: 'eletrica',
      price_min: 8000,      // R$ 80
      price_max: 15000,     // R$ 150
      price_default: 10000, // R$ 100
      duration_min: 30,
      duration_max: 60,
      risk_level: RiskLevel.MEDIUM,
    },
    {
      name: 'Instalação de Luminária',
      slug: 'instalacao-luminaria',
      description: 'Instalação de luminária de teto ou parede',
      category_slug: 'eletrica',
      price_min: 12000,     // R$ 120
      price_max: 25000,     // R$ 250
      price_default: 15000, // R$ 150
      duration_min: 45,
      duration_max: 90,
      risk_level: RiskLevel.MEDIUM,
    },
    {
      name: 'Troca de Disjuntor',
      slug: 'troca-disjuntor',
      description: 'Substituição de disjuntor no quadro de força',
      category_slug: 'eletrica',
      price_min: 15000,     // R$ 150
      price_max: 30000,     // R$ 300
      price_default: 20000, // R$ 200
      duration_min: 30,
      duration_max: 60,
      risk_level: RiskLevel.HIGH,
    },

    // Hidráulica
    {
      name: 'Desentupimento de Pia',
      slug: 'desentupimento-pia',
      description: 'Desentupimento de pia de cozinha ou banheiro',
      category_slug: 'hidraulica',
      price_min: 10000,     // R$ 100
      price_max: 20000,     // R$ 200
      price_default: 12000, // R$ 120
      duration_min: 30,
      duration_max: 90,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Troca de Torneira',
      slug: 'troca-torneira',
      description: 'Substituição de torneira de pia ou lavatório',
      category_slug: 'hidraulica',
      price_min: 8000,      // R$ 80
      price_max: 18000,     // R$ 180
      price_default: 10000, // R$ 100
      duration_min: 30,
      duration_max: 60,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Conserto de Descarga',
      slug: 'conserto-descarga',
      description: 'Reparo em válvula ou caixa de descarga',
      category_slug: 'hidraulica',
      price_min: 12000,     // R$ 120
      price_max: 25000,     // R$ 250
      price_default: 15000, // R$ 150
      duration_min: 45,
      duration_max: 90,
      risk_level: RiskLevel.LOW,
    },

    // Pintura
    {
      name: 'Pintura de Parede',
      slug: 'pintura-parede',
      description: 'Pintura de parede interna (até 20m²)',
      category_slug: 'pintura',
      price_min: 25000,     // R$ 250
      price_max: 50000,     // R$ 500
      price_default: 35000, // R$ 350
      duration_min: 180,
      duration_max: 360,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Pintura de Porta',
      slug: 'pintura-porta',
      description: 'Pintura de porta de madeira',
      category_slug: 'pintura',
      price_min: 15000,     // R$ 150
      price_max: 30000,     // R$ 300
      price_default: 20000, // R$ 200
      duration_min: 120,
      duration_max: 240,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Retoque de Pintura',
      slug: 'retoque-pintura',
      description: 'Pequenos retoques e correções de pintura',
      category_slug: 'pintura',
      price_min: 10000,     // R$ 100
      price_max: 20000,     // R$ 200
      price_default: 12000, // R$ 120
      duration_min: 60,
      duration_max: 120,
      risk_level: RiskLevel.LOW,
    },

    // Montagem
    {
      name: 'Montagem de Móvel',
      slug: 'montagem-movel',
      description: 'Montagem de móvel de médio porte (estante, rack, etc)',
      category_slug: 'montagem',
      price_min: 15000,     // R$ 150
      price_max: 35000,     // R$ 350
      price_default: 20000, // R$ 200
      duration_min: 90,
      duration_max: 180,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Instalação de Prateleira',
      slug: 'instalacao-prateleira',
      description: 'Instalação de prateleira ou nicho na parede',
      category_slug: 'montagem',
      price_min: 8000,      // R$ 80
      price_max: 18000,     // R$ 180
      price_default: 10000, // R$ 100
      duration_min: 30,
      duration_max: 60,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Instalação de TV',
      slug: 'instalacao-tv',
      description: 'Instalação de suporte e TV na parede',
      category_slug: 'montagem',
      price_min: 12000,     // R$ 120
      price_max: 25000,     // R$ 250
      price_default: 15000, // R$ 150
      duration_min: 45,
      duration_max: 90,
      risk_level: RiskLevel.MEDIUM,
    },

    // Clima Frio
    {
      name: 'Limpeza de Ar Condicionado',
      slug: 'limpeza-ar-condicionado',
      description: 'Limpeza e higienização de ar condicionado split',
      category_slug: 'clima-frio',
      price_min: 15000,     // R$ 150
      price_max: 30000,     // R$ 300
      price_default: 18000, // R$ 180
      duration_min: 60,
      duration_max: 120,
      risk_level: RiskLevel.LOW,
    },
    {
      name: 'Instalação de Aquecedor',
      slug: 'instalacao-aquecedor',
      description: 'Instalação de aquecedor a gás ou elétrico',
      category_slug: 'clima-frio',
      price_min: 20000,     // R$ 200
      price_max: 45000,     // R$ 450
      price_default: 30000, // R$ 300
      duration_min: 90,
      duration_max: 180,
      risk_level: RiskLevel.HIGH,
    },
    {
      name: 'Manutenção de Lareira',
      slug: 'manutencao-lareira',
      description: 'Limpeza e manutenção de lareira',
      category_slug: 'clima-frio',
      price_min: 25000,     // R$ 250
      price_max: 50000,     // R$ 500
      price_default: 35000, // R$ 350
      duration_min: 120,
      duration_max: 240,
      risk_level: RiskLevel.MEDIUM,
    },
  ];

  for (const mission of missions) {
    const { category_slug, ...missionData } = mission;
    await prisma.mission.upsert({
      where: { slug: mission.slug },
      update: {},
      create: {
        ...missionData,
        category_id: createdCategories[category_slug],
      },
    });
    console.log(`Created mission: ${mission.name}`);
  }

  // Create Specialties
  const specialties = [
    { name: 'Instalações Elétricas Residenciais', category_slug: 'eletrica' },
    { name: 'Manutenção de Quadros Elétricos', category_slug: 'eletrica' },
    { name: 'Encanamento Residencial', category_slug: 'hidraulica' },
    { name: 'Desentupimento', category_slug: 'hidraulica' },
    { name: 'Pintura Interna', category_slug: 'pintura' },
    { name: 'Pintura Externa', category_slug: 'pintura' },
    { name: 'Montagem de Móveis', category_slug: 'montagem' },
    { name: 'Instalações em Geral', category_slug: 'montagem' },
    { name: 'Climatização', category_slug: 'clima-frio' },
    { name: 'Aquecimento', category_slug: 'clima-frio' },
  ];

  const createdSpecialties: Record<string, string> = {};

  // Get existing specialties first
  const existingSpecialties = await prisma.specialty.findMany();
  for (const spec of existingSpecialties) {
    createdSpecialties[spec.name] = spec.id;
  }

  for (const specialty of specialties) {
    if (!createdSpecialties[specialty.name]) {
      const created = await prisma.specialty.create({
        data: {
          name: specialty.name,
          category_id: createdCategories[specialty.category_slug],
        },
      });
      createdSpecialties[specialty.name] = created.id;
      console.log(`Created specialty: ${specialty.name}`);
    } else {
      console.log(`Specialty already exists: ${specialty.name}`);
    }
  }

  // Create Professional Users
  const clientPassword = await bcrypt.hash('123456', 10);

  const professionals = [
    {
      email: 'joao.eletricista@email.com',
      phone: '54999001001',
      name: 'João da Silva',
      specialties: ['Instalações Elétricas Residenciais', 'Manutenção de Quadros Elétricos'],
      level: 'GOLD' as const,
      rating_avg: 4.8,
      total_jobs: 127,
      work_radius_km: 25,
      cpf_verified: true,
      selfie_verified: true,
      address_verified: true,
    },
    {
      email: 'maria.encanadora@email.com',
      phone: '54999001002',
      name: 'Maria Santos',
      specialties: ['Encanamento Residencial', 'Desentupimento'],
      level: 'PLATINUM' as const,
      rating_avg: 4.9,
      total_jobs: 203,
      work_radius_km: 30,
      cpf_verified: true,
      selfie_verified: true,
      address_verified: true,
    },
    {
      email: 'pedro.pintor@email.com',
      phone: '54999001003',
      name: 'Pedro Oliveira',
      specialties: ['Pintura Interna', 'Pintura Externa'],
      level: 'SILVER' as const,
      rating_avg: 4.5,
      total_jobs: 45,
      work_radius_km: 20,
      cpf_verified: true,
      selfie_verified: true,
      address_verified: false,
    },
    {
      email: 'ana.montagem@email.com',
      phone: '54999001004',
      name: 'Ana Rodrigues',
      specialties: ['Montagem de Móveis', 'Instalações em Geral'],
      level: 'BRONZE' as const,
      rating_avg: 4.2,
      total_jobs: 18,
      work_radius_km: 15,
      cpf_verified: true,
      selfie_verified: false,
      address_verified: false,
    },
    {
      email: 'carlos.clima@email.com',
      phone: '54999001005',
      name: 'Carlos Ferreira',
      specialties: ['Climatização', 'Aquecimento'],
      level: 'GOLD' as const,
      rating_avg: 4.7,
      total_jobs: 89,
      work_radius_km: 35,
      cpf_verified: true,
      selfie_verified: true,
      address_verified: true,
    },
  ];

  for (const pro of professionals) {
    const { specialties: specialtyNames, level, rating_avg, total_jobs, work_radius_km, cpf_verified, selfie_verified, address_verified, ...userData } = pro;

    const user = await prisma.user.upsert({
      where: { email: pro.email },
      update: {},
      create: {
        ...userData,
        password: clientPassword,
        role: Role.PROFESSIONAL,
        status: UserStatus.ACTIVE,
      },
    });

    await prisma.professional.upsert({
      where: { user_id: user.id },
      update: {
        level,
        rating_avg,
        total_jobs,
        work_radius_km,
        cpf_verified,
        selfie_verified,
        address_verified,
        specialties: {
          connect: specialtyNames.map(name => ({ id: createdSpecialties[name] })),
        },
      },
      create: {
        user_id: user.id,
        level,
        rating_avg,
        total_jobs,
        work_radius_km,
        cpf_verified,
        selfie_verified,
        address_verified,
        specialties: {
          connect: specialtyNames.map(name => ({ id: createdSpecialties[name] })),
        },
      },
    });

    console.log(`Created professional: ${pro.name}`);
  }

  // Create a test client user
  const client = await prisma.user.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      email: 'cliente@email.com',
      phone: '54999002001',
      name: 'Cliente Teste',
      password: clientPassword,
      role: Role.CLIENT,
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Created client: ${client.email}`);

  // Create address for client
  const clientAddress = await prisma.address.create({
    data: {
      user_id: client.id,
      label: 'Casa Principal',
      street: 'Rua A',
      number: '123',
      neighborhood: 'Centro',
      city: 'Caxias do Sul',
      state: 'RS',
      zip_code: '95010-000',
      latitude: -29.1668,
      longitude: -51.1822,
      is_default: true,
    },
  });
  console.log(`Created address for client`);

  // Get all missions to create ProfessionalServices
  const allMissions = await prisma.mission.findMany();
  const missionsBySlug: Record<string, string> = {};
  for (const m of allMissions) {
    missionsBySlug[m.slug] = m.id;
  }

  // Create ProfessionalServices (services menu) for each professional
  const professionalsData = await prisma.professional.findMany({ include: { user: true } });

  for (const pro of professionalsData) {
    // João (Eletricista)
    if (pro.user.email === 'joao.eletricista@email.com') {
      await prisma.professionalService.upsert({
        where: { professional_id_mission_id: { professional_id: pro.id, mission_id: missionsBySlug['troca-tomada'] } },
        update: {},
        create: {
          professional_id: pro.id,
          mission_id: missionsBySlug['troca-tomada'],
          price_min: 8000,
          price_max: 15000,
          description: 'Troca de tomada simples com qualidade premium',
          is_active: true,
        },
      });

      await prisma.professionalService.upsert({
        where: { professional_id_mission_id: { professional_id: pro.id, mission_id: missionsBySlug['instalacao-luminaria'] } },
        update: {},
        create: {
          professional_id: pro.id,
          mission_id: missionsBySlug['instalacao-luminaria'],
          price_min: 15000,
          price_max: 30000,
          description: 'Instalação de luminária com garantia',
          is_active: true,
        },
      });
    }

    // Maria (Encanadora)
    if (pro.user.email === 'maria.encanadora@email.com') {
      await prisma.professionalService.upsert({
        where: { professional_id_mission_id: { professional_id: pro.id, mission_id: missionsBySlug['desentupimento-pia'] } },
        update: {},
        create: {
          professional_id: pro.id,
          mission_id: missionsBySlug['desentupimento-pia'],
          price_min: 12000,
          price_max: 25000,
          description: 'Desentupimento com equipamento profissional',
          is_active: true,
        },
      });
    }

    // Pedro (Pintor)
    if (pro.user.email === 'pedro.pintor@email.com') {
      await prisma.professionalService.upsert({
        where: { professional_id_mission_id: { professional_id: pro.id, mission_id: missionsBySlug['pintura-parede'] } },
        update: {},
        create: {
          professional_id: pro.id,
          mission_id: missionsBySlug['pintura-parede'],
          price_min: 30000,
          price_max: 60000,
          description: 'Pintura de parede com acabamento profissional',
          is_active: true,
        },
      });
    }
  }

  console.log(`Created professional services`);

  // Create test Jobs with PENDING_QUOTE status
  const joaoUser = professionalsData.find(p => p.user.email === 'joao.eletricista@email.com')?.user;
  const mariaUser = professionalsData.find(p => p.user.email === 'maria.encanadora@email.com')?.user;

  if (joaoUser && mariaUser) {
    // Job 1 - Awaiting quote from João
    const job1 = await prisma.job.create({
      data: {
        code: `CS-${Date.now()}-001`,
        client_id: client.id,
        mission_id: missionsBySlug['troca-tomada'],
        address_id: clientAddress.id,
        status: JobStatus.PENDING_QUOTE,
        diagnosis_answers: {
          tipo_tomada: 'dupla',
          local: 'sala',
        },
        photos_before: ['https://picsum.photos/800/600?random=1'],
        price_estimated: 10000,
        scheduled_date: new Date('2025-01-25'),
        scheduled_window: 'Tarde',
      },
    });
    console.log(`Created job 1 (pending quote)`);

    // Job 2 - Awaiting quote from Maria
    const job2 = await prisma.job.create({
      data: {
        code: `CS-${Date.now()}-002`,
        client_id: client.id,
        mission_id: missionsBySlug['desentupimento-pia'],
        address_id: clientAddress.id,
        status: JobStatus.PENDING_QUOTE,
        diagnosis_answers: {
          local: 'cozinha',
          entupimento: 'total',
        },
        photos_before: ['https://picsum.photos/800/600?random=2'],
        price_estimated: 12000,
        scheduled_date: new Date('2025-01-26'),
        scheduled_window: 'Manhã',
      },
    });
    console.log(`Created job 2 (pending quote)`);

    // Create Quotes for Job 1 from João
    await prisma.quote.create({
      data: {
        job_id: job1.id,
        professional_id: joaoUser.id,
        amount: 12000,
        notes: 'Troca com material de qualidade premium. Garanto por 1 ano.',
        available_dates: ['2025-01-25T14:00', '2025-01-26T09:00', '2025-01-27T14:00'],
        status: QuoteStatus.PENDING,
      },
    });
    console.log(`Created quote for job 1 from João`);

    // Create Quotes for Job 2 from Maria
    await prisma.quote.create({
      data: {
        job_id: job2.id,
        professional_id: mariaUser.id,
        amount: 15000,
        notes: 'Vou usar equipamento de alta pressão. Problema resolvido garantido!',
        available_dates: ['2025-01-26T09:00', '2025-01-27T10:00'],
        status: QuoteStatus.PENDING,
      },
    });
    console.log(`Created quote for job 2 from Maria`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
