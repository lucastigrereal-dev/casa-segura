# Changelog

Todas as mudancas notaveis neste projeto serao documentadas neste arquivo.

O formato e baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semantico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 2026-01-03

### Adicionado

#### Backend (API)
- Modulo de autenticacao com JWT (login, registro, refresh token)
- CRUD completo de usuarios com filtros e paginacao
- CRUD de profissionais com verificacao
- CRUD de categorias com ordenacao
- CRUD de missoes (servicos) com tipos
- CRUD de chamados (jobs) com fluxo de status
- CRUD de enderecos por usuario
- Sistema de avaliacoes
- Documentacao Swagger/OpenAPI
- Rate limiting e seguranca com Helmet
- Docker Compose para PostgreSQL e Redis
- Seed de dados iniciais

#### Frontend Cliente (web-client)
- Layout responsivo com header e footer
- Sistema de autenticacao (context)
- Pagina de login com validacao
- Pagina de cadastro com opcao profissional
- Pagina de perfil completa
- Gerenciamento de enderecos (CRUD)
- Sistema de toasts/notificacoes
- Componentes UI (button, input, card, modal, etc)
- Integracao com API

#### Painel Administrativo (web-admin)
- Autenticacao exclusiva para admins
- Dashboard com estatisticas e graficos
- CRUD de usuarios com filtros
- CRUD de profissionais com verificacao
- CRUD de chamados com tabs de status
- CRUD de missoes com tipos
- CRUD de categorias com icones
- Paginacao em todas as listagens
- Modais de criacao/edicao/exclusao
- Loading states e tratamento de erros

#### Infraestrutura
- Monorepo com Turborepo
- Docker Compose (PostgreSQL 15 + Redis 7)
- Prisma ORM com schema completo
- Scripts npm para desenvolvimento

#### Documentacao
- README.md com instrucoes
- RELATORIO.md com detalhes tecnicos
- ROADMAP.md com proximos passos
- Comentarios no codigo

### Tecnologias
- NestJS 10
- Next.js 14 (App Router)
- React 18
- Prisma ORM
- PostgreSQL 15
- Redis 7
- Tailwind CSS
- shadcn/ui
- TypeScript
- JWT + Passport
- class-validator
- Swagger/OpenAPI

---

## [0.1.0] - 2026-01-02

### Adicionado
- Estrutura inicial do monorepo
- Setup do Turborepo
- Configuracao do Docker Compose
- Schema inicial do Prisma
- Estrutura basica dos apps (api, web-client, web-admin)
- Configuracao de Tailwind CSS
- Componentes UI basicos

---

## Proximas Versoes

### [1.1.0] - Planejado
- Pagina de criar chamado (cliente)
- Listagem de chamados do cliente
- Busca de profissionais
- Upload de imagens

### [1.2.0] - Planejado
- Painel do profissional
- Aceitar/recusar chamados
- Enviar orcamento

### [2.0.0] - Planejado
- Sistema de pagamentos
- Chat em tempo real
- Notificacoes push
- App mobile

---

## Tipos de Mudancas

- `Adicionado` para novas funcionalidades
- `Modificado` para mudancas em funcionalidades existentes
- `Descontinuado` para funcionalidades que serao removidas
- `Removido` para funcionalidades removidas
- `Corrigido` para correcoes de bugs
- `Seguranca` para vulnerabilidades
