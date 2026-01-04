# Casa Segura - Historia Completa do Projeto

> **Projeto:** Marketplace de Servicos Residenciais
> **Regiao:** Serra Gaucha, RS, Brasil
> **Inicio:** Janeiro 2026
> **Status:** MVP Concluido

---

# Sumario

1. [Visao Geral do Projeto](#visao-geral-do-projeto)
2. [Historia do Desenvolvimento](#historia-do-desenvolvimento)
3. [Arquitetura Tecnica](#arquitetura-tecnica)
4. [Roadmap Executado](#roadmap-executado)
5. [Detalhes de Implementacao](#detalhes-de-implementacao)
6. [Banco de Dados](#banco-de-dados)
7. [API Endpoints](#api-endpoints)
8. [Frontend Cliente](#frontend-cliente)
9. [Painel Administrativo](#painel-administrativo)
10. [Proximos Passos](#proximos-passos)
11. [Informacoes Tecnicas](#informacoes-tecnicas)

---

# Visao Geral do Projeto

## O Que E o Casa Segura?

Casa Segura e um **marketplace de servicos residenciais** focado na regiao da Serra Gaucha. A plataforma conecta **clientes** que precisam de servicos de manutencao e reparo em suas casas com **profissionais qualificados** da regiao.

## Problema Resolvido

- Dificuldade de encontrar profissionais confiaveis na Serra Gaucha
- Falta de transparencia em precos e qualidade
- Ausencia de garantia em servicos residenciais
- Profissionais sem plataforma para divulgar seus servicos

## Solucao

- Marketplace com profissionais verificados
- Sistema de avaliacoes e ratings
- Precos tabelados por tipo de servico
- Garantia de 7 dias em todos os servicos
- Pagamento seguro pela plataforma

## Publico-Alvo

### Clientes
- Moradores da Serra Gaucha
- Pessoas que precisam de servicos residenciais
- Preferem contratar pelo celular/internet

### Profissionais
- Eletricistas, encanadores, pintores, montadores
- Profissionais autonomos da regiao
- Buscam mais clientes e visibilidade

---

# Historia do Desenvolvimento

## Sessao 1 - Estrutura Inicial

### Data: 02/01/2026

**Objetivo:** Criar a estrutura base do projeto

**O que foi feito:**
- Criacao do monorepo com Turborepo
- Configuracao do Docker Compose (PostgreSQL + Redis)
- Setup do NestJS para a API
- Setup do Next.js para web-client e web-admin
- Criacao do schema Prisma com todas as entidades
- Seed inicial com categorias e missoes

**Arquivos criados:**
- `docker-compose.yml`
- `package.json` (raiz)
- `turbo.json`
- `packages/database/prisma/schema.prisma`
- Estrutura de pastas dos 3 apps

---

## Sessao 2 - Backend Completo

### Data: 03/01/2026

**Objetivo:** Implementar todos os modulos da API

**Modulos implementados:**

### Auth Module
- Login com JWT
- Registro de usuarios
- Refresh token
- Endpoint /me para usuario atual
- Guards de autenticacao
- Decorators (@CurrentUser, @Public, @Roles)

### Users Module
- CRUD completo
- Listagem com paginacao
- Filtros por role
- Busca por nome/email
- Toggle ativo/inativo

### Professionals Module
- Registro como profissional
- Listagem com filtros
- Verificacao de profissionais
- Toggle disponibilidade

### Categories Module
- CRUD completo
- Ordenacao
- Toggle ativo/inativo

### Missions Module
- CRUD completo
- Tipos: DAILY, WEEKLY, MONTHLY, ONE_TIME
- Sistema de pontos
- Toggle ativo/inativo

### Jobs Module
- Criacao de chamados
- Listagem com filtros
- Atualizacao de status
- Fluxo completo de estados

### Addresses Module
- CRUD por usuario
- Endereco padrao
- Validacao de CEP

### Reviews Module
- Criacao de avaliacoes
- Listagem por profissional
- Calculo de media

---

## Sessao 3 - Frontend Cliente

### Data: 03/01/2026

**Objetivo:** Implementar autenticacao e paginas basicas

**O que foi feito:**

### Auth Context
- Gerenciamento de estado global
- Login/Logout/Registro
- Persistencia no localStorage
- Refresh automatico de token
- Redirecionamento por role

### Componentes UI
- Toaster (sistema de notificacoes)
- Loading (spinner)
- Avatar (com iniciais)
- Select (customizado)
- Textarea (customizado)
- Input (com label)
- Button (variantes)
- Card (container)
- Modal (dialogo)

### Paginas
- `/login` - Formulario de login
- `/cadastro` - Registro com opcao profissional
- `/perfil` - Edicao de dados + enderecos

### Layout
- Header responsivo
- Menu mobile (hamburger)
- Dropdown de usuario logado
- Footer

---

## Sessao 4 - Painel Administrativo

### Data: 03/01/2026

**Objetivo:** Dashboard e CRUDs completos

**O que foi feito:**

### Auth Admin
- Context exclusivo para admins
- Verificacao de role no login
- Protecao de rotas

### API Client
- Cliente HTTP tipado
- Endpoints para todos os modulos
- Injecao automatica de token

### Dashboard
- Cards de estatisticas
- Chamados recentes
- Metricas de desempenho
- Loading states

### CRUD Usuarios
- Listagem com DataTable
- Busca por nome/email
- Filtro por role
- Paginacao
- Modal criar/editar
- Modal confirmar exclusao
- Toggle ativo/inativo

### CRUD Profissionais
- Listagem com filtro verificacao
- Avaliacao e experiencia
- Modal de verificacao
- Toggle disponibilidade

### CRUD Chamados
- Tabs por status
- Busca por codigo/cliente
- Modal alterar status
- Paginacao

### CRUD Missoes
- Listagem com tipos
- Sistema de pontos
- Modal criar/editar
- Toggle ativo/inativo

### CRUD Categorias
- Grid de cards
- Icones dinamicos
- Cores por categoria
- Modal com seletor de icone

---

## Sessao 5 - Documentacao e Deploy

### Data: 03/01/2026

**Objetivo:** Documentar e subir para GitHub

**O que foi feito:**
- README.md com instrucoes
- CHANGELOG.md com historico
- ROADMAP.md com proximos passos
- RELATORIO.md tecnico
- NOTION_EXPORT.md para importacao
- Inicializacao do Git
- Criacao do repositorio GitHub
- Push do codigo

---

# Arquitetura Tecnica

## Stack Tecnologica

### Backend
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| NestJS | 10.x | Framework API |
| Prisma | 5.x | ORM |
| PostgreSQL | 15 | Banco de dados |
| Redis | 7 | Cache |
| JWT | - | Autenticacao |
| Passport | - | Estrategias auth |
| class-validator | - | Validacao DTOs |
| Swagger | - | Documentacao API |
| bcrypt | - | Hash de senhas |
| Helmet | - | Seguranca HTTP |

### Frontend
| Tecnologia | Versao | Uso |
|------------|--------|-----|
| Next.js | 14 | Framework React |
| React | 18 | UI Library |
| TypeScript | 5.x | Tipagem |
| Tailwind CSS | 3.x | Estilizacao |
| Lucide | - | Icones |
| shadcn/ui | - | Componentes (admin) |
| Radix UI | - | Primitivos (admin) |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| Turborepo | Monorepo |
| Docker Compose | Containers locais |
| npm | Package manager |

## Estrutura de Pastas

```
casa-segura/
├── apps/
│   ├── api/                      # Backend NestJS
│   │   ├── src/
│   │   │   ├── common/           # Guards, decorators, filters
│   │   │   ├── modules/          # Modulos da aplicacao
│   │   │   │   ├── auth/
│   │   │   │   ├── users/
│   │   │   │   ├── professionals/
│   │   │   │   ├── categories/
│   │   │   │   ├── missions/
│   │   │   │   ├── jobs/
│   │   │   │   ├── addresses/
│   │   │   │   ├── reviews/
│   │   │   │   └── prisma/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   ├── web-client/               # Frontend Cliente
│   │   ├── app/                  # App Router
│   │   │   ├── (auth)/           # Rotas de auth
│   │   │   ├── (main)/           # Rotas principais
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/               # Componentes base
│   │   │   ├── forms/            # Formularios
│   │   │   └── layout/           # Header, Footer
│   │   ├── contexts/             # Auth context
│   │   └── lib/                  # Utils, API client
│   │
│   └── web-admin/                # Painel Admin
│       ├── app/
│       │   ├── (dashboard)/      # Rotas protegidas
│       │   │   ├── usuarios/
│       │   │   ├── profissionais/
│       │   │   ├── chamados/
│       │   │   ├── missoes/
│       │   │   └── categorias/
│       │   └── login/
│       ├── components/
│       │   ├── ui/               # shadcn components
│       │   ├── layout/           # Sidebar, Header
│       │   └── tables/           # DataTable
│       ├── contexts/             # Auth context
│       └── lib/                  # API client, utils
│
├── packages/
│   ├── database/                 # Prisma
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── package.json
│   │
│   └── shared/                   # Tipos compartilhados
│       ├── src/
│       │   ├── types/
│       │   ├── constants/
│       │   └── utils/
│       └── package.json
│
├── docs/                         # Documentacao
│   ├── RELATORIO.md
│   ├── ROADMAP.md
│   └── NOTION_EXPORT.md
│
├── docker-compose.yml
├── turbo.json
├── package.json
├── README.md
└── CHANGELOG.md
```

---

# Roadmap Executado

## Fase 1: MVP - CONCLUIDA

### Backend API
- [x] Estrutura NestJS com modulos
- [x] Autenticacao JWT completa
- [x] CRUD de Usuarios
- [x] CRUD de Profissionais
- [x] CRUD de Categorias
- [x] CRUD de Missoes
- [x] CRUD de Chamados
- [x] CRUD de Enderecos
- [x] Sistema de Avaliacoes
- [x] Swagger/OpenAPI
- [x] Docker Compose

### Frontend Cliente
- [x] Layout responsivo
- [x] Sistema de autenticacao
- [x] Login e cadastro
- [x] Pagina de perfil
- [x] Gerenciamento de enderecos
- [x] Componentes UI base

### Painel Admin
- [x] Autenticacao admin-only
- [x] Dashboard com estatisticas
- [x] CRUD de todas entidades
- [x] Paginacao e filtros
- [x] Modais de edicao

### Documentacao
- [x] README com instrucoes
- [x] CHANGELOG
- [x] ROADMAP
- [x] Relatorio tecnico

### DevOps
- [x] Repositorio GitHub
- [x] Git configurado
- [x] Docker local

---

# Detalhes de Implementacao

## Autenticacao JWT

### Fluxo de Login
1. Usuario envia email/senha
2. API valida credenciais com bcrypt
3. Gera access token (15min) e refresh token (7 dias)
4. Frontend armazena tokens no localStorage
5. Todas requisicoes incluem Bearer token

### Refresh Token
1. Access token expira
2. Frontend detecta erro 401
3. Envia refresh token para /auth/refresh
4. Recebe novos tokens
5. Repete requisicao original

### Guards e Decorators
```typescript
// Proteger rota
@UseGuards(JwtAuthGuard)

// Rota publica
@Public()

// Restringir por role
@Roles('ADMIN')
@UseGuards(RolesGuard)

// Obter usuario atual
@CurrentUser() user: User
```

## Sistema de Roles

### Tipos de Usuario
| Role | Descricao | Acesso |
|------|-----------|--------|
| CLIENT | Cliente comum | web-client |
| PROFESSIONAL | Profissional | web-client + painel pro |
| ADMIN | Administrador | web-admin |

### Permissoes
- **CLIENT:** Criar chamados, avaliar, gerenciar perfil
- **PROFESSIONAL:** Tudo de CLIENT + aceitar chamados
- **ADMIN:** Acesso total ao painel administrativo

## Fluxo de Chamados (Jobs)

### Status Disponiveis
```
PENDING         -> Aguardando orcamento
QUOTED          -> Orcamento enviado
ACCEPTED        -> Cliente aceitou
IN_PROGRESS     -> Servico em andamento
COMPLETED       -> Servico concluido
CANCELLED       -> Cancelado
```

### Fluxo Normal
1. Cliente cria chamado (PENDING)
2. Profissional envia orcamento (QUOTED)
3. Cliente aceita (ACCEPTED)
4. Profissional inicia (IN_PROGRESS)
5. Profissional finaliza (COMPLETED)
6. Cliente avalia

---

# Banco de Dados

## Diagrama de Entidades

```
┌─────────────┐     ┌─────────────────┐
│    User     │────<│  Professional   │
└─────────────┘     └─────────────────┘
       │                    │
       │                    │
       ▼                    │
┌─────────────┐            │
│   Address   │            │
└─────────────┘            │
       │                    │
       │         ┌──────────┘
       ▼         ▼
┌─────────────────────────────┐
│            Job              │
└─────────────────────────────┘
       │              │
       │              │
       ▼              ▼
┌───────────┐  ┌─────────────┐
│  Review   │  │   Category  │
└───────────┘  └─────────────┘
                     │
                     ▼
              ┌─────────────┐
              │   Mission   │
              └─────────────┘
```

## Entidades Principais

### User
```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password_hash String
  name          String
  phone         String?
  avatar_url    String?
  role          UserRole  @default(CLIENT)
  is_active     Boolean   @default(true)
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}
```

### Professional
```prisma
model Professional {
  id               String   @id @default(uuid())
  user_id          String   @unique
  bio              String?
  experience_years Int?
  service_radius   Int?
  is_verified      Boolean  @default(false)
  is_available     Boolean  @default(true)
  rating           Float?
  total_reviews    Int      @default(0)
  total_jobs       Int      @default(0)
}
```

### Job
```prisma
model Job {
  id              String    @id @default(uuid())
  code            String    @unique
  title           String
  description     String
  status          JobStatus @default(PENDING)
  client_id       String
  professional_id String?
  category_id     String
  address_id      String
  scheduled_date  DateTime?
  quoted_price    Float?
  final_price     Float?
  created_at      DateTime  @default(now())
}
```

---

# API Endpoints

## Autenticacao

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| POST | /api/auth/register | Registrar usuario | Nao |
| POST | /api/auth/login | Login | Nao |
| POST | /api/auth/refresh | Refresh token | Nao |
| GET | /api/auth/me | Usuario atual | Sim |

## Usuarios

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/users | Listar usuarios | Admin |
| GET | /api/users/:id | Detalhes | Admin |
| PATCH | /api/users/:id | Atualizar | Admin |
| DELETE | /api/users/:id | Excluir | Admin |
| GET | /api/users/profile | Meu perfil | Sim |
| PATCH | /api/users/profile | Atualizar perfil | Sim |

## Profissionais

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/professionals | Listar | Nao |
| GET | /api/professionals/:id | Detalhes | Nao |
| POST | /api/professionals/register | Registrar-se | Sim |
| PATCH | /api/professionals/:id/verify | Verificar | Admin |

## Categorias

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/categories | Listar | Nao |
| POST | /api/categories | Criar | Admin |
| PATCH | /api/categories/:id | Atualizar | Admin |
| DELETE | /api/categories/:id | Excluir | Admin |

## Missoes

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/missions | Listar | Nao |
| POST | /api/missions | Criar | Admin |
| PATCH | /api/missions/:id | Atualizar | Admin |
| DELETE | /api/missions/:id | Excluir | Admin |

## Chamados

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/jobs | Listar | Admin |
| POST | /api/jobs | Criar | Sim |
| GET | /api/jobs/my | Meus chamados | Sim |
| GET | /api/jobs/:id | Detalhes | Sim |
| PATCH | /api/jobs/:id/status | Alterar status | Sim |

## Enderecos

| Metodo | Endpoint | Descricao | Auth |
|--------|----------|-----------|------|
| GET | /api/addresses | Meus enderecos | Sim |
| POST | /api/addresses | Criar | Sim |
| PATCH | /api/addresses/:id | Atualizar | Sim |
| DELETE | /api/addresses/:id | Excluir | Sim |

---

# Frontend Cliente

## Paginas Implementadas

### Login (`/login`)
- Formulario com email/senha
- Validacao de campos
- Mensagem de erro
- Link para cadastro
- Redirect se ja logado

### Cadastro (`/cadastro`)
- Nome, email, telefone, senha
- Checkbox "Sou profissional"
- Mascara de telefone
- Validacao completa
- Toast de sucesso

### Perfil (`/perfil`)
- Edicao de dados pessoais
- Lista de enderecos
- Adicionar endereco
- Editar endereco
- Excluir endereco
- Definir padrao
- Info profissional (se aplicavel)

## Componentes UI

### Toaster
```typescript
// Uso
toast.success('Titulo', 'Mensagem');
toast.error('Erro', 'Descricao');
toast.info('Info', 'Descricao');
```

### Loading
```tsx
<Loading size="sm" /> // 16px
<Loading size="md" /> // 24px
<Loading size="lg" /> // 32px
```

### Avatar
```tsx
<Avatar
  src={user.avatar_url}
  name={user.name}
  size="md"
/>
// Mostra imagem ou iniciais
```

---

# Painel Administrativo

## Dashboard

### Estatisticas
- Total de usuarios
- Profissionais ativos
- Chamados do mes
- Receita total

### Chamados Recentes
- Lista dos 5 ultimos
- Status colorido
- Link para ver todos

### Metricas
- Taxa de conclusao
- Satisfacao do cliente
- Tempo medio de resposta

## Paginas CRUD

### Usuarios
| Funcionalidade | Implementado |
|----------------|--------------|
| Listagem | Sim |
| Busca | Sim |
| Filtro por role | Sim |
| Paginacao | Sim |
| Criar | Sim |
| Editar | Sim |
| Excluir | Sim |
| Toggle ativo | Sim |

### Profissionais
| Funcionalidade | Implementado |
|----------------|--------------|
| Listagem | Sim |
| Busca | Sim |
| Filtro verificado | Sim |
| Paginacao | Sim |
| Verificar | Sim |
| Remover verificacao | Sim |
| Toggle disponivel | Sim |

### Chamados
| Funcionalidade | Implementado |
|----------------|--------------|
| Listagem | Sim |
| Busca | Sim |
| Tabs por status | Sim |
| Paginacao | Sim |
| Alterar status | Sim |

### Missoes
| Funcionalidade | Implementado |
|----------------|--------------|
| Listagem | Sim |
| Busca | Sim |
| Filtro por tipo | Sim |
| Paginacao | Sim |
| Criar | Sim |
| Editar | Sim |
| Excluir | Sim |
| Toggle ativo | Sim |

### Categorias
| Funcionalidade | Implementado |
|----------------|--------------|
| Grid de cards | Sim |
| Busca | Sim |
| Criar | Sim |
| Editar | Sim |
| Excluir | Sim |
| Seletor de icone | Sim |

---

# Proximos Passos

## Fase 2: Fluxo do Cliente

### Prioridade Alta

#### 1. Pagina de Criar Chamado
- [ ] Wizard de 4 passos
- [ ] Selecao de categoria
- [ ] Selecao de servico
- [ ] Descricao + fotos
- [ ] Endereco + agendamento

#### 2. Meus Chamados
- [ ] Lista de chamados
- [ ] Filtros por status
- [ ] Detalhes expandido
- [ ] Timeline de eventos

#### 3. Busca de Profissionais
- [ ] Grid de cards
- [ ] Filtros
- [ ] Perfil detalhado

#### 4. Sistema de Avaliacoes
- [ ] Modal pos-servico
- [ ] Estrelas + comentario
- [ ] Fotos do servico

### Prioridade Media

#### 5. Painel do Profissional
- [ ] Dashboard proprio
- [ ] Aceitar/recusar
- [ ] Enviar orcamento
- [ ] Calendario

#### 6. Notificacoes
- [ ] In-app
- [ ] Push web
- [ ] Email

#### 7. Chat
- [ ] Socket.io
- [ ] Tempo real
- [ ] Historico

### Prioridade Baixa

#### 8. Pagamentos
- [ ] Gateway
- [ ] Checkout
- [ ] Repasse

#### 9. Mobile
- [ ] React Native
- [ ] Push nativo
- [ ] GPS

#### 10. Gamificacao
- [ ] Pontos
- [ ] Niveis
- [ ] Badges

---

# Informacoes Tecnicas

## Credenciais

### Admin
- **URL:** http://localhost:3001
- **Email:** admin@casasegura.com
- **Senha:** admin123

### Cliente Teste
- **Email:** cliente@teste.com
- **Senha:** cliente123

## Como Rodar

```bash
# 1. Instalar dependencias
npm install

# 2. Subir Docker
npm run docker:up

# 3. Configurar banco
npm run db:generate
npm run db:push
npm run db:seed

# 4. Rodar dev
npm run dev
```

## URLs Locais

| Servico | URL |
|---------|-----|
| API | http://localhost:3333 |
| Swagger | http://localhost:3333/api/docs |
| Cliente | http://localhost:3000 |
| Admin | http://localhost:3001 |

## Repositorio

**GitHub:** https://github.com/lucastigrereal-dev/casa-segura

## Seguranca

- JWT com expiracao 15min
- Refresh token 7 dias
- bcrypt 10 rounds
- Rate limiting
- Helmet headers
- Validacao de roles

---

# Conclusao

O MVP do Casa Segura esta **100% concluido** com:

- Backend robusto com todos os modulos
- Frontend cliente funcional
- Painel admin completo
- Documentacao detalhada
- Codigo no GitHub

**Proximo marco:** Implementar fluxo completo de criacao de chamados pelo cliente.

---

*Documento gerado em Janeiro 2026*
*Versao: 1.0.0*
