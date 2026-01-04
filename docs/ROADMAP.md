# Casa Segura - Roadmap de Desenvolvimento

## Visao Geral do Projeto

**Casa Segura** e um marketplace de servicos residenciais focado na regiao da Serra Gaucha, conectando clientes a profissionais qualificados para servicos de manutencao e reparo.

---

## Fases do Projeto

### Fase 1: MVP (Concluida)

#### Backend API
- [x] Estrutura NestJS com modulos
- [x] Autenticacao JWT (login/registro/refresh)
- [x] CRUD de Usuarios
- [x] CRUD de Profissionais
- [x] CRUD de Categorias
- [x] CRUD de Missoes (servicos)
- [x] CRUD de Chamados (jobs)
- [x] CRUD de Enderecos
- [x] Sistema de Avaliacoes
- [x] Swagger/OpenAPI docs
- [x] Prisma ORM + PostgreSQL
- [x] Docker Compose (PostgreSQL + Redis)

#### Frontend Cliente (web-client)
- [x] Layout responsivo
- [x] Sistema de autenticacao
- [x] Pagina de login
- [x] Pagina de cadastro
- [x] Pagina de perfil com edicao
- [x] Gerenciamento de enderecos
- [x] Sistema de toasts/notificacoes
- [x] Componentes UI base

#### Painel Administrativo (web-admin)
- [x] Autenticacao admin-only
- [x] Dashboard com estatisticas
- [x] CRUD de Usuarios
- [x] CRUD de Profissionais
- [x] CRUD de Chamados
- [x] CRUD de Missoes
- [x] CRUD de Categorias
- [x] Paginacao e filtros
- [x] Modais de criacao/edicao

---

### Fase 2: Fluxo do Cliente (Proxima)

**Duracao Estimada:** 2-3 semanas

#### 2.1 Criar Chamado
- [ ] Pagina `/solicitar-servico`
- [ ] Wizard de 4 passos:
  1. Selecionar categoria
  2. Selecionar servico (missao)
  3. Descrever problema + fotos
  4. Selecionar endereco + agendar
- [ ] Upload de imagens (integrar storage)
- [ ] Validacao de formulario
- [ ] Confirmacao e resumo

#### 2.2 Meus Chamados
- [ ] Pagina `/meus-chamados`
- [ ] Lista de chamados com status
- [ ] Filtros por status
- [ ] Detalhes do chamado expandido
- [ ] Timeline de eventos

#### 2.3 Buscar Profissionais
- [ ] Pagina `/profissionais`
- [ ] Grid de cards de profissionais
- [ ] Filtros: categoria, avaliacao, cidade
- [ ] Ordenacao: melhor avaliado, mais servicos
- [ ] Pagina de perfil do profissional

#### 2.4 Avaliacoes
- [ ] Modal de avaliacao pos-servico
- [ ] Estrelas + comentario + fotos
- [ ] Listagem de avaliacoes no perfil

---

### Fase 3: Painel do Profissional

**Duracao Estimada:** 2-3 semanas

#### 3.1 Dashboard Profissional
- [ ] Rota `/profissional/dashboard`
- [ ] Estatisticas pessoais
- [ ] Chamados pendentes
- [ ] Ganhos do mes
- [ ] Proximos agendamentos

#### 3.2 Gerenciar Chamados
- [ ] Lista de chamados disponiveis
- [ ] Aceitar/Recusar chamado
- [ ] Enviar orcamento
- [ ] Atualizar status do servico
- [ ] Marcar como concluido

#### 3.3 Perfil Profissional
- [ ] Editar bio e experiencia
- [ ] Gerenciar especialidades
- [ ] Definir area de atuacao (raio km)
- [ ] Calendario de disponibilidade
- [ ] Portfolio de trabalhos

#### 3.4 Financeiro
- [ ] Historico de ganhos
- [ ] Extrato detalhado
- [ ] Dados bancarios para repasse

---

### Fase 4: Comunicacao e Notificacoes

**Duracao Estimada:** 2 semanas

#### 4.1 Chat em Tempo Real
- [ ] Socket.io/WebSocket integration
- [ ] Chat cliente <-> profissional
- [ ] Historico de mensagens
- [ ] Indicador de online/offline
- [ ] Notificacao de nova mensagem

#### 4.2 Sistema de Notificacoes
- [ ] Notificacoes in-app (bell icon)
- [ ] Push notifications (web)
- [ ] Email transacional:
  - Confirmacao de cadastro
  - Chamado criado
  - Orcamento recebido
  - Status atualizado
  - Lembrete de avaliacao

---

### Fase 5: Pagamentos

**Duracao Estimada:** 3-4 semanas

#### 5.1 Integracao Gateway
- [ ] Escolher gateway (Stripe/PagSeguro/Mercado Pago)
- [ ] Checkout de pagamento
- [ ] Cartao de credito/debito
- [ ] PIX
- [ ] Boleto

#### 5.2 Fluxo Financeiro
- [ ] Pagamento antecipado (cliente)
- [ ] Retencao ate conclusao
- [ ] Liberacao apos aprovacao
- [ ] Taxa da plataforma (%)
- [ ] Repasse automatico

#### 5.3 Garantia e Disputas
- [ ] Periodo de garantia (7 dias)
- [ ] Abrir disputa
- [ ] Mediacao admin
- [ ] Reembolso parcial/total

---

### Fase 6: Gamificacao

**Duracao Estimada:** 1-2 semanas

#### 6.1 Sistema de Pontos
- [ ] Pontos por servico concluido
- [ ] Pontos por avaliacao 5 estrelas
- [ ] Pontos por indicacao
- [ ] Missoes diarias/semanais

#### 6.2 Niveis e Badges
- [ ] Bronze -> Prata -> Ouro -> Platina
- [ ] Badges de conquistas
- [ ] Destaque no perfil
- [ ] Beneficios por nivel

#### 6.3 Ranking
- [ ] Ranking regional
- [ ] Profissional do mes
- [ ] Hall da fama

---

### Fase 7: Mobile App

**Duracao Estimada:** 4-6 semanas

#### 7.1 App Cliente
- [ ] React Native ou Flutter
- [ ] Todas as funcoes do web
- [ ] Push notifications nativo
- [ ] Camera para fotos
- [ ] GPS para localizacao

#### 7.2 App Profissional
- [ ] Dashboard mobile
- [ ] Aceitar chamados on-the-go
- [ ] Navegacao ate o cliente
- [ ] Checkin/checkout no local

---

### Fase 8: Melhorias e Escala

**Duracao Estimada:** Continuo

#### 8.1 Analytics
- [ ] Google Analytics
- [ ] Metricas de conversao
- [ ] Funil de vendas
- [ ] Heatmaps

#### 8.2 SEO
- [ ] Meta tags dinamicas
- [ ] Sitemap
- [ ] Schema markup
- [ ] Landing pages por cidade

#### 8.3 Performance
- [ ] CDN para assets
- [ ] Cache Redis avancado
- [ ] Lazy loading
- [ ] Image optimization

#### 8.4 Expansao
- [ ] Multi-regiao
- [ ] Multi-idioma (PT/ES)
- [ ] Novos tipos de servico
- [ ] Parcerias comerciais

---

## Metricas de Sucesso

### KPIs Principais
- Numero de usuarios cadastrados
- Numero de profissionais ativos
- Chamados criados por mes
- Taxa de conclusao de servicos
- NPS (Net Promoter Score)
- Ticket medio
- GMV (Gross Merchandise Value)

### Metas Q1 2026
- [ ] 500 usuarios cadastrados
- [ ] 50 profissionais verificados
- [ ] 200 chamados concluidos
- [ ] 4.5+ avaliacao media
- [ ] R$ 50.000 GMV

---

## Stack Tecnologica

### Backend
- NestJS 10
- Prisma ORM
- PostgreSQL 15
- Redis 7
- JWT + Passport

### Frontend
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- shadcn/ui
- Lucide Icons

### Infra
- Docker Compose (dev)
- Vercel (frontend prod)
- Railway/Render (backend prod)
- AWS S3 (storage)
- SendGrid (email)

### Mobile (Futuro)
- React Native ou Flutter
- Firebase (push)
- Maps SDK

---

## Equipe Necessaria

### Fase Atual (MVP)
- 1 Full-stack Developer

### Fase 2-4
- 1 Frontend Developer
- 1 Backend Developer
- 1 UI/UX Designer (part-time)

### Fase 5+
- + 1 Mobile Developer
- + 1 DevOps Engineer
- + 1 QA Tester

---

## Riscos e Mitigacoes

| Risco | Probabilidade | Impacto | Mitigacao |
|-------|---------------|---------|-----------|
| Falta de profissionais | Alta | Alto | Campanha de recrutamento inicial |
| Problemas de pagamento | Media | Alto | Testes extensivos, fallback manual |
| Disputas frequentes | Media | Medio | Processo claro, mediacao rapida |
| Concorrencia | Alta | Medio | Foco regional, qualidade > quantidade |

---

## Contatos

- **Projeto:** Casa Segura
- **Repositorio:** github.com/lucasgb/casa-segura
- **Documentacao:** /docs

---

*Ultima atualizacao: Janeiro 2026*
