# 🚀 PROGRAMA DE INDICAÇÃO - COMECE AQUI

## ✅ STATUS: CÓDIGO 100% COMPLETO!

**Total**: ~1500 linhas de código prontas
**Tempo**: ~2-3 horas de implementação
**Valor**: Sistema completo de viralização

---

## 🎯 O QUE É

Sistema completo de indicação estilo Uber:
- **R$ 50** para cada pessoa no cadastro
- **R$ 50 extra** quando completa 1º job
- **Total: R$ 100** por indicação completa

**Bônus Especiais**:
- 5 indicações = **R$ 1.000** + Badge Ouro
- 10 indicações = **R$ 2.500** + 0% comissão por 30 dias

---

## 🏃‍♂️ INICIAR AGORA (3 PASSOS)

### 1. Subir Banco PostgreSQL
```bash
# Opção A: Docker Desktop (recomendado)
# Abrir Docker Desktop e iniciar

# Opção B: Serviço Windows
net start postgresql-x64-14

# Opção C: Ver COMECE_AQUI.txt para instruções completas
```

### 2. Rodar Migration
```bash
cd C:\Users\lucas\casa-segura\packages\database

# Opção A: Prisma (automático)
npx prisma migrate dev --name add_referral_program
npx prisma generate

# Opção B: SQL Manual
psql -U postgres -d casasegura -f migrations_manual/referral_program.sql
```

### 3. Reiniciar Backend
```bash
cd C:\Users\lucas\casa-segura\apps\api

# Ctrl+C no terminal do backend
npm run dev

# Verificar logs: "ReferralsModule loaded" ✅
```

---

## 🧪 TESTAR (5 MINUTOS)

### Teste 1: Ver Seu Código
1. Abrir: http://localhost:3000/convide-amigos
2. ✓ Ver código: CASA-SEU-NOME-XYZ
3. ✓ Ver botões WhatsApp/Facebook
4. ✓ Ver estatísticas zeradas

### Teste 2: Cadastro com Código
1. Copiar seu código
2. Abrir navegador anônimo
3. Cadastrar novo usuário com código
4. ✓ Ver "Você ganhou R$ 50 de bônus!"
5. Voltar para sua conta
6. ✓ Ver saldo: R$ 50,00
7. ✓ Ver "1 indicação pendente"

### Teste 3: Completar Indicação
1. Com usuário indicado, criar job
2. Simular fluxo completo até aprovação
3. ✓ Sua conta: saldo vira R$ 100,00
4. ✓ Estatísticas: "1 indicação completa"

---

## 📂 ARQUIVOS CRIADOS

### Backend (9 arquivos)
```
apps/api/src/modules/referrals/
├── referrals.module.ts         (módulo)
├── referrals.service.ts        (350 linhas - lógica)
├── referrals.controller.ts     (endpoints REST)
└── credits.service.ts          (250 linhas - créditos)

Integrações:
├── auth/auth.service.ts        (aplica código no cadastro)
├── auth/auth.module.ts         (import ReferralsModule)
├── jobs/jobs.service.ts        (completa no 1º job)
├── jobs/jobs.module.ts         (import ReferralsModule)
└── app.module.ts               (registra módulo)
```

### Database
```
packages/database/
├── prisma/schema.prisma        (4 novos models)
└── migrations_manual/
    └── referral_program.sql    (SQL manual)
```

### Frontend web-client (3 arquivos)
```
apps/web-client/
├── lib/api.ts                      (novos endpoints)
├── app/(main)/convide-amigos/
│   └── page.tsx                    (600 linhas - página bonita)
└── components/
    └── credits-badge.tsx           (badge no header)
```

### Frontend web-pro (copiados)
```
apps/web-pro/
├── lib/api.ts
├── app/(main)/convide-amigos/page.tsx
└── components/credits-badge.tsx
```

### Docs
```
REFERRAL_PROGRAM_COMPLETO.md    (doc completo)
COMECE_AQUI_REFERRAL.md         (este arquivo)
```

---

## 🎨 PREVIEW DA PÁGINA

```
┌─────────────────────────────────────────┐
│  🎁 Ganhe R$ 100 por amigo!             │
│  Convide amigos e ambos ganham...       │
├─────────────────────────────────────────┤
│  Seu código: CASA-LUCAS-ABC123 [📋]     │
│  [WhatsApp] [Facebook]                   │
├─────────────────────────────────────────┤
│  👥 5 indicações   💰 R$ 400   🎯 2/5    │
├─────────────────────────────────────────┤
│  📋 Suas Indicações:                     │
│  • João Silva - Completo - R$ 100 ✓     │
│  • Maria Santos - Pendente - R$ 50 ⏳   │
└─────────────────────────────────────────┘
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Can't reach database"
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -c "SELECT version();"

# Se não, iniciar:
net start postgresql-x64-14
```

### Erro: "Module not found ReferralsService"
```bash
# Recompilar
cd apps/api
rm -rf dist
npm run build
npm run dev
```

### Erro: "referral_codes table does not exist"
```bash
# Rodar migration SQL manual
cd packages/database
psql -U postgres -d casasegura -f migrations_manual/referral_program.sql
```

---

## 📊 ENDPOINTS DISPONÍVEIS

### REST API
```bash
# Buscar meu código
GET /api/referrals/my-code
Authorization: Bearer TOKEN

# Estatísticas
GET /api/referrals/my-stats
Authorization: Bearer TOKEN

# Validar código
POST /api/referrals/validate
{ "code": "CASA-TESTE-ABC" }

# Saldo de créditos
GET /api/referrals/credits/balance
Authorization: Bearer TOKEN

# Histórico
GET /api/referrals/credits/transactions?page=1&limit=20
Authorization: Bearer TOKEN
```

---

## 💡 DICAS PRO

### 1. Adicionar Badge no Header
```tsx
// apps/web-client/components/layout/header.tsx
import { CreditsBadge } from '@/components/credits-badge';

// No JSX:
<CreditsBadge />
```

### 2. Enviar Notificações
```typescript
// Quando alguém usa seu código
await notificationsService.create({
  user_id: referrer.id,
  type: 'REFERRAL_BONUS',
  title: 'Novo amigo indicado! 🎉',
  message: `${referred.name} usou seu código! Você ganhou R$ 50`,
});
```

### 3. Analytics
```typescript
// Track indicações no Google Analytics
gtag('event', 'referral_completed', {
  referrer_id: userId,
  referred_id: referredId,
  bonus_amount: 10000, // R$ 100
});
```

---

## 🎯 MÉTRICAS DE SUCESSO

**Semana 1**:
- ✅ 50 códigos gerados
- ✅ 10 indicações completas
- ✅ R$ 1.000 distribuídos

**Mês 1**:
- ✅ 500 códigos gerados
- ✅ 100 indicações completas
- ✅ R$ 10.000 distribuídos
- ✅ 5 usuários com milestone de 5

**Mês 3**:
- ✅ 2.000 códigos gerados
- ✅ 500 indicações completas
- ✅ R$ 50.000 distribuídos
- ✅ 20 usuários com milestone de 10

---

## 🚀 PRÓXIMOS PASSOS

1. **[x] Código Completo** - FEITO!
2. **[ ] Subir Banco** - Iniciar PostgreSQL
3. **[ ] Rodar Migration** - Criar tabelas
4. **[ ] Testar E2E** - Cadastro + Indicação
5. **[ ] Deploy Production** - Subir pro Railway
6. **[ ] Marketing** - Divulgar programa

---

## 📞 SUPORTE

**Documentação Completa**:
- Ver: `REFERRAL_PROGRAM_COMPLETO.md`

**Migration SQL**:
- Ver: `packages/database/migrations_manual/referral_program.sql`

**Estratégia de Growth**:
- Ver: `ESTRATEGIA_CRESCIMENTO_VIRAL.md`

---

## ✅ CHECKLIST RÁPIDO

- [ ] Banco PostgreSQL rodando
- [ ] Migration executada
- [ ] Backend reiniciado
- [ ] Abrir http://localhost:3000/convide-amigos
- [ ] Ver código gerado
- [ ] Testar cadastro com código
- [ ] Verificar R$ 50 para ambos
- [ ] Testar 1º job completa
- [ ] Verificar R$ 100 total

---

**🎉 TUDO PRONTO! Só falta subir o banco e testar!**

```bash
# COMANDO ÚNICO PARA RODAR TUDO:
cd C:\Users\lucas\casa-segura && \
cd packages/database && npx prisma migrate dev --name add_referral_program && \
cd ../../apps/api && npm run dev
```
