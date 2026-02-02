# 🚀 Sprint 4: Executar Migration (Chat & Notificações)

## ⚠️ IMPORTANTE: Execute Antes de Testar

O backend está implementado, mas precisa da migration do banco de dados.

---

## Passo 1: Verificar PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
psql --version

# Conectar ao banco
psql -U postgres -d casasegura
```

---

## Passo 2: Executar Migration SQL

### Opção A: Via psql (Recomendado)

```bash
# No terminal, vá para o diretório de migrations
cd casa-segura/packages/database/migrations

# Execute o script SQL
psql -U postgres -d casasegura -f add_chat_and_notifications.sql

# Você deve ver várias linhas:
# CREATE TYPE
# CREATE TABLE
# CREATE INDEX
```

### Opção B: Via GUI (PgAdmin, DBeaver, etc.)

1. Abra `packages/database/migrations/add_chat_and_notifications.sql`
2. Copie todo o conteúdo
3. Cole no query editor do seu cliente PostgreSQL
4. Execute

### Opção C: Copiar e Colar Direto

```sql
-- Conecte ao psql e cole isso:

CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'SYSTEM');
CREATE TYPE "NotificationType" AS ENUM (
  'NEW_JOB',
  'NEW_QUOTE',
  'QUOTE_ACCEPTED',
  'QUOTE_REJECTED',
  'JOB_STARTED',
  'JOB_COMPLETED',
  'PAYMENT_RECEIVED',
  'NEW_MESSAGE',
  'NEW_REVIEW',
  'SYSTEM'
);

CREATE TABLE "conversations" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "job_id" TEXT NOT NULL UNIQUE,
  "client_id" TEXT NOT NULL,
  "professional_id" TEXT,
  "last_message_at" TIMESTAMP(3),
  "last_message_preview" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversations_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
  CONSTRAINT "conversations_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "users"("id"),
  CONSTRAINT "conversations_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "users"("id")
);

CREATE TABLE "messages" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "conversation_id" TEXT NOT NULL,
  "sender_id" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'TEXT',
  "content" TEXT NOT NULL,
  "file_url" TEXT,
  "file_name" TEXT,
  "file_size" INTEGER,
  "read_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE,
  CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "job_id" TEXT,
  "quote_id" TEXT,
  "data" JSONB,
  "read_at" TIMESTAMP(3),
  "clicked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "conversations_client_id_idx" ON "conversations"("client_id");
CREATE INDEX "conversations_professional_id_idx" ON "conversations"("professional_id");
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");
```

---

## Passo 3: Verificar Sucesso

```sql
-- No psql:
\dt

-- Você deve ver as novas tabelas:
-- conversations
-- messages
-- notifications

-- Verificar estrutura:
\d conversations
\d messages
\d notifications
```

---

## Passo 4: Iniciar Backend

```bash
cd casa-segura/apps/api
npm run dev
```

**Logs esperados**:
```
[Nest] INFO [InstanceLoader] ChatModule dependencies initialized
[Nest] INFO [InstanceLoader] NotificationsModule dependencies initialized
[Nest] INFO [RoutesResolver] ChatController {/chat}
[Nest] INFO [RoutesResolver] NotificationsController {/notifications}
[Nest] INFO [NestApplication] Nest application successfully started
```

---

## Passo 5: Testar WebSocket (Opcional)

### Via Browser Console:

```javascript
// 1. Faça login e pegue o token
const token = localStorage.getItem('token'); // ou onde está armazenado

// 2. Conecte ao WebSocket
const socket = io('http://localhost:3333/chat', {
  auth: { token }
});

// 3. Listen eventos
socket.on('connect', () => {
  console.log('✅ Connected!', socket.id);
});

socket.on('unread_count', (data) => {
  console.log('📬 Unread messages:', data.count);
});

socket.on('new_notification', (notification) => {
  console.log('🔔 New notification:', notification);
});
```

### Via REST API:

```bash
# Testar endpoints REST (substitua TOKEN pelo seu JWT)

# Listar conversas
curl -H "Authorization: Bearer TOKEN" http://localhost:3333/chat/conversations

# Listar notificações
curl -H "Authorization: Bearer TOKEN" http://localhost:3333/notifications

# Contagem de não lidas
curl -H "Authorization: Bearer TOKEN" http://localhost:3333/notifications/unread-count
```

---

## ✅ Checklist Pós-Migration

- [ ] Migration SQL executada sem erros
- [ ] Tabelas criadas: conversations, messages, notifications
- [ ] Enums criados: MessageType, NotificationType
- [ ] Indexes criados
- [ ] Backend inicia sem erros
- [ ] Módulos ChatModule e NotificationsModule carregados
- [ ] Endpoints /chat e /notifications disponíveis
- [ ] (Opcional) WebSocket conecta com token JWT

---

## 🐛 Troubleshooting

### Erro: "type already exists"
```sql
-- Se você executou o script mais de uma vez, drop os tipos primeiro:
DROP TYPE IF EXISTS "MessageType" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
-- Depois execute novamente
```

### Erro: "table already exists"
```sql
-- Se precisa resetar:
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "messages" CASCADE;
DROP TABLE IF EXISTS "conversations" CASCADE;
-- Depois execute novamente
```

### Backend não inicia
- Verifique se o DATABASE_URL está correto no .env
- Verifique se o PostgreSQL está rodando
- Execute `npx prisma generate` novamente

### WebSocket não conecta
- Verifique se o token JWT está válido
- Verifique CORS no backend (deve permitir origem do frontend)
- Verifique se a porta 3333 está aberta

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do backend
2. Verifique o PostgreSQL logs
3. Consulte `docs/SPRINT_4_IMPLEMENTATION_STATUS.md`

---

**Última Atualização**: 01/02/2026
