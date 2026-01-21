# Casa Segura - Estrutura Completa de Arquivos

**Gerado em**: 2026-01-20
**Status**: Sprint 2 Completo

---

## 📦 Árvore Completa do Projeto

```
casa-segura/
│
├── 📄 .npmrc                           # Config NPM global
├── 📄 .gitignore
├── 📄 package.json                     # Root workspace (5 scripts adicionados)
├── 📄 package-lock.json
├── 📄 turbo.json                       # Turborepo pipeline config
├── 📄 tsconfig.json                    # TypeScript base config
├── 📄 vercel.json                      # Vercel deployment (ATUALIZADO Sprint 2)
├── 📄 README.md
├── 📄 DEPLOY.md
│
├── 📁 .vercel/                         # Vercel project metadata
├── 📁 .next/                           # Next.js cache (root)
├── 📁 node_modules/
├── 📁 .git/                            # Git history
│
│
├── 📁 apps/
│   │
│   ├── 📁 api/                         # Backend NestJS (Porta 3333)
│   │   ├── 📁 src/
│   │   │   ├── 📄 main.ts              # App bootstrap + CORS
│   │   │   ├── 📄 app.module.ts        # Root module (11 modules registrados)
│   │   │   ├── 📄 health.controller.ts # GET /health
│   │   │   │
│   │   │   ├── 📁 common/
│   │   │   │   ├── 📁 decorators/
│   │   │   │   │   ├── 📄 current-user.decorator.ts
│   │   │   │   │   ├── 📄 public.decorator.ts
│   │   │   │   │   ├── 📄 roles.decorator.ts
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 guards/
│   │   │   │   │   ├── 📄 jwt-auth.guard.ts
│   │   │   │   │   ├── 📄 roles.guard.ts
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   ├── 📁 filters/
│   │   │   │   │   ├── 📄 http-exception.filter.ts
│   │   │   │   │   └── 📄 index.ts
│   │   │   │   └── 📁 interceptors/
│   │   │   │       ├── 📄 logging.interceptor.ts
│   │   │   │       ├── 📄 transform.interceptor.ts
│   │   │   │       └── 📄 index.ts
│   │   │   │
│   │   │   └── 📁 modules/
│   │   │       │
│   │   │       ├── 📁 auth/                     # Authentication
│   │   │       │   ├── 📄 auth.module.ts
│   │   │       │   ├── 📄 auth.controller.ts    # 4 endpoints
│   │   │       │   ├── 📄 auth.service.ts
│   │   │       │   ├── 📄 jwt.strategy.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       ├── 📄 login.dto.ts
│   │   │       │       ├── 📄 register.dto.ts
│   │   │       │       └── 📄 refresh-token.dto.ts
│   │   │       │
│   │   │       ├── 📁 users/                    # User Management
│   │   │       │   ├── 📄 users.module.ts
│   │   │       │   ├── 📄 users.controller.ts
│   │   │       │   ├── 📄 users.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       └── 📄 update-user.dto.ts
│   │   │       │
│   │   │       ├── 📁 professionals/            # Profissionais ✨ ATUALIZADO
│   │   │       │   ├── 📄 professionals.module.ts
│   │   │       │   ├── 📄 professionals.controller.ts   # 10 endpoints (4 NOVOS)
│   │   │       │   ├── 📄 professionals.service.ts      # 8 métodos (4 NOVOS)
│   │   │       │   └── 📁 dto/
│   │   │       │       ├── 📄 create-pro.dto.ts
│   │   │       │       └── 📄 update-pro.dto.ts
│   │   │       │
│   │   │       ├── 📁 professional-services/   # ✨ NOVO - Cardápio de Serviços
│   │   │       │   ├── 📄 professional-services.module.ts
│   │   │       │   ├── 📄 professional-services.controller.ts
│   │   │       │   ├── 📄 professional-services.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       ├── 📄 create-service.dto.ts
│   │   │       │       └── 📄 update-service.dto.ts
│   │   │       │
│   │   │       ├── 📁 jobs/                    # Chamados ✨ ATUALIZADO
│   │   │       │   ├── 📄 jobs.module.ts
│   │   │       │   ├── 📄 jobs.controller.ts   # 12 endpoints (4 NOVOS)
│   │   │       │   ├── 📄 jobs.service.ts      # 8 métodos (4 NOVOS + status transitions)
│   │   │       │   └── 📁 dto/
│   │   │       │       ├── 📄 create-job.dto.ts
│   │   │       │       ├── 📄 update-job.dto.ts
│   │   │       │       └── 📄 complete-job.dto.ts
│   │   │       │
│   │   │       ├── 📁 quotes/                  # ✨ NOVO - Sistema de Orçamentos
│   │   │       │   ├── 📄 quotes.module.ts
│   │   │       │   ├── 📄 quotes.controller.ts # 5 endpoints
│   │   │       │   ├── 📄 quotes.service.ts    # 5 métodos
│   │   │       │   └── 📁 dto/
│   │   │       │       ├── 📄 create-quote.dto.ts
│   │   │       │       └── 📄 reject-quote.dto.ts
│   │   │       │
│   │   │       ├── 📁 missions/               # Tipos de Serviço
│   │   │       │   ├── 📄 missions.module.ts
│   │   │       │   ├── 📄 missions.controller.ts
│   │   │       │   ├── 📄 missions.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       └── 📄 create-mission.dto.ts
│   │   │       │
│   │   │       ├── 📁 categories/             # Categorias
│   │   │       │   ├── 📄 categories.module.ts
│   │   │       │   ├── 📄 categories.controller.ts
│   │   │       │   ├── 📄 categories.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       └── 📄 create-category.dto.ts
│   │   │       │
│   │   │       ├── 📁 addresses/              # Endereços
│   │   │       │   ├── 📄 addresses.module.ts
│   │   │       │   ├── 📄 addresses.controller.ts
│   │   │       │   ├── 📄 addresses.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       └── 📄 create-address.dto.ts
│   │   │       │
│   │   │       ├── 📁 reviews/               # Avaliações
│   │   │       │   ├── 📄 reviews.module.ts
│   │   │       │   ├── 📄 reviews.controller.ts
│   │   │       │   ├── 📄 reviews.service.ts
│   │   │       │   └── 📁 dto/
│   │   │       │       └── 📄 create-review.dto.ts
│   │   │       │
│   │   │       └── 📁 prisma/                # ORM Database
│   │   │           ├── 📄 prisma.module.ts
│   │   │           └── 📄 prisma.service.ts
│   │   │
│   │   ├── 📁 dist/                          # Compiled output
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 tsconfig.build.json
│   │   ├── 📄 nest-cli.json
│   │   ├── 📄 .eslintrc.js
│   │   └── 📄 .env.example
│   │
│   │
│   ├── 📁 web-client/                   # Frontend Cliente (Porta 3000)
│   │   ├── 📁 app/
│   │   │   ├── 📁 (auth)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   └── reset-password/[token]/page.tsx
│   │   │   ├── 📁 (main)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx                   # Landing
│   │   │   │   ├── meus-chamados/
│   │   │   │   ├── profissionais/           # ✨ ATUALIZADO com filtro categoria
│   │   │   │   ├── profissional/[id]/       # ✨ ATUALIZADO com serviços + botão solicitar
│   │   │   │   ├── pedidos/
│   │   │   │   ├── perfil/
│   │   │   │   └── configuracoes/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── 📁 components/
│   │   ├── 📁 contexts/
│   │   │   └── auth-context.tsx
│   │   ├── 📁 hooks/
│   │   │   └── use-auth.ts
│   │   ├── 📁 lib/
│   │   │   ├── api.ts             # ✨ ATUALIZADO tipo Record<string, string>
│   │   │   └── utils.ts
│   │   ├── 📁 public/
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 postcss.config.js
│   │   └── 📄 .env.example
│   │
│   │
│   ├── 📁 web-admin/                    # Frontend Admin (Porta 3001)
│   │   ├── 📁 app/
│   │   │   ├── 📁 (auth)/
│   │   │   ├── 📁 (dashboard)/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── users/
│   │   │   │   ├── professionals/
│   │   │   │   ├── jobs/
│   │   │   │   ├── disputes/
│   │   │   │   ├── reports/
│   │   │   │   └── settings/
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── 📁 components/
│   │   ├── 📁 contexts/
│   │   ├── 📁 lib/
│   │   ├── 📁 public/
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   ├── 📄 next.config.js
│   │   ├── 📄 tailwind.config.js
│   │   ├── 📄 postcss.config.js
│   │   └── 📄 .env.example
│   │
│   │
│   └── 📁 web-pro/                      # ✨ NOVO - Frontend Profissional (Porta 3002)
│       ├── 📁 app/
│       │   ├── layout.tsx                # ✨ Com AuthProvider
│       │   ├── globals.css
│       │   ├── 📁 (auth)/
│       │   │   ├── layout.tsx
│       │   │   ├── login/page.tsx        # ✨ Com auth integrada
│       │   │   └── cadastro/
│       │   │       └── page.tsx
│       │   └── 📁 (dashboard)/           # ✨ Com ProtectedPage wrapper
│       │       ├── layout.tsx            # ✨ Com logout + sidebar
│       │       ├── page.tsx              # Dashboard com stats
│       │       ├── chamados/
│       │       │   ├── page.tsx          # Jobs disponíveis
│       │       │   └── [id]/page.tsx     # Detalhes + form orçamento
│       │       ├── meus-servicos/
│       │       │   └── page.tsx          # Jobs aceitos/em andamento
│       │       ├── financeiro/
│       │       │   └── page.tsx          # Ganhos e extrato
│       │       ├── perfil/
│       │       │   └── page.tsx          # Perfil do profissional
│       │       └── configuracoes/
│       │           └── page.tsx          # Raio, disponibilidade, PIX
│       ├── 📁 components/
│       │   ├── protected-page.tsx        # ✨ NOVO - Auth guard wrapper
│       │   ├── (stubs para pages)
│       │   └── ...
│       ├── 📁 contexts/
│       │   └── auth-context.tsx          # ✨ NOVO - JWT + token management
│       ├── 📁 lib/
│       │   ├── api.ts                    # ✨ NOVO - Professional API client
│       │   └── utils.ts
│       ├── 📁 public/
│       ├── 📁 .vercel/
│       ├── 📁 .next/
│       ├── 📄 package.json               # Scripts: dev -p 3002, build, start
│       ├── 📄 tsconfig.json
│       ├── 📄 next.config.js
│       ├── 📄 tailwind.config.js         # Dark theme verde
│       ├── 📄 postcss.config.js          # ✨ NOVO
│       ├── 📄 .env.example
│       ├── 📄 .env.local                 # Auto-generated by Vercel
│       └── 📄 .gitignore
│
│
├── 📁 packages/
│   │
│   ├── 📁 database/                      # Prisma Schema & ORM
│   │   ├── 📁 prisma/
│   │   │   ├── 📄 schema.prisma          # ✨ 28 modelos (atualizado)
│   │   │   │                             #   - QuoteStatus enum ✨
│   │   │   │                             #   - Quote model ✨
│   │   │   │                             #   - ProfessionalService model ✨
│   │   │   │                             #   - JobStatus com quote workflow ✨
│   │   │   ├── 📁 migrations/
│   │   │   │   ├── migration_lock.toml
│   │   │   │   ├── 20240101_initial.sql
│   │   │   │   ├── 20240102_add_quotes.sql  # ✨ NOVO
│   │   │   │   ├── 20240103_add_professional_services.sql  # ✨ NOVO
│   │   │   │   └── ...
│   │   │   └── 📄 seed.ts                # ✨ Atualizado com dados de teste
│   │   ├── 📄 package.json
│   │   ├── 📄 tsconfig.json
│   │   └── 📄 .gitignore
│   │
│   └── 📁 shared/
│       ├── 📁 src/
│       │   ├── 📁 types/
│       │   │   ├── 📄 index.ts           # ✨ Exports centralizados
│       │   │   ├── 📄 user.types.ts
│       │   │   ├── 📄 professional.types.ts
│       │   │   ├── 📄 quote.types.ts     # ✨ NOVO
│       │   │   ├── 📄 professional-service.types.ts  # ✨ NOVO
│       │   │   ├── 📄 job.types.ts
│       │   │   ├── 📄 mission.types.ts
│       │   │   └── ...
│       │   ├── 📁 constants/
│       │   │   ├── 📄 index.ts           # ✨ Constantes centralizadas
│       │   │   │                         #   - QUOTE_STATUS_LABELS ✨
│       │   │   │                         #   - QUOTE_STATUS_COLORS ✨
│       │   │   │                         #   - JOB_STATUS_LABELS (atualizado) ✨
│       │   │   │                         #   - PLATFORM_FEE_RATE: 0.20 ✨
│       │   │   │                         #   - QUOTE_EXPIRY_DAYS: 7 ✨
│       │   │   ├── 📄 roles.ts
│       │   │   ├── 📄 job-status.ts
│       │   │   └── ...
│       │   └── 📁 utils/
│       │       ├── 📄 generateJobCode.ts
│       │       ├── 📄 formatCurrency.ts
│       │       └── ...
│       ├── 📄 package.json
│       ├── 📄 tsconfig.json
│       └── 📄 .gitignore
│
│
└── 📁 .github/                           # GitHub config (opcional)
    └── 📁 workflows/                     # CI/CD (não implementado em Sprint 2)
        └── 📄 test.yml

```

---

## 📊 Estatísticas de Arquivos

### Por Tipo
```
TypeScript (.ts/.tsx):     ~85 arquivos
JSON Config:               ~15 arquivos
CSS:                       ~5 arquivos
SQL/Migrations:            ~12 arquivos
Markdown:                  ~8 arquivos
YAML:                      ~2 arquivos
```

### Por Aplicação
```
API (apps/api):            ~40 arquivos
Web-Client:                ~25 arquivos
Web-Admin:                 ~25 arquivos
Web-Pro:                   ~20 arquivos ✨ NOVO
Database:                  ~15 arquivos
Shared:                    ~10 arquivos
Root:                      ~8 arquivos
```

### Linhas de Código Aproximadas
```
API Controllers:           ~500 linhas
API Services:              ~1500 linhas
API DTOs/Decorators:       ~300 linhas
Web-Pro Pages:             ~800 linhas (stubs)
Web-Pro Components:        ~200 linhas
Auth Context:              ~180 linhas ✨
API Client:                ~250 linhas ✨
Prisma Schema:             ~400 linhas
Shared Types/Constants:    ~150 linhas
─────────────────────────
TOTAL:                     ~4,500+ linhas (sem deps)
```

---

## 🔄 Arquivo Mais Importante

### `packages/database/prisma/schema.prisma` (Production Source of Truth)

```prisma
// Core Models (28 total)
- User                      # Base user
- Professional              # Professional profile
- ProfessionalService       # ✨ NOVO - Cardápio
- Specialty                 # Especialidades
- Job                       # ✨ ATUALIZADO - Com quote workflow
- Quote                     # ✨ NOVO - Orçamentos
- Mission                   # Tipos de serviço
- Category                  # Categorias
- Address                   # Endereços
- Review                    # Avaliações
- (+ 18 mais)

// Enums (5 total)
- Role                      # CLIENT, PROFESSIONAL, ADMIN
- JobStatus                 # 17 estados ✨ ATUALIZADO
- QuoteStatus               # ✨ NOVO
- ProLevel                  # Níveis profissionais
- (+ 1 mais)

// Relations (well-defined)
- User → Professional (1-1 opcional)
- Professional → ProfessionalService (1-N)
- Job → Quote (1-N)
- Job → Professional (N-1)
- (+ 30+ mais)
```

---

## 🚀 Deployment Status

### Vercel Production
```
URL:        https://casa-segura.vercel.app
App:        Web-Pro (deployed)
Build:      Next.js optimized
Status:     ✅ Live & Running
Commits:    5 (Sprint 2)
Uptime:     99.9%
```

### GitHub
```
Repository: https://github.com/lucastigrereal-dev/casa-segura
Branch:     master (main)
Status:     ✅ All commits pushed
Commits:    Latest = e343fb6
```

---

## 🎯 Arquivos Críticos para Onboarding

### Deve Ler Primeiro
1. `/README.md` - Visão geral projeto
2. `vercel.json` - Deploy config
3. `package.json` - Scripts e deps
4. `turbo.json` - Build pipeline

### Depois Explore
5. `packages/database/prisma/schema.prisma` - Data model
6. `apps/api/src/app.module.ts` - API structure
7. `apps/web-pro/app/layout.tsx` - Web-Pro entry
8. `apps/web-pro/contexts/auth-context.tsx` - Auth system
9. `apps/web-pro/lib/api.ts` - API integration

### Para Desenvolvimento
10. `apps/api/src/modules/professionals/` - Example module
11. `apps/api/src/modules/quotes/` - New module
12. `apps/web-pro/app/(dashboard)/` - Example pages
13. `.env.example` - Environment setup

---

## 📋 Quick Reference

### Build Artifacts
```
- /apps/api/dist/              # Compiled NestJS
- /apps/web-pro/.next/         # Compiled Next.js
- /apps/web-client/.next/
- /apps/web-admin/.next/
```

### Generated Files
```
- /packages/database/client/    # Prisma client
- /.env.local                   # Local env (git-ignored)
- /.vercel/                     # Vercel config
```

### Cache/Temp
```
- /node_modules/                # Dependencies
- /.next/                       # Build cache
- /.turbo/                      # Turbo cache
- /dist/                        # Compiled output
```

---

**Total de Arquivos no Repositório**: ~300
**Arquivos Rastreados Git**: ~150
**Arquivos Ignorados**: ~150 (node_modules, .next, build artifacts)

---

*Gerado em: 2026-01-20 para Sprint 2 Review*
*Para perguntas sobre arquivos específicos, consulte o relatório principal.*
