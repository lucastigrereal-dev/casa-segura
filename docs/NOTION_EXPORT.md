# Casa Segura - Documentacao Completa

> Copie este arquivo para o Notion importando como Markdown ou copiando o conteudo.

---

## Sumario

1. [Visao Geral](#visao-geral)
2. [O Que Foi Implementado](#o-que-foi-implementado)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Como Rodar](#como-rodar)
5. [Credenciais](#credenciais)
6. [API Endpoints](#api-endpoints)
7. [Roadmap](#roadmap)
8. [Proximos Passos](#proximos-passos)

---

## Visao Geral

**Casa Segura** e um marketplace de servicos residenciais focado na Serra Gaucha, conectando clientes a profissionais qualificados.

### Stack Tecnologica

| Camada | Tecnologia |
|--------|------------|
| Backend | NestJS 10, Prisma, PostgreSQL, Redis |
| Frontend Cliente | Next.js 14, React 18, Tailwind |
| Admin | Next.js 14, shadcn/ui, Radix |
| Infra | Docker, Turborepo |

---

## O Que Foi Implementado

### Backend API

| Modulo | Status | Descricao |
|--------|--------|-----------|
| Auth | Concluido | Login, registro, JWT, refresh token |
| Users | Concluido | CRUD completo, filtros, paginacao |
| Professionals | Concluido | Registro, verificacao, listagem |
| Categories | Concluido | CRUD com ordenacao |
| Missions | Concluido | CRUD com tipos de missao |
| Jobs | Concluido | Chamados com fluxo de status |
| Addresses | Concluido | CRUD por usuario |
| Reviews | Concluido | Sistema de avaliacoes |

### Frontend Cliente

| Funcionalidade | Status |
|----------------|--------|
| Layout responsivo | Concluido |
| Login/Cadastro | Concluido |
| Perfil do usuario | Concluido |
| Gerenciar enderecos | Concluido |
| Sistema de toasts | Concluido |

### Painel Admin

| Pagina | Status | Funcionalidades |
|--------|--------|-----------------|
| Dashboard | Concluido | Stats, graficos, chamados recentes |
| Usuarios | Concluido | CRUD, filtros, paginacao |
| Profissionais | Concluido | Verificacao, disponibilidade |
| Chamados | Concluido | Tabs de status, alterar status |
| Missoes | Concluido | CRUD, tipos, pontos |
| Categorias | Concluido | Cards, icones, CRUD |

---

## Estrutura do Projeto

```
casa-segura/
├── apps/
│   ├── api/                 # NestJS Backend
│   │   └── src/
│   │       ├── auth/
│   │       ├── users/
│   │       ├── professionals/
│   │       ├── categories/
│   │       ├── missions/
│   │       ├── jobs/
│   │       ├── addresses/
│   │       └── reviews/
│   ├── web-client/          # Next.js Cliente
│   │   ├── app/
│   │   ├── components/
│   │   └── contexts/
│   └── web-admin/           # Next.js Admin
│       ├── app/
│       ├── components/
│       ├── contexts/
│       └── lib/
├── packages/
│   ├── database/            # Prisma
│   └── shared/              # Types compartilhados
├── docs/                    # Documentacao
├── docker-compose.yml
└── package.json
```

---

## Como Rodar

### Pre-requisitos
- Node.js 18+
- Docker e Docker Compose
- npm 10+

### Passo a Passo

```bash
# 1. Clonar repositorio
git clone https://github.com/SEU_USUARIO/casa-segura.git
cd casa-segura

# 2. Instalar dependencias
npm install

# 3. Iniciar Docker (PostgreSQL + Redis)
npm run docker:up

# 4. Configurar banco de dados
npm run db:generate
npm run db:push
npm run db:seed

# 5. Iniciar desenvolvimento
npm run dev
```

### URLs de Acesso

| Servico | URL |
|---------|-----|
| API | http://localhost:3333 |
| Swagger | http://localhost:3333/api/docs |
| Cliente | http://localhost:3000 |
| Admin | http://localhost:3001 |

---

## Credenciais

### Admin
- **Email:** admin@casasegura.com
- **Senha:** admin123

### Cliente Teste
- **Email:** cliente@teste.com
- **Senha:** cliente123

---

## API Endpoints

### Autenticacao
```
POST /api/auth/register    # Registro
POST /api/auth/login       # Login
POST /api/auth/refresh     # Refresh token
GET  /api/auth/me          # Usuario atual
```

### Usuarios
```
GET    /api/users          # Listar (admin)
GET    /api/users/:id      # Detalhes
PATCH  /api/users/:id      # Atualizar
DELETE /api/users/:id      # Excluir
```

### Profissionais
```
GET   /api/professionals              # Listar
POST  /api/professionals/register     # Registrar
PATCH /api/professionals/:id/verify   # Verificar
```

### Categorias
```
GET    /api/categories     # Listar
POST   /api/categories     # Criar
PATCH  /api/categories/:id # Atualizar
DELETE /api/categories/:id # Excluir
```

### Missoes
```
GET    /api/missions       # Listar
POST   /api/missions       # Criar
PATCH  /api/missions/:id   # Atualizar
DELETE /api/missions/:id   # Excluir
```

### Chamados
```
GET   /api/jobs            # Listar
POST  /api/jobs            # Criar
GET   /api/jobs/:id        # Detalhes
PATCH /api/jobs/:id/status # Atualizar status
```

---

## Roadmap

### Fase 1: MVP - CONCLUIDA
- [x] Backend completo
- [x] Frontend cliente basico
- [x] Painel admin completo

### Fase 2: Fluxo do Cliente
- [ ] Criar chamado (wizard)
- [ ] Meus chamados
- [ ] Buscar profissionais
- [ ] Avaliacoes

### Fase 3: Painel Profissional
- [ ] Dashboard profissional
- [ ] Aceitar/recusar chamados
- [ ] Calendario

### Fase 4: Comunicacao
- [ ] Chat em tempo real
- [ ] Notificacoes push
- [ ] Email transacional

### Fase 5: Pagamentos
- [ ] Gateway (Stripe/PagSeguro)
- [ ] Checkout
- [ ] Repasse automatico

### Fase 6: Mobile
- [ ] App React Native
- [ ] Push notifications
- [ ] GPS

---

## Proximos Passos Imediatos

### Prioridade Alta

| # | Tarefa | Estimativa |
|---|--------|------------|
| 1 | Pagina de criar chamado | 3-4 dias |
| 2 | Listagem de chamados (cliente) | 2 dias |
| 3 | Busca de profissionais | 2-3 dias |
| 4 | Upload de imagens | 1-2 dias |

### Prioridade Media

| # | Tarefa | Estimativa |
|---|--------|------------|
| 5 | Painel do profissional | 4-5 dias |
| 6 | Sistema de notificacoes | 2-3 dias |
| 7 | Chat em tempo real | 3-4 dias |

### Prioridade Baixa

| # | Tarefa | Estimativa |
|---|--------|------------|
| 8 | Gamificacao | 2-3 dias |
| 9 | App mobile | 4-6 semanas |
| 10 | Multi-idioma | 1-2 dias |

---

## Observacoes

### Seguranca
- JWT com expiracao de 15min
- Refresh token de 7 dias
- Senhas com bcrypt (10 rounds)
- Rate limiting ativo
- Validacao de roles em rotas admin

### Performance
- SSR com Next.js
- Paginacao em listagens
- Loading states
- Error boundaries

### UX/UI
- Design system consistente
- Cores: Primary #0A84FF, Secondary #30D158
- Fonte: Inter
- Responsivo

---

*Documento gerado em Janeiro 2026*
*Projeto: Casa Segura - Marketplace de Servicos Residenciais*
