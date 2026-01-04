# Casa Segura

Marketplace de servicos residenciais para Serra Gaucha.

## Estrutura do Projeto

```
casa-segura/
├── apps/
│   ├── api/                 # NestJS 10 Backend
│   ├── web-client/          # Next.js 14 - Site do Cliente
│   └── web-admin/           # Next.js 14 - Painel Admin
├── packages/
│   ├── database/            # Prisma schema + migrations
│   └── shared/              # Types + utils compartilhados
├── docker-compose.yml       # PostgreSQL + Redis local
├── turbo.json
├── package.json
└── .env.example
```

## Requisitos

- Node.js 18+
- Docker e Docker Compose
- npm 10+

## Instalacao

### 1. Clone o repositorio

```bash
git clone <repo-url>
cd casa-segura
```

### 2. Instale as dependencias

```bash
npm install
```

### 3. Inicie os servicos Docker

```bash
npm run docker:up
```

Isso iniciara:
- PostgreSQL 15 na porta 5432
- Redis 7 na porta 6379

### 4. Configure as variaveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` conforme necessario. Os valores padrao funcionam para desenvolvimento local.

### 5. Configure o banco de dados

```bash
# Gera o cliente Prisma
npm run db:generate

# Aplica o schema no banco
npm run db:push

# Popula o banco com dados iniciais
npm run db:seed
```

### 6. Inicie o ambiente de desenvolvimento

```bash
npm run dev
```

## Acessos

| Servico     | URL                              |
|-------------|----------------------------------|
| API         | http://localhost:3333            |
| API Docs    | http://localhost:3333/api/docs   |
| Cliente     | http://localhost:3000            |
| Admin       | http://localhost:3001            |

## Credenciais Iniciais

### Admin
- Email: `admin@casasegura.com`
- Senha: `admin123`

## Scripts Disponiveis

| Script          | Descricao                           |
|-----------------|-------------------------------------|
| `npm run dev`   | Inicia todos os apps em modo dev    |
| `npm run build` | Compila todos os apps               |
| `npm run docker:up` | Inicia PostgreSQL e Redis       |
| `npm run docker:down` | Para PostgreSQL e Redis       |
| `npm run db:push` | Aplica schema Prisma no banco     |
| `npm run db:seed` | Popula banco com dados iniciais   |
| `npm run db:studio` | Abre Prisma Studio              |
| `npm run db:generate` | Gera cliente Prisma           |

## Tecnologias

### Backend (API)
- NestJS 10
- Prisma ORM
- PostgreSQL 15
- JWT Authentication
- Swagger/OpenAPI
- Class Validator
- Helmet
- Rate Limiting

### Frontend (Cliente)
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- Lucide Icons

### Frontend (Admin)
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui
- Radix UI

### Infraestrutura
- Turborepo (monorepo)
- Docker Compose
- Redis (cache)

## Estrutura do Banco de Dados

### Entidades Principais

- **User** - Usuarios do sistema (clientes, profissionais, admins)
- **Professional** - Dados adicionais de profissionais
- **Category** - Categorias de servicos (Eletrica, Hidraulica, etc)
- **Mission** - Servicos disponiveis (Troca de Tomada, etc)
- **Specialty** - Especialidades dos profissionais
- **Address** - Enderecos dos usuarios
- **Job** - Chamados/solicitacoes de servico
- **Review** - Avaliacoes de servicos

### Status do Job (JobStatus)

1. `CREATED` - Chamado criado
2. `QUOTED` - Orcamento enviado
3. `PENDING_PAYMENT` - Aguardando pagamento
4. `PAID` - Pagamento confirmado
5. `ASSIGNED` - Profissional atribuido
6. `PRO_ACCEPTED` - Profissional aceitou
7. `PRO_ON_WAY` - Profissional a caminho
8. `IN_PROGRESS` - Servico em andamento
9. `PENDING_APPROVAL` - Aguardando aprovacao do cliente
10. `COMPLETED` - Servico concluido
11. `IN_GUARANTEE` - Em periodo de garantia
12. `CLOSED` - Chamado fechado
13. `CANCELLED` - Cancelado
14. `DISPUTED` - Em disputa

## API Endpoints

### Autenticacao
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Renovar token
- `GET /api/auth/me` - Usuario atual

### Usuarios
- `GET /api/users` - Listar usuarios (admin)
- `GET /api/users/profile` - Perfil atual
- `PATCH /api/users/profile` - Atualizar perfil

### Profissionais
- `GET /api/professionals` - Listar profissionais
- `POST /api/professionals/register` - Registrar-se como profissional
- `GET /api/professionals/:id` - Detalhes do profissional

### Categorias
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:id` - Detalhes da categoria

### Missoes
- `GET /api/missions` - Listar missoes
- `GET /api/missions/:id` - Detalhes da missao

### Chamados
- `POST /api/jobs` - Criar chamado
- `GET /api/jobs/my` - Meus chamados
- `GET /api/jobs/:id` - Detalhes do chamado
- `PATCH /api/jobs/:id/status` - Atualizar status

### Enderecos
- `GET /api/addresses` - Meus enderecos
- `POST /api/addresses` - Criar endereco
- `PATCH /api/addresses/:id` - Atualizar endereco

### Avaliacoes
- `POST /api/reviews` - Criar avaliacao
- `GET /api/reviews/professional/:userId` - Avaliacoes do profissional

## Categorias e Missoes (Seed)

### Eletrica
- Troca de Tomada (R$ 100)
- Instalacao de Luminaria (R$ 150)
- Troca de Disjuntor (R$ 200)

### Hidraulica
- Desentupimento de Pia (R$ 120)
- Troca de Torneira (R$ 100)
- Conserto de Descarga (R$ 150)

### Pintura
- Pintura de Parede (R$ 350)
- Pintura de Porta (R$ 200)
- Retoque de Pintura (R$ 120)

### Montagem
- Montagem de Movel (R$ 200)
- Instalacao de Prateleira (R$ 100)
- Instalacao de TV (R$ 150)

### Clima Frio
- Limpeza de Ar Condicionado (R$ 180)
- Instalacao de Aquecedor (R$ 300)
- Manutencao de Lareira (R$ 350)

## Contribuicao

1. Crie uma branch para sua feature
2. Faca commit das suas alteracoes
3. Abra um Pull Request

## Licenca

Privado - Todos os direitos reservados.
