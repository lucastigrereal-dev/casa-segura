-- ================================================
-- MIGRATION: Referral Program & Credits System
-- Date: 02/02/2026
-- Description: Adiciona sistema completo de indicações
-- ================================================

-- 1. Criar tabela de códigos de indicação
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL UNIQUE,
  bonus_amount INTEGER NOT NULL DEFAULT 5000, -- R$ 50 em centavos
  max_uses INTEGER NOT NULL DEFAULT 999,
  times_used INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_active ON referral_codes(is_active) WHERE is_active = true;

-- 2. Criar tabela de uso de códigos
CREATE TABLE IF NOT EXISTS referral_uses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL REFERENCES referral_codes(code) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES users(id),
  referred_id UUID NOT NULL REFERENCES users(id),
  bonus_amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_referral_uses_referrer ON referral_uses(referrer_id);
CREATE INDEX idx_referral_uses_referred ON referral_uses(referred_id);
CREATE INDEX idx_referral_uses_code ON referral_uses(code);
CREATE INDEX idx_referral_uses_status ON referral_uses(status);

-- 3. Criar tabela de créditos dos usuários
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índice para user_id único
CREATE UNIQUE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- 4. Criar tabela de transações de crédito
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Pode ser negativo (uso) ou positivo (ganho)
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  job_id UUID,
  referral_id UUID,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(type);

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Listar tabelas criadas
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('referral_codes', 'referral_uses', 'user_credits', 'credit_transactions');

-- Verificar estrutura
\d referral_codes
\d referral_uses
\d user_credits
\d credit_transactions

-- ================================================
-- QUERIES ÚTEIS PARA TESTE
-- ================================================

-- Ver todos os códigos de indicação
SELECT
  rc.code,
  u.name AS owner_name,
  rc.times_used,
  rc.is_active,
  rc.created_at
FROM referral_codes rc
JOIN users u ON u.id = rc.user_id
ORDER BY rc.created_at DESC;

-- Ver indicações de um usuário específico
SELECT
  ru.status,
  referred.name AS referred_name,
  ru.bonus_amount,
  ru.created_at,
  ru.completed_at
FROM referral_uses ru
JOIN users referred ON referred.id = ru.referred_id
WHERE ru.referrer_id = 'USER_ID_AQUI'
ORDER BY ru.created_at DESC;

-- Ver saldo de créditos de um usuário
SELECT
  u.name,
  COALESCE(uc.amount, 0) AS balance_cents,
  ROUND(COALESCE(uc.amount, 0) / 100.0, 2) AS balance_reais
FROM users u
LEFT JOIN user_credits uc ON uc.user_id = u.id
WHERE u.id = 'USER_ID_AQUI';

-- Ver transações de crédito de um usuário
SELECT
  ct.type,
  ct.description,
  ct.amount AS amount_cents,
  ROUND(ct.amount / 100.0, 2) AS amount_reais,
  ct.balance_after AS balance_after_cents,
  ROUND(ct.balance_after / 100.0, 2) AS balance_after_reais,
  ct.created_at
FROM credit_transactions ct
WHERE ct.user_id = 'USER_ID_AQUI'
ORDER BY ct.created_at DESC
LIMIT 20;

-- Estatísticas gerais do programa
SELECT
  COUNT(DISTINCT rc.id) AS total_codes,
  COUNT(DISTINCT ru.id) AS total_uses,
  COUNT(DISTINCT CASE WHEN ru.status = 'COMPLETED' THEN ru.id END) AS completed_uses,
  COUNT(DISTINCT CASE WHEN ru.status = 'PENDING' THEN ru.id END) AS pending_uses,
  SUM(CASE WHEN ru.status = 'COMPLETED' THEN ru.bonus_amount * 2 ELSE ru.bonus_amount END) AS total_credits_distributed
FROM referral_codes rc
LEFT JOIN referral_uses ru ON ru.code = rc.code;

-- Top 10 indicadores
SELECT
  u.name,
  u.email,
  COUNT(ru.id) AS total_referrals,
  COUNT(CASE WHEN ru.status = 'COMPLETED' THEN 1 END) AS completed_referrals,
  SUM(CASE WHEN ru.status = 'COMPLETED' THEN ru.bonus_amount * 2 ELSE ru.bonus_amount END) AS total_earned
FROM users u
JOIN referral_uses ru ON ru.referrer_id = u.id
GROUP BY u.id, u.name, u.email
ORDER BY completed_referrals DESC, total_referrals DESC
LIMIT 10;

-- ================================================
-- ROLLBACK (se necessário)
-- ================================================

/*
-- CUIDADO! Isso remove todas as tabelas e dados

DROP TABLE IF EXISTS credit_transactions CASCADE;
DROP TABLE IF EXISTS user_credits CASCADE;
DROP TABLE IF EXISTS referral_uses CASCADE;
DROP TABLE IF EXISTS referral_codes CASCADE;
*/

-- ================================================
-- FIM DA MIGRATION
-- ================================================
