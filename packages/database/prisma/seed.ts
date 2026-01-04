import { PrismaClient, Role, UserStatus, RiskLevel } from '@prisma/client';
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

  for (const specialty of specialties) {
    await prisma.specialty.create({
      data: {
        name: specialty.name,
        category_id: createdCategories[specialty.category_slug],
      },
    });
    console.log(`Created specialty: ${specialty.name}`);
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
