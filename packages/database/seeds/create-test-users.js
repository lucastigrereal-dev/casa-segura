/**
 * Script para criar usuários de teste
 * Uso: node create-test-users.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Criando usuários de teste...\n');

  // Hash da senha "123456"
  const passwordHash = await bcrypt.hash('123456', 10);

  try {
    // ============================================
    // 1. CRIAR USUÁRIO CLIENTE
    // ============================================
    console.log('📝 Criando Cliente...');
    const cliente = await prisma.user.upsert({
      where: { email: 'cliente@test.com' },
      update: {
        password_hash: passwordHash,
        name: 'Cliente Teste',
        phone: '11999999991',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'cliente@test.com',
        password_hash: passwordHash,
        name: 'Cliente Teste',
        phone: '11999999991',
        role: 'CLIENT',
        cpf: '12345678901',
        email_verified: true,
      },
    });
    console.log('✅ Cliente criado:', cliente.email);

    // ============================================
    // 2. CRIAR USUÁRIO PROFISSIONAL
    // ============================================
    console.log('\n📝 Criando Profissional...');
    const profissional = await prisma.user.upsert({
      where: { email: 'pro@test.com' },
      update: {
        password_hash: passwordHash,
        name: 'Profissional Teste',
        phone: '11999999992',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000002',
        email: 'pro@test.com',
        password_hash: passwordHash,
        name: 'Profissional Teste',
        phone: '11999999992',
        role: 'PROFESSIONAL',
        cpf: '12345678902',
        email_verified: true,
      },
    });
    console.log('✅ Profissional criado:', profissional.email);

    // ============================================
    // 3. CRIAR PERFIL PROFISSIONAL
    // ============================================
    console.log('\n📝 Criando perfil profissional...');
    const professional = await prisma.professional.upsert({
      where: { user_id: profissional.id },
      update: {
        is_available: true,
        level: 'PREMIUM',
      },
      create: {
        id: '00000000-0000-0000-0000-000000000003',
        user_id: profissional.id,
        level: 'PREMIUM',
        is_available: true,
        rating_avg: 4.8,
        total_jobs: 127,
        cpf_verified: true,
        selfie_verified: true,
        address_verified: true,
      },
    });
    console.log('✅ Perfil profissional criado');

    // ============================================
    // 4. ADICIONAR SERVIÇOS
    // ============================================
    console.log('\n📝 Adicionando serviços...');

    await prisma.professionalService.upsert({
      where: { id: '00000000-0000-0000-0000-000000000004' },
      update: { active: true },
      create: {
        id: '00000000-0000-0000-0000-000000000004',
        professional_id: professional.id,
        service_type: 'ELETRICA',
        base_price: 15000, // R$ 150,00
        description: 'Instalações elétricas, manutenção e reparos. 5 anos de experiência.',
        active: true,
      },
    });
    console.log('  ✓ Serviço Elétrica adicionado');

    await prisma.professionalService.upsert({
      where: { id: '00000000-0000-0000-0000-000000000005' },
      update: { active: true },
      create: {
        id: '00000000-0000-0000-0000-000000000005',
        professional_id: professional.id,
        service_type: 'HIDRAULICA',
        base_price: 12000, // R$ 120,00
        description: 'Reparos hidráulicos, vazamentos, torneiras.',
        active: true,
      },
    });
    console.log('  ✓ Serviço Hidráulica adicionado');

    // ============================================
    // VERIFICAÇÃO
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ USUÁRIOS CRIADOS COM SUCESSO!');
    console.log('='.repeat(50));

    console.log('\n👤 CLIENTE:');
    console.log('   Email: cliente@test.com');
    console.log('   Senha: 123456');
    console.log('   Login: http://localhost:3000');

    console.log('\n👷 PROFISSIONAL:');
    console.log('   Email: pro@test.com');
    console.log('   Senha: 123456');
    console.log('   Login: http://localhost:3002');
    console.log('   Nível: PREMIUM');
    console.log('   Rating: 4.8 ⭐');
    console.log('   Serviços: Elétrica (R$ 150), Hidráulica (R$ 120)');

    console.log('\n🎯 PRÓXIMO PASSO:');
    console.log('   1. Login como Cliente em http://localhost:3000');
    console.log('   2. Login como Profissional em http://localhost:3002');
    console.log('   3. Seguir guia: TESTE_CHAT_PASSO_A_PASSO.md');
    console.log('\n');

  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
