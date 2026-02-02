-- ============================================
-- SCRIPT: Criar Usuários de Teste
-- Propósito: Inserir Cliente e Profissional para testar Chat
-- Data: 01/02/2026
-- ============================================

-- LIMPAR dados de teste anteriores (opcional - descomente se quiser limpar)
-- DELETE FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE job_id IN (SELECT id FROM jobs WHERE client_id IN (SELECT id FROM users WHERE email LIKE '%@test.com')));
-- DELETE FROM conversations WHERE job_id IN (SELECT id FROM jobs WHERE client_id IN (SELECT id FROM users WHERE email LIKE '%@test.com'));
-- DELETE FROM notifications WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
-- DELETE FROM quotes WHERE job_id IN (SELECT id FROM jobs WHERE client_id IN (SELECT id FROM users WHERE email LIKE '%@test.com'));
-- DELETE FROM jobs WHERE client_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
-- DELETE FROM professional_services WHERE professional_id IN (SELECT id FROM professionals WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com'));
-- DELETE FROM professionals WHERE user_id IN (SELECT id FROM users WHERE email LIKE '%@test.com');
-- DELETE FROM users WHERE email LIKE '%@test.com';

-- ============================================
-- 1. CRIAR USUÁRIO CLIENTE
-- ============================================
-- Email: cliente@test.com
-- Senha: 123456 (hash bcrypt abaixo)
-- Tipo: CLIENT

INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    phone,
    role,
    cpf,
    email_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'cliente@test.com',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FGJYwGnJG3xW5hzZ0DKqBjwB5fP6dYy', -- Senha: 123456
    'Cliente Teste',
    '11999999991',
    'CLIENT',
    '12345678901',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- 2. CRIAR USUÁRIO PROFISSIONAL
-- ============================================
-- Email: pro@test.com
-- Senha: 123456
-- Tipo: PROFESSIONAL

INSERT INTO users (
    id,
    email,
    password_hash,
    name,
    phone,
    role,
    cpf,
    email_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000002',
    'pro@test.com',
    '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FGJYwGnJG3xW5hzZ0DKqBjwB5fP6dYy', -- Senha: 123456
    'Profissional Teste',
    '11999999992',
    'PROFESSIONAL',
    '12345678902',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    updated_at = NOW();

-- ============================================
-- 3. CRIAR PERFIL PROFISSIONAL
-- ============================================

INSERT INTO professionals (
    id,
    user_id,
    level,
    is_available,
    rating_avg,
    total_jobs,
    cpf_verified,
    selfie_verified,
    address_verified,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    'PREMIUM',
    true,
    4.8,
    127,
    true,
    true,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (user_id) DO UPDATE SET
    is_available = EXCLUDED.is_available,
    updated_at = NOW();

-- ============================================
-- 4. ADICIONAR SERVIÇOS DO PROFISSIONAL
-- ============================================

-- Serviço: Elétrica
INSERT INTO professional_services (
    id,
    professional_id,
    service_type,
    base_price,
    description,
    active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000003',
    'ELETRICA',
    15000, -- R$ 150,00
    'Instalações elétricas, manutenção e reparos. 5 anos de experiência.',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    active = EXCLUDED.active,
    updated_at = NOW();

-- Serviço: Hidráulica
INSERT INTO professional_services (
    id,
    professional_id,
    service_type,
    base_price,
    description,
    active,
    created_at,
    updated_at
) VALUES (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000003',
    'HIDRAULICA',
    12000, -- R$ 120,00
    'Reparos hidráulicos, vazamentos, torneiras.',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    active = EXCLUDED.active,
    updated_at = NOW();

-- ============================================
-- VERIFICAÇÃO
-- ============================================

-- Ver usuários criados
SELECT
    id,
    email,
    name,
    role,
    email_verified,
    created_at
FROM users
WHERE email IN ('cliente@test.com', 'pro@test.com')
ORDER BY role;

-- Ver profissional
SELECT
    p.id,
    u.name,
    u.email,
    p.level,
    p.is_available,
    p.rating_avg,
    p.total_jobs
FROM professionals p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'pro@test.com';

-- Ver serviços do profissional
SELECT
    ps.service_type,
    ps.base_price / 100.0 as price_reais,
    ps.description,
    ps.active
FROM professional_services ps
WHERE ps.professional_id = '00000000-0000-0000-0000-000000000003'
ORDER BY ps.service_type;

-- ============================================
-- SUCESSO! ✅
-- ============================================
-- Usuários criados:
--
-- CLIENTE:
--   Email: cliente@test.com
--   Senha: 123456
--   Login em: http://localhost:3000
--
-- PROFISSIONAL:
--   Email: pro@test.com
--   Senha: 123456
--   Login em: http://localhost:3002
--   Serviços: Elétrica, Hidráulica
--   Rating: 4.8 ⭐
-- ============================================
