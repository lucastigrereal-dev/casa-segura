# 🏠 ROADMAP DE EVOLUÇÃO - CASA SEGURA
## Marketplace de Serviços Residenciais

**Versão:** 1.0
**Data:** 01/02/2026
**Projeto:** Casa Segura - Serra Gaúcha
**Status Atual:** Sprint 2 Completo - Em Produção ✅

---

## 📊 ANÁLISE DO ESTADO ATUAL

### ✅ O QUE JÁ EXISTE (SPRINT 1 & 2)

**Backend NestJS (API):**
- ✅ Autenticação JWT com refresh tokens
- ✅ RBAC (3 roles: CLIENT, PROFESSIONAL, ADMIN)
- ✅ Sistema de Jobs com 14 estados
- ✅ Sistema de Quotações (multi-profissional)
- ✅ Sistema de Reviews e Ratings
- ✅ Verificação de Profissionais (3 etapas)
- ✅ Sistema de Tiers (BRONZE/SILVER/GOLD/PLATINUM)
- ✅ Catálogo de Serviços (5 categorias, 15+ missões)
- ✅ Geolocalização e raio de atuação
- ✅ Upload de fotos (antes/depois)
- ✅ Dashboard Admin completo
- ✅ API Documentation (Swagger)
- ✅ Rate Limiting e Security (Helmet)

**Frontend (3 Apps Next.js):**
- ✅ App Cliente (web-client) - Port 3000
- ✅ App Admin (web-admin) - Port 3001
- ✅ App Profissional (web-pro) - Port 3002
- ✅ TailwindCSS + Radix UI
- ✅ Sistema de navegação completo

**DevOps:**
- ✅ Monorepo com Turborepo
- ✅ Docker Compose (Postgres + Redis)
- ✅ Deploy em Vercel
- ✅ Shared packages (@casa-segura/database, @casa-segura/shared)

**Dados:**
- ✅ Seed de dados de teste
- ✅ Schema Prisma completo
- ✅ Migrações configuradas

### 🔴 LACUNAS IDENTIFICADAS (OPORTUNIDADES)

**Funcionalidades Críticas Ausentes:**
- ❌ Sistema de Pagamentos integrado (PIX, Cartão)
- ❌ Chat/Mensagens em tempo real
- ❌ Notificações Push (Web/Mobile)
- ❌ Sistema de Agendamento avançado (calendário)
- ❌ App Mobile (React Native)
- ❌ Sistema de Disputes/Garantias
- ❌ Programa de Fidelidade/Cashback
- ❌ Analytics e BI Dashboard
- ❌ SEO e Marketing (Blog, Landing Pages)
- ❌ Onboarding guiado para novos usuários

**Melhorias Técnicas:**
- ⚠️ Testes automatizados (E2E, Unit, Integration)
- ⚠️ CI/CD pipeline robusto
- ⚠️ Monitoramento e observability (Sentry, DataDog)
- ⚠️ Cache strategy (Redis uso limitado)
- ⚠️ CDN para imagens
- ⚠️ Backup automatizado
- ⚠️ Documentação técnica expandida

**Escalabilidade:**
- ⚠️ Queue system para jobs assíncronos (Bull/BullMQ)
- ⚠️ Microserviços (separar pagamentos, notificações)
- ⚠️ Load balancing
- ⚠️ Database replication (read replicas)

---

## 🎯 VISÃO ESTRATÉGICA - PRÓXIMOS 12 MESES

### OBJETIVOS DE NEGÓCIO
1. **Crescimento**: 500+ profissionais ativos, 5.000+ jobs/mês
2. **Receita**: R$ 100k MRR (20% de comissão)
3. **Satisfação**: NPS > 70
4. **Expansão**: Além da Serra Gaúcha (RS/SC)

### PILARES TECNOLÓGICOS
1. **Confiabilidade**: 99.9% uptime
2. **Performance**: < 2s page load, < 500ms API response
3. **Segurança**: PCI-DSS compliance para pagamentos
4. **Experiência**: Mobile-first, chat em tempo real

---

## 🚀 ROADMAP DETALHADO (6 SPRINTS)

---

### **SPRINT 3: PAGAMENTOS E TRANSAÇÕES** 🏦
**Duração:** 3 semanas
**Prioridade:** CRÍTICA 🔴
**Valor de Negócio:** 🔥🔥🔥🔥🔥

#### Objetivos
- Integrar gateway de pagamento (Stripe/Mercado Pago)
- Automatizar fluxo financeiro (cliente → plataforma → profissional)
- Implementar split payment (80% profissional, 20% plataforma)
- Sistema de escrow (segurar pagamento até conclusão)

#### Tarefas Backend (NestJS)

**1. Payment Module**
```typescript
// apps/api/src/modules/payments/
- payments.module.ts
- payments.service.ts
- payments.controller.ts
- dto/create-payment.dto.ts
- dto/process-refund.dto.ts
- entities/payment.entity.ts
- entities/transaction.entity.ts
- providers/mercado-pago.provider.ts (ou stripe)
```

**2. Database Schema**
```prisma
// packages/database/prisma/schema.prisma
model Payment {
  id                  String   @id @default(uuid())
  jobId               String   @unique
  job                 Job      @relation(fields: [jobId], references: [id])
  amount              Int      // centavos
  platformFee         Int      // 20%
  professionalAmount  Int      // 80%
  status              PaymentStatus @default(PENDING)
  method              PaymentMethod
  paymentProviderId   String?  // ID do Mercado Pago/Stripe
  paidAt              DateTime?
  releasedAt          DateTime? // quando liberado para profissional
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  refunds             Refund[]
  splits              PaymentSplit[]
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  IN_ESCROW
  RELEASED
  REFUNDED
  FAILED
}

enum PaymentMethod {
  CREDIT_CARD
  DEBIT_CARD
  PIX
  WALLET
}

model PaymentSplit {
  id            String   @id @default(uuid())
  paymentId     String
  payment       Payment  @relation(fields: [paymentId], references: [id])
  recipientType RecipientType
  recipientId   String   // userId do profissional ou plataforma
  amount        Int
  status        SplitStatus @default(PENDING)
  transferredAt DateTime?
  createdAt     DateTime @default(now())
}

model Refund {
  id         String   @id @default(uuid())
  paymentId  String
  payment    Payment  @relation(fields: [paymentId], references: [id])
  amount     Int
  reason     String
  status     RefundStatus @default(PENDING)
  approvedBy String?  // admin userId
  createdAt  DateTime @default(now())
  processedAt DateTime?
}

model Withdrawal {
  id              String   @id @default(uuid())
  professionalId  String
  professional    Professional @relation(fields: [professionalId], references: [id])
  amount          Int
  pixKey          String
  status          WithdrawalStatus @default(PENDING)
  requestedAt     DateTime @default(now())
  processedAt     DateTime?
  bankReceipt     String?
}
```

**3. API Endpoints**
```
POST   /api/payments                    # Criar pagamento (cliente)
GET    /api/payments/:id                # Status do pagamento
POST   /api/payments/:id/webhook        # Webhook do gateway
POST   /api/payments/:id/release        # Liberar para profissional (automático após job)
POST   /api/refunds                     # Solicitar reembolso
PATCH  /api/refunds/:id/approve         # Admin aprova reembolso

POST   /api/withdrawals                 # Profissional solicita saque
GET    /api/withdrawals/me              # Meus saques
PATCH  /api/withdrawals/:id/process     # Admin processa saque
```

**4. Business Logic**
```typescript
// Fluxo de pagamento
1. Cliente aceita quotação → Cria Payment (PENDING)
2. Cliente paga via gateway → Payment (IN_ESCROW)
3. Profissional completa job → Payment (RELEASED) após 24h de garantia
4. Sistema transfere 80% para profissional, 20% para plataforma

// Regras de negócio
- Escrow de 24-48h após conclusão (período de garantia)
- Reembolso total se profissional cancelar antes de iniciar
- Reembolso parcial (50%) se cancelar após iniciar
- Taxa de cancelamento cliente: 10%
```

**5. Integração Mercado Pago**
```bash
npm install mercadopago @nestjs/config
```

```typescript
// Configuração
MP_PUBLIC_KEY=TEST-xxx
MP_ACCESS_TOKEN=TEST-xxx
MP_WEBHOOK_SECRET=xxx
```

#### Tarefas Frontend

**web-client:**
```tsx
// pages/checkout/[jobId].tsx - Nova página de checkout
- Formulário de cartão (tokenização)
- Botão PIX (QR Code)
- Resumo do pagamento (valor, taxa, total)
- Confirmação e redirecionamento

// components/PaymentStatus.tsx
- Indicador visual de status do pagamento
- Timeline do fluxo financeiro
```

**web-pro:**
```tsx
// pages/financeiro/saques.tsx - Nova página
- Solicitar saque (mínimo R$ 50)
- Histórico de saques
- Saldo disponível vs pendente

// components/EarningsBreakdown.tsx
- Visualização detalhada de ganhos
- Jobs pagos vs pendentes
- Projeção mensal
```

**web-admin:**
```tsx
// pages/financeiro/overview.tsx
- Dashboard financeiro geral
- Total transacionado
- Receita da plataforma (20%)
- Saques pendentes (aprovar/rejeitar)
```

#### Testes
```bash
# Unit tests
- payments.service.spec.ts (lógica de split, escrow)
- mercado-pago.provider.spec.ts (integração mock)

# E2E
- /test/payments.e2e-spec.ts
  - Criar pagamento
  - Processar webhook
  - Liberar para profissional
  - Processar reembolso
```

#### Critérios de Aceitação ✅
- [ ] Cliente consegue pagar job via PIX ou cartão
- [ ] Pagamento fica em escrow até confirmação
- [ ] Profissional recebe 80% após período de garantia
- [ ] Admin consegue processar saques manuais
- [ ] Webhook do gateway processa automaticamente
- [ ] Reembolsos funcionam corretamente
- [ ] Dashboard financeiro mostra métricas corretas

---

### **SPRINT 4: CHAT E NOTIFICAÇÕES** 💬
**Duração:** 3 semanas
**Prioridade:** ALTA 🟠
**Valor de Negócio:** 🔥🔥🔥🔥

#### Objetivos
- Chat em tempo real (cliente ↔ profissional)
- Notificações push (web + preparar mobile)
- Sistema de mensagens transacionais (email/SMS)
- Histórico de conversas

#### Tecnologias
- **WebSocket:** Socket.IO
- **Notificações:** Firebase Cloud Messaging (FCM)
- **Email:** SendGrid ou AWS SES
- **SMS:** Twilio (opcional)

#### Tarefas Backend

**1. Chat Module (WebSocket)**
```typescript
// apps/api/src/modules/chat/
- chat.module.ts
- chat.gateway.ts (WebSocket)
- chat.service.ts
- chat.controller.ts (REST para histórico)
- dto/send-message.dto.ts
- entities/conversation.entity.ts
- entities/message.entity.ts
```

**2. Database Schema**
```prisma
model Conversation {
  id              String   @id @default(uuid())
  jobId           String   @unique
  job             Job      @relation(fields: [jobId], references: [id])
  participantIds  String[] // [clientId, professionalId]
  lastMessageAt   DateTime @default(now())
  createdAt       DateTime @default(now())

  messages        Message[]
  @@index([participantIds])
}

model Message {
  id             String   @id @default(uuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  senderId       String
  sender         User     @relation(fields: [senderId], references: [id])
  content        String   @db.Text
  type           MessageType @default(TEXT)
  attachmentUrl  String?
  readAt         DateTime?
  createdAt      DateTime @default(now())

  @@index([conversationId, createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  FILE
  SYSTEM // mensagens automáticas do sistema
}

model Notification {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  type       NotificationType
  title      String
  body       String
  data       Json?    // payload customizado
  readAt     DateTime?
  sentAt     DateTime @default(now())

  @@index([userId, readAt])
}

enum NotificationType {
  NEW_JOB          // profissional: novo job disponível
  NEW_QUOTE        // cliente: recebeu quotação
  QUOTE_ACCEPTED   // profissional: quotação aceita
  JOB_STARTED      // cliente: profissional iniciou trabalho
  JOB_COMPLETED    // cliente: trabalho concluído
  PAYMENT_RECEIVED // profissional: pagamento recebido
  NEW_MESSAGE      // ambos: nova mensagem
  NEW_REVIEW       // profissional: recebeu avaliação
}
```

**3. WebSocket Events**
```typescript
// Client → Server
'chat:join' { conversationId }
'chat:leave' { conversationId }
'chat:message' { conversationId, content, type }
'chat:typing' { conversationId }
'chat:read' { messageId }

// Server → Client
'chat:message' { message }
'chat:typing' { userId, isTyping }
'chat:read' { messageId, userId }
'chat:user-online' { userId }
'chat:user-offline' { userId }
```

**4. Notifications Module**
```typescript
// apps/api/src/modules/notifications/
- notifications.module.ts
- notifications.service.ts
- notifications.controller.ts
- providers/fcm.provider.ts
- providers/email.provider.ts
- providers/sms.provider.ts (opcional)
```

**5. API Endpoints**
```
# Chat (REST)
GET    /api/conversations              # Listar conversas do usuário
GET    /api/conversations/:id          # Detalhes + mensagens
POST   /api/conversations/:id/messages # Enviar mensagem (fallback REST)
PATCH  /api/messages/:id/read          # Marcar como lida

# WebSocket
ws://api/chat (Socket.IO namespace)

# Notifications
GET    /api/notifications              # Listar notificações
PATCH  /api/notifications/:id/read     # Marcar como lida
PATCH  /api/notifications/read-all     # Marcar todas como lidas
POST   /api/notifications/register     # Registrar FCM token
```

**6. Triggers de Notificação (Automáticos)**
```typescript
// Eventos que disparam notificações
- Job criado → Notificar profissionais no raio
- Quote enviada → Notificar cliente
- Quote aceita → Notificar profissional
- Job iniciado → Notificar cliente
- Job concluído → Notificar cliente (solicitar review)
- Pagamento liberado → Notificar profissional
- Nova mensagem → Notificar destinatário
```

#### Tarefas Frontend

**web-client & web-pro:**
```tsx
// components/Chat/ChatBox.tsx
- Interface de chat em tempo real
- Lista de mensagens
- Input com upload de imagem
- Indicador de "digitando..."
- Status online/offline

// components/Notifications/NotificationBell.tsx
- Badge com contador
- Dropdown com últimas notificações
- Marcar como lida
- Link para página completa

// hooks/useChat.ts
- Hook para gerenciar conexão Socket.IO
- Estado de mensagens
- Enviar/receber mensagens
- Indicadores de leitura

// hooks/useNotifications.ts
- Hook para FCM
- Solicitar permissão de notificações
- Receber notificações em foreground
- Atualizar badge

// pages/mensagens.tsx
- Lista de conversas (inbox)
- Chat selecionado
- Design similar WhatsApp Web
```

**web-admin:**
```tsx
// pages/notificacoes/enviar.tsx
- Enviar notificação manual (broadcast)
- Filtros: role, região, tier
- Preview antes de enviar
```

#### Configuração Firebase
```bash
# Install
npm install firebase-admin firebase

# Setup
FIREBASE_PROJECT_ID=casa-segura
FIREBASE_CLIENT_EMAIL=xxx
FIREBASE_PRIVATE_KEY=xxx
```

#### Testes
```typescript
// E2E WebSocket
- Conectar ao chat
- Enviar mensagem
- Receber mensagem
- Indicador de digitando
- Marcar como lida

// Notificações
- Criar notificação
- Enviar push
- Enviar email transacional
```

#### Critérios de Aceitação ✅
- [ ] Chat em tempo real funciona entre cliente e profissional
- [ ] Notificações push chegam no navegador
- [ ] Emails transacionais são enviados
- [ ] Histórico de mensagens é persistido
- [ ] Indicadores de leitura e digitando funcionam
- [ ] Badge de notificações atualiza em tempo real

---

### **SPRINT 5: MOBILE APP (MVP)** 📱
**Duração:** 4 semanas
**Prioridade:** ALTA 🟠
**Valor de Negócio:** 🔥🔥🔥🔥🔥

#### Objetivos
- App mobile para clientes (iOS + Android)
- App mobile para profissionais (iOS + Android)
- Shared codebase (React Native)
- Push notifications nativas
- Geolocalização nativa
- Camera para fotos

#### Tecnologia Stack
- **Framework:** React Native 0.73+ (Expo)
- **Navigation:** React Navigation 6
- **State:** Zustand + React Query
- **UI:** NativeWind (TailwindCSS for RN) + React Native Paper
- **APIs:** Axios (reutilizar tipos do web)
- **Auth:** AsyncStorage + Secure Store
- **Maps:** React Native Maps
- **Camera:** Expo Camera
- **Notifications:** Expo Notifications + FCM

#### Estrutura do Projeto
```
apps/
├── mobile-client/        # App do Cliente
│   ├── src/
│   │   ├── screens/      # Telas
│   │   ├── components/   # Componentes reutilizáveis
│   │   ├── navigation/   # Navegação
│   │   ├── services/     # API calls
│   │   ├── hooks/        # Custom hooks
│   │   ├── store/        # Zustand stores
│   │   └── utils/        # Utilitários
│   ├── app.json
│   └── package.json
│
└── mobile-pro/           # App do Profissional
    └── src/ (mesma estrutura)
```

#### Telas Principais - Cliente

**1. Autenticação**
```
- SplashScreen
- OnboardingScreen (3 slides)
- LoginScreen
- RegisterScreen
- ForgotPasswordScreen
```

**2. Home & Navegação**
```
- HomeScreen (tabs: Home, Meus Jobs, Mensagens, Perfil)
- CategoriesScreen (grid de categorias)
- MissionListScreen (lista de missões por categoria)
- ProfessionalListScreen (profissionais disponíveis)
- ProfessionalDetailScreen (perfil do profissional)
```

**3. Job Flow**
```
- CreateJobScreen (multi-step form)
  - Selecionar missão
  - Responder diagnóstico
  - Adicionar fotos
  - Selecionar endereço (mapa)
  - Revisar e confirmar

- JobDetailScreen
  - Status do job
  - Quotações recebidas
  - Chat com profissional
  - Fotos antes/depois
  - Pagamento

- QuotesScreen (lista de quotações)
- PaymentScreen (checkout)
```

**4. Mensagens & Perfil**
```
- ConversationsScreen (lista de chats)
- ChatScreen (chat individual)
- ProfileScreen (editar perfil)
- AddressesScreen (gerenciar endereços)
- SettingsScreen (notificações, privacidade)
```

#### Telas Principais - Profissional

**1. Dashboard**
```
- DashboardScreen (stats, jobs hoje, ganhos)
- AvailableJobsScreen (jobs no raio)
- MyJobsScreen (tabs: Pendentes, Em andamento, Concluídos)
- JobDetailScreen
  - Enviar quotação
  - Iniciar job
  - Adicionar fotos
  - Completar job
```

**2. Financeiro**
```
- EarningsScreen (ganhos, saldo disponível)
- WithdrawalsScreen (solicitar saque)
- TransactionsScreen (histórico)
```

**3. Serviços & Perfil**
```
- MyServicesScreen (editar catálogo)
- ProfileScreen (editar perfil profissional)
- VerificationScreen (upload docs)
- SettingsScreen
  - Raio de atuação
  - Disponibilidade (toggle on/off)
  - Notificações
```

#### Features Nativas

**Geolocalização**
```typescript
// hooks/useLocation.ts
import * as Location from 'expo-location';

export const useLocation = () => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location.coords);
      }
    })();
  }, []);

  return location;
};
```

**Camera**
```typescript
// screens/TakePhotoScreen.tsx
import { Camera } from 'expo-camera';

const TakePhotoScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);

  // ... lógica de captura e upload
};
```

**Push Notifications**
```typescript
// services/notifications.ts
import * as Notifications from 'expo-notifications';

export const registerForPushNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return;

  const token = await Notifications.getExpoPushTokenAsync();
  // Enviar token para backend
  await api.post('/notifications/register', { token: token.data });
};
```

#### Shared Components
```tsx
// Criar biblioteca compartilhada
packages/
└── mobile-ui/
    ├── Button.tsx
    ├── Card.tsx
    ├── Input.tsx
    ├── Avatar.tsx
    ├── Badge.tsx
    ├── Rating.tsx
    └── index.ts
```

#### API Integration
```typescript
// services/api.ts (reutilizar tipos do web)
import { Job, Quote, User } from '@casa-segura/shared';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

// Interceptor para auth
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const jobsService = {
  getAll: () => api.get<Job[]>('/jobs'),
  getById: (id: string) => api.get<Job>(`/jobs/${id}`),
  create: (data: CreateJobDto) => api.post<Job>('/jobs', data),
  // ...
};
```

#### Build & Deploy
```bash
# Development
npx expo start

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

**EAS Configuration**
```json
// eas.json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

#### Testes
```typescript
// Unit tests com Jest
- components/__tests__/Button.test.tsx
- hooks/__tests__/useAuth.test.ts

// E2E com Detox
- e2e/auth.e2e.ts
- e2e/createJob.e2e.ts
```

#### Critérios de Aceitação ✅
- [ ] Cliente consegue criar job pelo app mobile
- [ ] Profissional recebe notificação de novo job
- [ ] Chat funciona em tempo real no mobile
- [ ] Geolocalização funciona para endereço
- [ ] Camera funciona para fotos do job
- [ ] Push notifications chegam (iOS + Android)
- [ ] App funciona offline (cache básico)
- [ ] Build de produção (TestFlight + Google Play Beta)

---

### **SPRINT 6: AGENDAMENTO E CALENDÁRIO** 📅
**Duração:** 2 semanas
**Prioridade:** MÉDIA 🟡
**Valor de Negócio:** 🔥🔥🔥

#### Objetivos
- Sistema de agendamento de serviços
- Calendário do profissional (disponibilidade)
- Integração com Google Calendar (opcional)
- Lembretes automáticos (24h antes)
- Reagendamento fácil

#### Tarefas Backend

**1. Scheduling Module**
```prisma
model Availability {
  id              String   @id @default(uuid())
  professionalId  String
  professional    Professional @relation(fields: [professionalId], references: [id])
  dayOfWeek       Int      // 0-6 (Dom-Sab)
  startTime       String   // "08:00"
  endTime         String   // "18:00"
  isActive        Boolean  @default(true)

  @@index([professionalId, dayOfWeek])
}

model TimeSlot {
  id              String   @id @default(uuid())
  professionalId  String
  professional    Professional @relation(fields: [professionalId], references: [id])
  date            DateTime @db.Date
  startTime       String
  endTime         String
  isBooked        Boolean  @default(false)
  jobId           String?  @unique
  job             Job?     @relation(fields: [jobId], references: [id])

  @@index([professionalId, date])
}

model Appointment {
  id              String   @id @default(uuid())
  jobId           String   @unique
  job             Job      @relation(fields: [jobId], references: [id])
  scheduledDate   DateTime
  scheduledTime   String   // "14:00"
  duration        Int      // minutos estimados
  status          AppointmentStatus @default(SCHEDULED)
  reminderSent    Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  RESCHEDULED
  CANCELLED
  COMPLETED
}
```

**2. API Endpoints**
```
# Disponibilidade (Profissional)
POST   /api/professionals/me/availability     # Definir horários
GET    /api/professionals/:id/availability    # Ver disponibilidade
PATCH  /api/professionals/me/availability/:id # Atualizar

# Time Slots (gerados automaticamente baseado em availability)
GET    /api/professionals/:id/slots?date=YYYY-MM-DD
POST   /api/professionals/me/slots/block      # Bloquear horário específico

# Agendamentos
POST   /api/appointments                      # Agendar job
GET    /api/appointments/me                   # Meus agendamentos
PATCH  /api/appointments/:id/reschedule       # Reagendar
PATCH  /api/appointments/:id/cancel           # Cancelar
```

**3. Cron Jobs**
```typescript
// Lembretes 24h antes
@Cron('0 10 * * *') // Todos os dias às 10h
async sendAppointmentReminders() {
  const tomorrow = addDays(new Date(), 1);
  const appointments = await this.findByDate(tomorrow, { reminderSent: false });

  for (const appointment of appointments) {
    await this.notificationsService.send({
      userId: appointment.job.clientId,
      type: 'APPOINTMENT_REMINDER',
      title: 'Lembrete: Serviço agendado para amanhã',
      body: `${appointment.job.mission.name} às ${appointment.scheduledTime}`,
    });

    await this.update(appointment.id, { reminderSent: true });
  }
}
```

#### Tarefas Frontend

**web-client:**
```tsx
// components/Calendar/AvailabilityPicker.tsx
- Calendário visual (react-calendar ou date-fns)
- Slots de horário disponíveis
- Seleção de data e hora
- Duração estimada do serviço

// pages/agendar/[quoteId].tsx
- Fluxo de agendamento após aceitar quotação
- Ver disponibilidade do profissional
- Confirmar agendamento
```

**web-pro:**
```tsx
// pages/agenda.tsx
- Calendário mensal do profissional
- Ver agendamentos do dia/semana/mês
- Bloquear horários (férias, compromissos)

// components/AvailabilitySettings.tsx
- Configurar horário de trabalho (Segunda-Sexta 8-18h)
- Horários especiais
- Dias bloqueados
```

#### Integração Google Calendar (Opcional)
```typescript
// providers/google-calendar.provider.ts
import { google } from 'googleapis';

export class GoogleCalendarProvider {
  async createEvent(appointment: Appointment) {
    const calendar = google.calendar('v3');
    await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `Casa Segura: ${appointment.job.mission.name}`,
        start: { dateTime: appointment.scheduledDate.toISOString() },
        end: { dateTime: addMinutes(appointment.scheduledDate, appointment.duration).toISOString() },
        reminders: {
          useDefault: false,
          overrides: [{ method: 'popup', minutes: 1440 }], // 24h
        },
      },
    });
  }
}
```

#### Critérios de Aceitação ✅
- [ ] Profissional define horários de trabalho
- [ ] Cliente vê slots disponíveis em calendário
- [ ] Cliente agenda serviço para data/hora específica
- [ ] Lembretes automáticos são enviados 24h antes
- [ ] Profissional vê agenda semanal/mensal
- [ ] Reagendamento funciona corretamente

---

### **SPRINT 7: ANALYTICS E BI DASHBOARD** 📊
**Duração:** 2 semanas
**Prioridade:** MÉDIA 🟡
**Valor de Negócio:** 🔥🔥🔥

#### Objetivos
- Dashboard de métricas de negócio (Admin)
- Relatórios personalizados
- Gráficos e visualizações
- Exportação de dados (CSV/PDF)
- KPIs em tempo real

#### Tecnologias
- **Backend:** @nestjs/microservices (analytics service)
- **Frontend:** Recharts ou Chart.js
- **BI:** Metabase (opcional, self-hosted)

#### Tarefas Backend

**1. Analytics Module**
```typescript
// apps/api/src/modules/analytics/
- analytics.module.ts
- analytics.service.ts
- analytics.controller.ts
- dto/date-range.dto.ts
- entities/metric.entity.ts
```

**2. Métricas Principais**
```typescript
interface DashboardMetrics {
  // Jobs
  totalJobs: number;
  jobsByStatus: Record<JobStatus, number>;
  jobsCompletedToday: number;
  avgJobDuration: number; // minutos
  jobCompletionRate: number; // %

  // Financeiro
  totalRevenue: number;
  platformRevenue: number; // 20%
  avgJobValue: number;
  topSpendingClients: User[];
  topEarningProfessionals: Professional[];

  // Usuários
  totalUsers: number;
  newUsersThisMonth: number;
  activeUsers: number;
  usersByRole: Record<UserRole, number>;

  // Profissionais
  totalProfessionals: number;
  verifiedProfessionals: number;
  professionalsByTier: Record<ProfessionalTier, number>;
  avgProfessionalRating: number;

  // Categorias
  topCategories: { category: Category; jobCount: number }[];
  topMissions: { mission: Mission; jobCount: number }[];

  // Growth
  jobsGrowth: number; // % vs mês anterior
  revenueGrowth: number;
  userGrowth: number;
}
```

**3. API Endpoints**
```
GET /api/analytics/dashboard?period=30d
GET /api/analytics/jobs?startDate&endDate
GET /api/analytics/revenue?startDate&endDate
GET /api/analytics/professionals/leaderboard
GET /api/analytics/export?format=csv|pdf
```

**4. Database Views (Performance)**
```sql
-- Criar views materializadas para queries pesadas
CREATE MATERIALIZED VIEW mv_daily_metrics AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as total_jobs,
  SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_jobs,
  AVG(final_price) as avg_job_value
FROM jobs
GROUP BY DATE(created_at);

-- Refresh diário via cron
REFRESH MATERIALIZED VIEW mv_daily_metrics;
```

#### Tarefas Frontend (web-admin)

**1. Dashboard Page**
```tsx
// pages/analytics/dashboard.tsx
import { Line, Bar, Pie } from 'recharts';

const AnalyticsDashboard = () => {
  const { data } = useQuery('dashboard-metrics', fetchMetrics);

  return (
    <div className="grid grid-cols-4 gap-4">
      {/* KPI Cards */}
      <MetricCard title="Jobs Hoje" value={data.jobsToday} change="+12%" />
      <MetricCard title="Receita Mês" value={formatCurrency(data.monthRevenue)} />
      <MetricCard title="Profissionais Ativos" value={data.activePros} />
      <MetricCard title="NPS" value={data.nps} />

      {/* Charts */}
      <div className="col-span-2">
        <LineChart data={data.jobsTimeseries} title="Jobs por Dia" />
      </div>

      <div className="col-span-2">
        <BarChart data={data.revenueByCategory} title="Receita por Categoria" />
      </div>

      <div>
        <PieChart data={data.jobsByStatus} title="Jobs por Status" />
      </div>

      {/* Tables */}
      <div className="col-span-2">
        <TopProfessionalsTable data={data.topPros} />
      </div>
    </div>
  );
};
```

**2. Reports Page**
```tsx
// pages/analytics/relatorios.tsx
- Filtros: período, categoria, profissional, status
- Tabela de dados filtrados
- Botões de exportação (CSV, PDF)
- Agendamento de relatórios (email semanal)
```

**3. Components**
```tsx
// components/Analytics/MetricCard.tsx
- KPI card com valor, título, mudança %

// components/Analytics/DateRangePicker.tsx
- Seletor de período (Hoje, Semana, Mês, Custom)

// components/Analytics/ExportButton.tsx
- Botão para baixar relatório
```

#### Testes
```typescript
// analytics.service.spec.ts
- Cálculo correto de métricas
- Agregações
- Filtros de data

// dashboard.e2e-spec.ts
- Carregar dashboard
- Aplicar filtros
- Exportar relatório
```

#### Critérios de Aceitação ✅
- [ ] Dashboard mostra KPIs principais
- [ ] Gráficos são interativos e atualizados
- [ ] Filtros de data funcionam
- [ ] Exportação CSV funciona
- [ ] Performance < 2s para carregar dashboard
- [ ] Dados refletem estado real do sistema

---

### **SPRINT 8: SEO, MARKETING E GROWTH** 🚀
**Duração:** 2 semanas
**Prioridade:** MÉDIA 🟡
**Valor de Negócio:** 🔥🔥🔥🔥

#### Objetivos
- Landing pages otimizadas (SEO)
- Blog para conteúdo (aumentar tráfego orgânico)
- Programa de indicação (referral)
- Cupons e promoções
- Email marketing (newsletter)

#### Tarefas Backend

**1. Referral Module**
```prisma
model ReferralCode {
  id              String   @id @default(uuid())
  code            String   @unique // "LUCAS2024"
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  discount        Int      // centavos ou %
  discountType    DiscountType
  maxUses         Int?     // null = ilimitado
  usedCount       Int      @default(0)
  expiresAt       DateTime?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())

  usages          ReferralUsage[]
}

model ReferralUsage {
  id              String   @id @default(uuid())
  codeId          String
  code            ReferralCode @relation(fields: [codeId], references: [id])
  usedBy          String
  user            User     @relation(fields: [usedBy], references: [id])
  jobId           String?
  job             Job?     @relation(fields: [jobId], references: [id])
  discountAmount  Int
  usedAt          DateTime @default(now())
}

model Coupon {
  id              String   @id @default(uuid())
  code            String   @unique // "PRIMEIROSERVICO"
  discount        Int
  discountType    DiscountType
  minJobValue     Int?     // valor mínimo do job
  categories      String[] // categorias válidas
  firstTimeOnly   Boolean  @default(false)
  maxUses         Int?
  usedCount       Int      @default(0)
  startsAt        DateTime
  expiresAt       DateTime
  isActive        Boolean  @default(true)

  usages          CouponUsage[]
}

enum DiscountType {
  PERCENTAGE
  FIXED_AMOUNT
}
```

**2. Blog/CMS Module (Headless CMS)**
```prisma
model BlogPost {
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  excerpt     String
  content     String   @db.Text
  coverImage  String?
  authorId    String
  author      User     @relation(fields: [authorId], references: [id])
  category    BlogCategory
  tags        String[]
  seoTitle    String?
  seoDescription String?
  views       Int      @default(0)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([publishedAt])
}

enum BlogCategory {
  DICAS
  TUTORIAIS
  NOTICIAS
  CASES
}
```

**3. API Endpoints**
```
# Referrals
POST   /api/referrals/generate             # Gerar código próprio
GET    /api/referrals/me                   # Meus códigos
POST   /api/referrals/validate/:code       # Validar código

# Coupons
POST   /api/coupons/validate/:code         # Validar cupom
GET    /api/coupons/active                 # Cupons ativos (público)

# Blog
GET    /api/blog/posts                     # Listar posts (paginado)
GET    /api/blog/posts/:slug               # Detalhes do post
POST   /api/blog/posts                     # Criar post (admin)
PATCH  /api/blog/posts/:id                 # Editar post
```

#### Tarefas Frontend

**1. Landing Pages (web-client)**
```tsx
// pages/index.tsx - Homepage otimizada
- Hero section (CTA: "Encontre seu profissional")
- Como funciona (3 passos)
- Categorias populares
- Depoimentos (reviews)
- FAQ
- Footer com SEO links

// pages/categorias/[slug].tsx - Landing por categoria
- "Eletricista em Caxias do Sul"
- Lista de profissionais
- Preços médios
- FAQ específico da categoria
- CTA: "Solicitar Orçamento"

// pages/profissionais/[slug].tsx - Perfil público SEO-friendly
- URL: /profissionais/joao-silva-eletricista-caxias
- Rich snippets (schema.org)
- Reviews
- Portfólio
```

**2. Blog**
```tsx
// pages/blog/index.tsx
- Lista de posts (grid)
- Filtro por categoria
- Busca

// pages/blog/[slug].tsx
- Post completo
- Related posts
- CTA: "Precisa desse serviço?"
- Share buttons (WhatsApp, Facebook)
```

**3. Programa de Indicação**
```tsx
// pages/indique-e-ganhe.tsx
- Explicação do programa
- Gerador de código personalizado
- Compartilhar link (WhatsApp, Email)
- Contador de indicações

// components/ReferralInput.tsx
- Input para código de indicação
- Validação em tempo real
- Mostrar desconto aplicado
```

**4. SEO Components**
```tsx
// components/SEO/MetaTags.tsx
import Head from 'next/head';

const MetaTags = ({ title, description, image, url }) => (
  <Head>
    <title>{title} | Casa Segura</title>
    <meta name="description" content={description} />

    {/* Open Graph (Facebook) */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={image} />
    <meta property="og:url" content={url} />

    {/* Twitter */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />

    {/* Structured Data */}
    <script type="application/ld+json">
      {JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "Casa Segura",
        "description": description,
        "url": url,
        "telephone": "+55123456789",
        "address": {
          "@type": "PostalAddress",
          "addressRegion": "RS",
          "addressCountry": "BR"
        }
      })}
    </script>
  </Head>
);
```

#### Marketing Automation

**1. Email Marketing (SendGrid)**
```typescript
// templates/welcome-email.ts
const welcomeEmail = {
  subject: 'Bem-vindo à Casa Segura!',
  html: `
    <h1>Olá {{name}}!</h1>
    <p>Use o cupom PRIMEIROSERVICO para 10% de desconto</p>
  `,
};

// Triggers
- Novo cadastro → Email de boas-vindas + cupom
- Sem atividade 7 dias → Email de reengajamento
- Job concluído → Solicitar review + cupom próximo serviço
```

**2. Google Analytics & Pixel**
```tsx
// components/Tracking.tsx
<Script src="https://www.googletagmanager.com/gtag/js?id=G-XXXXX" />
<Script id="google-analytics">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXX');
  `}
</Script>

// Events
- gtag('event', 'create_job', { category: 'Elétrica' });
- gtag('event', 'accept_quote', { value: 150.00 });
```

#### Critérios de Aceitação ✅
- [ ] Landing pages carregam em < 2s
- [ ] Score Lighthouse > 90
- [ ] Blog publicado com 5+ posts
- [ ] Programa de indicação funcional
- [ ] Cupons aplicam desconto corretamente
- [ ] Google Analytics rastreando eventos

---

### **SPRINT 9: TESTES E QA COMPLETO** 🧪
**Duração:** 2 semanas
**Prioridade:** ALTA 🟠
**Valor de Negócio:** 🔥🔥🔥🔥

#### Objetivos
- Cobertura de testes > 80%
- Testes E2E completos
- Testes de performance
- Testes de segurança
- CI/CD pipeline robusto

#### Tipos de Testes

**1. Unit Tests (Jest)**
```bash
# Backend (NestJS)
apps/api/src/**/*.spec.ts

Exemplos:
- auth.service.spec.ts (login, register, token)
- jobs.service.spec.ts (criar job, mudar status)
- payments.service.spec.ts (cálculo de split, escrow)
- professionals.service.spec.ts (verificação, ratings)

# Meta: > 80% cobertura
npm run test:cov
```

**2. Integration Tests**
```typescript
// apps/api/test/integration/
- jobs-workflow.integration.spec.ts
  - Fluxo completo: criar job → quotação → aceitar → pagar → completar → review

- payment-split.integration.spec.ts
  - Pagamento → Split 80/20 → Escrow → Release

- professional-verification.integration.spec.ts
  - Upload docs → Verificação → Mudança de tier
```

**3. E2E Tests (Playwright)**
```typescript
// apps/web-client/tests/e2e/
- auth.spec.ts (login, logout, register)
- create-job.spec.ts (fluxo completo de criação)
- accept-quote.spec.ts (aceitar quotação e pagar)
- chat.spec.ts (enviar mensagem)

// apps/web-pro/tests/e2e/
- send-quote.spec.ts (enviar quotação)
- complete-job.spec.ts (completar serviço)

// Setup
npm install @playwright/test
npx playwright install
npx playwright test
```

**4. Performance Tests (Artillery)**
```yaml
# performance/load-test.yml
config:
  target: 'https://api.casa-segura.com'
  phases:
    - duration: 60
      arrivalRate: 10 # 10 requests/sec
      name: "Warm up"
    - duration: 300
      arrivalRate: 50 # 50 requests/sec
      name: "Load test"

scenarios:
  - name: "Create job flow"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "test@example.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/jobs"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            missionId: "{{ $randomString() }}"
            addressId: "{{ $randomString() }}"

# Rodar
artillery run performance/load-test.yml
```

**5. Security Tests**

**OWASP ZAP (Automated)**
```bash
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t https://api.casa-segura.com \
  -r zap-report.html
```

**Testes Manuais:**
- [ ] SQL Injection (inputs de formulário)
- [ ] XSS (comentários, reviews)
- [ ] CSRF (endpoints críticos têm proteção)
- [ ] JWT expiration e refresh
- [ ] Rate limiting funciona
- [ ] File upload validation (apenas imagens, tamanho máx)
- [ ] Authorization (usuário não acessa dados de outro)

#### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npm run db:generate

      - name: Run unit tests
        run: npm run test:cov

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build apps
        run: npm run build

      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

#### Quality Gates
```yaml
# Configurar no GitHub
- Cobertura de testes > 80%
- Todos os testes passando
- Build bem-sucedido
- Lighthouse score > 90
- Zero vulnerabilidades críticas (npm audit)
```

#### Testes de Usabilidade
```
- 5 usuários testadores (clientes)
- 3 profissionais testadores
- Tarefas:
  1. Criar conta
  2. Solicitar serviço
  3. Aceitar quotação
  4. Completar pagamento
  5. Avaliar serviço

- Métricas:
  - Taxa de conclusão > 90%
  - Tempo médio por tarefa
  - Satisfação (1-10) > 8
```

#### Critérios de Aceitação ✅
- [ ] Cobertura de testes > 80%
- [ ] Todos os testes E2E passando
- [ ] Performance: API < 500ms, Web < 2s
- [ ] Zero vulnerabilidades críticas
- [ ] CI/CD pipeline configurado
- [ ] Testes de usabilidade realizados

---

## 📈 ROADMAP DE 12 MESES - VISÃO GERAL

```
┌─────────────────────────────────────────────────────────────────┐
│                      LINHA DO TEMPO                              │
├─────────────────────────────────────────────────────────────────┤
│ Mês 1-2  │ Sprint 3: Pagamentos (CRÍTICO)                       │
│ Mês 3-4  │ Sprint 4: Chat + Notificações (ALTA)                 │
│ Mês 5-6  │ Sprint 5: Mobile App MVP (ALTA)                      │
│ Mês 7    │ Sprint 6: Agendamento (MÉDIA)                        │
│ Mês 8    │ Sprint 7: Analytics + BI (MÉDIA)                     │
│ Mês 9    │ Sprint 8: SEO + Marketing (MÉDIA)                    │
│ Mês 10-11│ Sprint 9: Testes + QA (ALTA)                         │
│ Mês 12   │ Sprint 10: Polimento + Launch 2.0                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 KPIs E MÉTRICAS DE SUCESSO

### Técnicos
- **Performance:** API < 500ms (p95), Web < 2s LCP
- **Uptime:** 99.9% (< 43min downtime/mês)
- **Cobertura Testes:** > 80%
- **Bugs em Produção:** < 5/mês
- **Deploy Frequency:** Daily (trunk-based development)

### Negócio
- **GMV (Gross Merchandise Volume):** R$ 500k/mês (após 12 meses)
- **Take Rate:** 20% (R$ 100k MRR)
- **Profissionais Ativos:** 500+
- **Jobs/Mês:** 5.000+
- **NPS:** > 70
- **CAC (Customer Acquisition Cost):** < R$ 50
- **LTV (Lifetime Value):** > R$ 500
- **Churn:** < 5%/mês

### Produto
- **Tempo Médio de Match:** < 4h (job → primeira quotação)
- **Taxa de Conversão:** 30% (job criado → pago)
- **Taxa de Conclusão:** 95% (jobs iniciados → concluídos)
- **Rating Médio:** > 4.5/5

---

## 🚨 RISCOS E MITIGAÇÕES

### Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Gateway de pagamento instável | Alto | Média | Implementar retry logic + fallback gateway |
| Escalabilidade (> 10k jobs/mês) | Alto | Alta | Load testing, database indexing, cache layer |
| WebSocket desconexões | Médio | Alta | Reconnection logic + fallback polling |
| Vazamento de dados | Crítico | Baixa | Penetration testing + audit logs + encryption |

### Riscos de Negócio

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Baixa adoção de profissionais | Alto | Média | Programa de onboarding + incentivos financeiros |
| Disputas cliente-profissional | Médio | Alta | Sistema de garantia + suporte dedicado |
| Concorrência (GetNinjas, etc) | Alto | Alta | Diferenciação (qualidade, verificação rigorosa) |
| Sazonalidade demanda | Médio | Média | Diversificar categorias de serviço |

---

## 💰 ESTIMATIVA DE CUSTOS (INFRA)

### Atual (Sprint 2)
- **Vercel:** $0/mês (Hobby plan - 3 apps)
- **Supabase/Railway (Postgres):** $5-20/mês
- **Redis:** $0 (incluído)
- **Total:** ~$20/mês

### Após Roadmap Completo (12 meses)
- **Vercel Pro:** $20/mês por app x 3 = $60/mês
- **Database (Supabase Pro):** $25/mês
- **Redis (Upstash):** $10/mês
- **Storage (AWS S3):** $10/mês (imagens)
- **Mercado Pago:** 4.99% por transação
- **SendGrid (Email):** $15/mês (40k emails)
- **Firebase (Notificações):** $10/mês
- **Sentry (Monitoring):** $26/mês
- **Mobile (App Store + Google Play):** $124/ano
- **Total:** ~$180/mês + fees transacionais

**Projeção Receita vs Custo:**
- Receita (20% de R$ 500k GMV): R$ 100k/mês
- Custo Infra: R$ 900/mês
- **Margem:** 99.1% 🚀

---

## 🎓 RECOMENDAÇÕES ESTRATÉGICAS

### 1. Priorização
**Ordem sugerida (por valor vs esforço):**
1. ✅ Sprint 3 (Pagamentos) - SEM ISSO, NÃO HÁ NEGÓCIO
2. ✅ Sprint 4 (Chat) - Diferencial competitivo
3. ✅ Sprint 9 (Testes) - Reduzir bugs em produção
4. ✅ Sprint 5 (Mobile) - 70% do tráfego é mobile
5. Sprint 6 (Agendamento) - Conveniência
6. Sprint 7 (Analytics) - Data-driven decisions
7. Sprint 8 (SEO) - Growth orgânico

### 2. Quick Wins (Fazer antes dos sprints)
- [ ] Google Analytics instalado (1h)
- [ ] Hotjar/Clarity para mapas de calor (2h)
- [ ] Intercom/Zendesk para suporte (4h)
- [ ] Status page (Statuspage.io) (2h)
- [ ] Backup diário automático (4h)
- [ ] CDN para imagens (Cloudinary) (4h)

### 3. Equipe Recomendada
- **Fase Atual (Sprint 3-5):** 2 devs full-stack
- **Fase Crescimento (Sprint 6-9):** 3 devs + 1 QA + 1 Designer
- **Fase Scale (Pós-Sprint 10):** 5 devs + 2 QA + 2 Designers + 1 DevOps

### 4. Tecnologias Futuras (Avaliar)
- **Queue System:** BullMQ (jobs assíncronos)
- **Microservices:** Separar pagamentos, notificações
- **CDN:** Cloudflare (cache, DDoS protection)
- **BI:** Metabase (self-hosted analytics)
- **A/B Testing:** PostHog ou Split.io
- **Feature Flags:** LaunchDarkly

---

## 📚 DOCUMENTAÇÃO RECOMENDADA

### Para Desenvolvedores
- [ ] API Documentation (Swagger) - ✅ Já existe
- [ ] Architecture Decision Records (ADRs)
- [ ] Database ER Diagram
- [ ] Deployment Guide (passo a passo)
- [ ] Troubleshooting Guide
- [ ] Contributing Guide

### Para Produto
- [ ] Product Roadmap (público)
- [ ] User Personas
- [ ] User Journey Maps
- [ ] Feature Specs
- [ ] Analytics Dashboard

### Para Operações
- [ ] Runbook (incident response)
- [ ] SLA/SLO definitions
- [ ] Monitoring Playbook
- [ ] Backup & Disaster Recovery Plan

---

## 🎉 CONCLUSÃO

O **Casa Segura** é um projeto tecnicamente sólido com arquitetura bem definida e stack moderna. O roadmap proposto foca em:

1. **Monetização rápida** (Pagamentos)
2. **Diferenciação competitiva** (Chat em tempo real)
3. **Expansão de alcance** (Mobile app)
4. **Otimização de operações** (Analytics, Automação)

**Próximos Passos Imediatos:**
1. Validar roadmap com stakeholders
2. Priorizar Sprint 3 (Pagamentos)
3. Definir equipe
4. Configurar CI/CD básico
5. Implementar monitoring (Sentry)

**Estimativa de Lançamento 2.0 (Completo):**
🚀 **12 meses a partir de hoje** (Fevereiro 2027)

---

**Desenvolvido com análise técnica profunda por Claude Code**
**Data:** 01/02/2026
**Versão:** 1.0
