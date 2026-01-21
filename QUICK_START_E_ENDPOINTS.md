# Casa Segura - Quick Start & API Endpoints

**Data**: 2026-01-20
**Sprint**: 2 - Completo e Deployado
**Status**: Production Ready ✅

---

## 🚀 Quick Start em 5 Minutos

### 1️⃣ Clone & Setup
```bash
git clone https://github.com/lucastigrereal-dev/casa-segura.git
cd casa-segura

# Install dependencies
npm install

# Setup database (if using locally)
npm run db:generate
npm run db:push
npm run db:seed
```

### 2️⃣ Configure Environment
```bash
# Criar .env na raiz
cp apps/api/.env.example apps/api/.env

# Minimal config:
DATABASE_URL="postgresql://localhost/casa_segura"
JWT_SECRET="your-secret-key-here"
```

### 3️⃣ Start Applications
```bash
# Terminal 1 - API (porta 3333)
npm run dev --workspace=@casa-segura/api

# Terminal 2 - Web-Pro (porta 3002) ✨ NOVO
npm run dev --workspace=@casa-segura/web-pro

# Terminal 3 - Web-Client (porta 3000)
npm run dev --workspace=@casa-segura/web-client

# Terminal 4 - Web-Admin (porta 3001)
npm run dev --workspace=@casa-segura/web-admin
```

### 4️⃣ Test Endpoints
```bash
# Health check
curl http://localhost:3333/health

# Login
curl -X POST http://localhost:3333/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"password"}'

# Get token from response, then:

# Get my profile
curl http://localhost:3333/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5️⃣ Access Web Apps
- **Web-Pro** (Profissional): http://localhost:3002/login
- **Web-Client** (Cliente): http://localhost:3000
- **Web-Admin** (Admin): http://localhost:3001

---

## 📚 API Endpoints Completos

### Authentication (`/auth`) - Público

```
POST   /auth/login
       Body: { email, password }
       Response: { user, accessToken, refreshToken }
       Status: 200 | 401

POST   /auth/register
       Body: { name, email, phone, password, role? }
       Response: { user, accessToken, refreshToken }
       Status: 201 | 400

POST   /auth/refresh
       Body: { refreshToken }
       Response: { accessToken, refreshToken }
       Status: 200 | 401

GET    /auth/me
       Headers: { Authorization: Bearer TOKEN }
       Response: { user }
       Status: 200 | 401
```

---

### Users (`/users`) - Protegido

```
GET    /users/me
       Authorization: Bearer TOKEN
       Response: { user }
       Status: 200

PATCH  /users/me
       Authorization: Bearer TOKEN
       Body: { name?, email?, phone?, avatar_url? }
       Response: { user }
       Status: 200 | 400

GET    /users/:id
       Authorization: Bearer TOKEN
       Response: { user }
       Status: 200 | 404
```

---

### Professionals (`/professionals`) - Protegido ✨ NOVOS

#### Para Profissionais
```
GET    /professionals/me/stats
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Response: {
         earnings_month,
         earnings_week,
         pending_quotes,
         acceptance_rate,
         rating_avg,
         total_jobs,
         earnings_last_7_days: [{ date, amount }]
       }
       Status: 200

GET    /professionals/me/earnings
       Query: skip?, take?
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Response: {
         available_balance,
         total_earnings_month,
         platform_fee_rate: 0.2,
         transactions: [{
           id,
           type: 'EARNING' | 'FEE' | 'WITHDRAWAL',
           amount,
           job_code,
           date,
           description
         }]
       }
       Status: 200

PATCH  /professionals/me/availability
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: { isAvailable }
       Response: { professional }
       Status: 200

PATCH  /professionals/me/radius
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: { work_radius_km } (5-100)
       Response: { professional }
       Status: 200 | 400
```

#### Públicos & Admin
```
GET    /professionals
       Query: skip?, take?, level?, isAvailable?, categoryId?, search?
       Response: { data: [professional], meta: { total, page, limit, totalPages } }
       Status: 200

GET    /professionals/:id
       Response: { professional }
       Status: 200 | 404

POST   /professionals/register
       Authorization: Bearer TOKEN
       Role: CLIENT
       Response: { professional }
       Status: 201

PATCH  /professionals/:id/verify (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { cpf_verified?, selfie_verified?, address_verified? }
       Response: { professional }
       Status: 200

PATCH  /professionals/:id/level (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' }
       Response: { professional }
       Status: 200
```

---

### Professional Services (`/professional-services`) - ✨ NOVO

```
GET    /professional-services/:proId
       Public - Get cardápio do profissional
       Response: [{ id, professional_id, mission_id, price_min, price_max, description, is_active }]
       Status: 200

POST   /professional-services
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: {
         mission_id,
         price_min,
         price_max,
         description?
       }
       Response: { service }
       Status: 201 | 400

PATCH  /professional-services/:id
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: { price_min?, price_max?, description?, is_active? }
       Response: { service }
       Status: 200 | 404

DELETE /professional-services/:id
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Status: 204 | 404
```

---

### Jobs (`/jobs`) - ✨ ATUALIZADO

#### Disponíveis para Profissionais
```
GET    /jobs/available
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Query: skip?, take?, missionId?, categoryId?
       Response: {
         data: [{
           ...job,
           distance_km: number
         }],
         meta: { total, page, limit, totalPages }
       }
       Status: 200

GET    /jobs/my-pro-jobs
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Query: skip?, take?, status?
       Response: {
         data: [jobs],
         meta: { total, page, limit, totalPages }
       }
       Status: 200
```

#### Executar Serviço
```
POST   /jobs/:id/start
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Validação: job.pro_id === userId && job.status === 'QUOTE_ACCEPTED'
       Response: { job }
       Status: 200 | 403

POST   /jobs/:id/complete
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: { photos_after: string[] }
       Validação: job.pro_id === userId && job.status === 'IN_PROGRESS'
       Response: { job }
       Status: 200 | 403
```

#### Gerais
```
GET    /jobs
       Authorization: Bearer TOKEN
       Query: skip?, take?, status?, missionId?, categoryId?
       Filtro automático por role:
         - CLIENT: Vê seus próprios jobs
         - PROFESSIONAL: Vê jobs atribuídos a ele
         - ADMIN: Vê todos
       Response: { data: [jobs], meta }
       Status: 200

GET    /jobs/:id
       Authorization: Bearer TOKEN
       Response: { job }
       Status: 200 | 404

GET    /jobs/code/:code
       Authorization: Bearer TOKEN
       Response: { job }
       Status: 200 | 404

POST   /jobs
       Authorization: Bearer TOKEN
       Role: CLIENT
       Body: {
         mission_id,
         address_id,
         scheduled_date?,
         scheduled_window?,
         diagnosis_answers?: JSON,
         photos_before?: string[]
       }
       Response: { job }
       Status: 201 | 400

PATCH  /jobs/:id/status
       Authorization: Bearer TOKEN
       Body: { status: JobStatus }
       Validação: isValidStatusTransition(current, next, role)
       Response: { job }
       Status: 200 | 403

PATCH  /jobs/:id/price
       Authorization: Bearer TOKEN
       Role: ADMIN | PROFESSIONAL
       Body: { priceFinal, priceAdditional? }
       Response: { job }
       Status: 200

PATCH  /jobs/:id/photos-after
       Authorization: Bearer TOKEN
       Body: { photos: string[] }
       Response: { job }
       Status: 200

POST   /jobs/:id/assign (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { proId }
       Response: { job }
       Status: 200
```

---

### Quotes (`/quotes`) - ✨ NOVO

```
POST   /quotes
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Body: {
         job_id,
         amount,
         notes?,
         available_dates: string[]
       }
       Response: { quote }
       Status: 201 | 400

GET    /quotes/job/:jobId
       Authorization: Bearer TOKEN
       Acesso: Cliente do job ou profissional do orçamento
       Response: [quotes]
       Status: 200 | 403

GET    /quotes/my
       Authorization: Bearer TOKEN
       Role: PROFESSIONAL
       Response: [quotes]
       Status: 200

PATCH  /quotes/:id/accept
       Authorization: Bearer TOKEN
       Role: CLIENT
       Validação: Cliente é dono do job
       Efeito: Atualiza Job para QUOTE_ACCEPTED, rejeita outros quotes
       Response: { quote, job }
       Status: 200 | 403

PATCH  /quotes/:id/reject
       Authorization: Bearer TOKEN
       Role: CLIENT
       Validação: Cliente é dono do job
       Body: { reason?: string }
       Response: { quote }
       Status: 200 | 403
```

---

### Missions (`/missions`) - Tipos de Serviço

```
GET    /missions
       Query: skip?, take?, categoryId?
       Response: { data: [missions], meta }
       Status: 200

GET    /missions/:id
       Response: { mission }
       Status: 200 | 404

POST   /missions (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: {
         name,
         description,
         category_id,
         price_default
       }
       Response: { mission }
       Status: 201 | 400

PATCH  /missions/:id (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { name?, description?, price_default? }
       Response: { mission }
       Status: 200 | 404
```

---

### Categories (`/categories`) - Categorias

```
GET    /categories
       Response: [categories]
       Status: 200

POST   /categories (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { name, description? }
       Response: { category }
       Status: 201 | 400

PATCH  /categories/:id (ADMIN)
       Authorization: Bearer TOKEN
       Role: ADMIN
       Body: { name?, description? }
       Response: { category }
       Status: 200 | 404
```

---

### Addresses (`/addresses`) - Endereços

```
GET    /addresses
       Authorization: Bearer TOKEN
       Response: [addresses]
       Status: 200

POST   /addresses
       Authorization: Bearer TOKEN
       Body: {
         label?,
         street,
         number,
         complement?,
         neighborhood,
         city,
         state,
         zip_code,
         is_default?
       }
       Response: { address }
       Status: 201 | 400

PATCH  /addresses/:id
       Authorization: Bearer TOKEN
       Body: { label?, street?, number?, ... }
       Response: { address }
       Status: 200 | 404

DELETE /addresses/:id
       Authorization: Bearer TOKEN
       Status: 204 | 404
```

---

### Reviews (`/reviews`) - Avaliações

```
GET    /reviews
       Query: skip?, take?, reviewed_id?
       Response: { data: [reviews], meta }
       Status: 200

POST   /reviews
       Authorization: Bearer TOKEN
       Body: {
         job_id,
         reviewed_id,
         rating_overall,
         rating_communication?,
         rating_cleanliness?,
         comment?,
         would_rehire?
       }
       Response: { review }
       Status: 201 | 400

GET    /reviews/:id
       Response: { review }
       Status: 200 | 404
```

---

### Health (`/health`) - Status

```
GET    /health
       Public
       Response: { status: 'ok' }
       Status: 200
```

---

## 🔐 HTTP Status Codes

| Code | Situação | Exemplo |
|------|----------|---------|
| 200 | ✅ Success | GET /users/me |
| 201 | ✅ Created | POST /jobs |
| 204 | ✅ No Content | DELETE /addresses/:id |
| 400 | ❌ Bad Request | Invalid input |
| 401 | ❌ Unauthorized | Missing token |
| 403 | ❌ Forbidden | Role/Job ownership check |
| 404 | ❌ Not Found | Resource doesn't exist |
| 500 | ❌ Server Error | Database error |

---

## 🔑 Authentication Flow

### 1️⃣ Login
```bash
POST /auth/login
{
  "email": "pro@example.com",
  "password": "senha123"
}

Response:
{
  "user": { id, name, email, role, phone, ... },
  "accessToken": "eyJhbGc...",  # 15 min
  "refreshToken": "eyJhbGc..."  # 7 days
}
```

### 2️⃣ Use Token
```bash
GET /professionals/me/stats
Authorization: Bearer eyJhbGc...
```

### 3️⃣ Token Expired?
```bash
POST /auth/refresh
{ "refreshToken": "eyJhbGc..." }

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

## 🎯 Common Workflows

### Cliente Solicitando Orçamento

```
1. POST /jobs (Cliente cria job)
   Status: CREATED

2. GET /jobs/available (Pro busca jobs)

3. POST /quotes (Pro envia orçamento)
   Job Status: QUOTE_SENT

4. PATCH /quotes/:id/accept (Cliente aceita)
   Job Status: QUOTE_ACCEPTED
   Pro atribuído ao job

5. POST /jobs/:id/start (Pro inicia)
   Status: IN_PROGRESS

6. POST /jobs/:id/complete (Pro finaliza com fotos)
   Status: PENDING_APPROVAL

7. Job aprovado automaticamente ou por cliente
   Status: COMPLETED

8. Profissional ganha comissão (80%)
   GET /professionals/me/earnings
```

### Profissional Visualizando Ganhos

```
1. GET /professionals/me/stats
   - Ganhos do mês
   - Ganhos da semana
   - Taxa de aceitação
   - Avaliação média
   - Últimos 7 dias de ganhos

2. GET /professionals/me/earnings
   - Saldo disponível (após comissão 20%)
   - Extrato de transações
   - Cada job = 2 transações (EARNING + FEE)
```

---

## 🛠️ Useful Commands

### Development
```bash
npm run dev --workspace=@casa-segura/web-pro
npm run build --workspace=@casa-segura/web-pro
npm run start --workspace=@casa-segura/web-pro
```

### Database
```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to DB
npm run db:pull          # Pull schema from DB
npm run db:migrate:dev   # Create migration
npm run db:seed          # Seed test data
npm run db:reset         # Reset DB
npm run db:studio        # Prisma Studio UI
```

### Testing
```bash
npm run test
npm run test:watch
npm run test:cov
```

### Linting
```bash
npm run lint
npm run lint:fix
```

### Build All
```bash
npm run build
```

---

## 📱 Web-Pro Login Credentials (Test)

Para testar a aplicação web-pro em produção ou dev:

```
Email:    pro@example.com
Password: password

Role:     PROFESSIONAL
Status:   ✅ Ativo
```

**Dados de teste no seed:**
- 3 profissionais
- 5 jobs de teste
- 2 orçamentos de exemplo

---

## 🌐 Ambiente Variáveis

### Backend (.env)
```
DATABASE_URL=postgresql://user:pass@localhost:5432/casa_segura
JWT_SECRET=your-secret-key
NODE_ENV=development
API_PORT=3333
```

### Web-Pro (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME=Casa Segura Pro
```

### Web-Client (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_APP_NAME=Casa Segura
```

---

## 🚀 Deploy para Produção

### Vercel
```bash
# Login
vercel login

# Deploy (auto)
git push origin master
# Vercel faz build automático

# Manual
vercel --prod --yes
```

### URL
- **Production**: https://casa-segura.vercel.app
- **Inspect**: https://vercel.com/lucastigrereal-dev/casa-segura

---

## 📊 Role-Based Access Control (RBAC)

| Endpoint | CLIENT | PROFESSIONAL | ADMIN |
|----------|--------|--------------|-------|
| POST /jobs | ✅ | ❌ | ❌ |
| GET /jobs/available | ❌ | ✅ | ✅ |
| POST /quotes | ❌ | ✅ | ❌ |
| PATCH /quotes/:id/accept | ✅ | ❌ | ❌ |
| GET /professionals/me/stats | ❌ | ✅ | ❌ |
| GET /professionals/me/earnings | ❌ | ✅ | ❌ |
| PATCH /professionals/:id/verify | ❌ | ❌ | ✅ |
| DELETE /addresses/:id | ✅ | ✅ | ✅ |

---

## 🆘 Troubleshooting

### API não responde
```bash
# Verificar se está rodando
curl http://localhost:3333/health

# Se não responder, verifique:
1. npm run dev --workspace=@casa-segura/api está rodando
2. PORT 3333 não está em uso
3. DATABASE_URL está correto
```

### Web-Pro não conecta na API
```bash
# Verificar NEXT_PUBLIC_API_URL
cat apps/web-pro/.env.local

# Deve apontar para localhost:3333 (dev) ou URL real (prod)
# Atualizar se necessário
```

### Token expirado
```bash
# Use refresh token para renovar
POST /auth/refresh

# Se refresh falhar, login novamente
POST /auth/login
```

---

**Documento Atualizado**: 2026-01-20
**Sprint**: 2 - 100% Completo
**Status**: ✅ Production Ready

*Para questões técnicas mais profundas, consulte o relatório principal: CASA_SEGURA_RELATORIO_SPRINT2.md*
