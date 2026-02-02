# Sprint 4: Testing Guide

**Version**: 1.0.0
**Last Updated**: 01/02/2026
**Sprint**: Chat & Notifications System

---

## Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Manual Testing Scenarios](#manual-testing-scenarios)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Integration Testing](#integration-testing)
6. [WebSocket Testing](#websocket-testing)
7. [Performance Testing](#performance-testing)
8. [Known Issues](#known-issues)

---

## Pre-Testing Setup

### 1. Database Migration

**CRITICAL**: Run the database migration before testing!

```bash
cd casa-segura/packages/database/migrations
psql -U postgres -d casasegura -f add_chat_and_notifications.sql
```

**Verify**:
```sql
\dt
-- Should see: conversations, messages, notifications
```

---

### 2. Start Services

**Terminal 1 - Backend**:
```bash
cd casa-segura/apps/api
npm run dev
```

**Expected Output**:
```
[Nest] INFO [InstanceLoader] ChatModule dependencies initialized
[Nest] INFO [InstanceLoader] NotificationsModule dependencies initialized
[Nest] INFO [RoutesResolver] ChatController {/chat}
[Nest] INFO [RoutesResolver] NotificationsController {/notifications}
[Nest] INFO [NestApplication] Nest application successfully started
```

**Terminal 2 - Web Client**:
```bash
cd casa-segura/apps/web-client
npm run dev
```

**Terminal 3 - Web Pro**:
```bash
cd casa-segura/apps/web-pro
npm run dev
```

---

### 3. Test Users

Create or use existing test users:

**Client**:
- Email: `cliente@test.com`
- Password: `Test123!`
- Role: CLIENT

**Professional**:
- Email: `pro@test.com`
- Password: `Test123!`
- Role: PROFESSIONAL

---

### 4. Browser Setup

**Recommended**: Use 2 browsers or incognito windows
- Browser 1: Logged in as Client
- Browser 2: Logged in as Professional

**Ports**:
- Backend: `http://localhost:3333`
- Web Client: `http://localhost:3000`
- Web Pro: `http://localhost:3002`

---

## Manual Testing Scenarios

### Scenario 1: Complete Job Flow

**Objective**: Test the entire job lifecycle with notifications and chat.

**Steps**:

1. **Client Creates Job** (Browser 1 - Client)
   - [ ] Go to "Novo Chamado"
   - [ ] Select service category
   - [ ] Fill in details
   - [ ] Submit job
   - [ ] **Expected**: Job created, conversation created in database

2. **Professional Views Available Jobs** (Browser 2 - Pro)
   - [ ] Go to "Chamados Disponíveis"
   - [ ] See the new job listed
   - [ ] Click "Ver Detalhes"

3. **Professional Sends Quote** (Browser 2 - Pro)
   - [ ] Enter quote amount
   - [ ] Add notes
   - [ ] Submit quote
   - [ ] **Expected**: Quote submitted

4. **Client Receives Notification** (Browser 1 - Client)
   - [ ] **🔔 Notification badge updates** (should show "1")
   - [ ] Click notification bell
   - [ ] See "Nova Proposta Recebida" notification
   - [ ] **Expected**: Real-time notification appears

5. **Client Accepts Quote** (Browser 1 - Client)
   - [ ] Go to job details
   - [ ] View quote
   - [ ] Accept quote
   - [ ] **Expected**: Quote accepted

6. **Professional Receives Notification** (Browser 2 - Pro)
   - [ ] **🔔 Notification badge updates**
   - [ ] Click notification bell
   - [ ] See "Proposta Aceita" notification
   - [ ] **Expected**: Real-time notification appears

7. **Chat Becomes Available** (Both browsers)
   - [ ] Professional can see conversation
   - [ ] Client can see conversation
   - [ ] Both users see each other in conversation
   - [ ] **Expected**: Chat is active

8. **Professional Starts Job** (Browser 2 - Pro)
   - [ ] Go to job details
   - [ ] Click "Iniciar Serviço"
   - [ ] **Expected**: Status changes to "Em Andamento"

9. **Client Receives Job Started Notification** (Browser 1 - Client)
   - [ ] **🔔 Notification: "Serviço Iniciado"**
   - [ ] **Expected**: Real-time notification

10. **Real-time Chat** (Both browsers)
    - [ ] Professional sends message
    - [ ] **Client sees message instantly**
    - [ ] Client sends reply
    - [ ] **Professional sees reply instantly**
    - [ ] **Expected**: Real-time bidirectional messaging

11. **Professional Completes Job** (Browser 2 - Pro)
    - [ ] Go to job details
    - [ ] Upload "after" photos
    - [ ] Click "Concluir Serviço"
    - [ ] **Expected**: Status changes to "Aguardando Aprovação"

12. **Client Receives Completion Notification** (Browser 1 - Client)
    - [ ] **🔔 Notification: "Serviço Concluído"**
    - [ ] Click notification
    - [ ] Navigate to job details
    - [ ] **Expected**: Real-time notification and navigation

13. **Client Approves Job** (Browser 1 - Client)
    - [ ] Review job
    - [ ] Approve completion
    - [ ] **Expected**: Payment released

14. **Professional Receives Payment Notification** (Browser 2 - Pro)
    - [ ] **🔔 Notification: "Pagamento Recebido"**
    - [ ] See payment amount
    - [ ] **Expected**: Real-time notification

---

### Scenario 2: Real-time Chat Features

**Objective**: Test all chat features.

**Prerequisites**: Job with quote accepted (both users in conversation)

**Steps**:

1. **Typing Indicators** (Both browsers)
   - [ ] Client starts typing
   - [ ] **Professional sees "... está digitando"**
   - [ ] Professional starts typing
   - [ ] **Client sees "... está digitando"**
   - [ ] Stop typing (wait 2s)
   - [ ] **Indicator disappears**

2. **Read Receipts** (Both browsers)
   - [ ] Client sends message
   - [ ] **Client sees single checkmark (✓)**
   - [ ] Professional opens chat
   - [ ] **Client sees double checkmark (✓✓)**
   - [ ] **Expected**: Read receipts update in real-time

3. **Message Delivery** (Both browsers)
   - [ ] Send multiple messages rapidly
   - [ ] **All messages appear in order**
   - [ ] **No duplicates**
   - [ ] **Timestamps are correct**

4. **Auto-scroll** (Both browsers)
   - [ ] Receive new message
   - [ ] **Chat auto-scrolls to bottom**
   - [ ] **Expected**: Always shows latest message

5. **Load More Messages** (Browser with conversation history)
   - [ ] Scroll to top of chat
   - [ ] Click "Carregar mensagens antigas"
   - [ ] **Older messages load**
   - [ ] **Scroll position maintained**

6. **Offline/Online Behavior**
   - [ ] Disconnect internet on one browser
   - [ ] Other user sends message
   - [ ] Reconnect internet
   - [ ] **Message appears**
   - [ ] **Unread count correct**

---

### Scenario 3: Notifications Features

**Objective**: Test all notification features.

**Steps**:

1. **Badge Counter** (Any browser)
   - [ ] Trigger notification (send quote, etc.)
   - [ ] **Badge shows correct count**
   - [ ] **Badge updates in real-time**
   - [ ] Maximum shows "99+"

2. **Notification Dropdown** (Any browser)
   - [ ] Click bell icon
   - [ ] **Dropdown opens**
   - [ ] **Notifications listed newest first**
   - [ ] **Unread highlighted**

3. **Mark as Read**
   - [ ] Click on unread notification
   - [ ] **Badge count decreases**
   - [ ] **Notification no longer highlighted**
   - [ ] **Navigates to correct page**

4. **Mark All as Read**
   - [ ] Have multiple unread notifications
   - [ ] Click "Marcar todas como lidas"
   - [ ] **Badge resets to 0**
   - [ ] **All notifications marked read**

5. **Delete Notification**
   - [ ] Hover over notification
   - [ ] Click X button
   - [ ] **Notification removed**
   - [ ] **Badge count updates if was unread**

6. **Empty State**
   - [ ] Delete all notifications
   - [ ] **Shows empty state icon**
   - [ ] **Shows helpful message**

---

### Scenario 4: Edge Cases

**Objective**: Test error handling and edge cases.

**Steps**:

1. **No Professional Assigned Yet**
   - [ ] Client creates job
   - [ ] Client tries to open chat
   - [ ] **Expected**: Message "Aguardando profissional"

2. **Invalid Conversation Access**
   - [ ] Try to access another user's conversation
   - [ ] **Expected**: 403 Forbidden error

3. **Empty Message**
   - [ ] Try to send empty message
   - [ ] **Expected**: Send button disabled

4. **Very Long Message**
   - [ ] Send message with 1000+ characters
   - [ ] **Expected**: Message sent successfully
   - [ ] **Expected**: Displays with line breaks

5. **Special Characters**
   - [ ] Send message with emojis: "😀 🎉 ✅"
   - [ ] Send message with symbols: "< > & ' \""
   - [ ] **Expected**: All characters display correctly

6. **Rapid Message Sending**
   - [ ] Send 10 messages quickly
   - [ ] **Expected**: All messages delivered
   - [ ] **Expected**: Correct order maintained

7. **Disconnection During Send**
   - [ ] Disconnect internet
   - [ ] Try to send message
   - [ ] Reconnect
   - [ ] **Expected**: Error handled gracefully

---

## Backend Testing

### Database Verification

**Check Conversations Created**:
```sql
SELECT * FROM conversations ORDER BY created_at DESC LIMIT 10;
```

**Expected**: Conversation for each job

---

**Check Messages**:
```sql
SELECT m.*, u.name as sender_name
FROM messages m
JOIN users u ON m.sender_id = u.id
ORDER BY m.created_at DESC
LIMIT 20;
```

**Expected**: All sent messages recorded

---

**Check Notifications**:
```sql
SELECT * FROM notifications
ORDER BY created_at DESC
LIMIT 20;
```

**Expected**: Notifications for all events

---

**Check Unread Counts**:
```sql
-- Unread messages for user
SELECT COUNT(*) FROM messages m
JOIN conversations c ON m.conversation_id = c.id
WHERE (c.client_id = 'user-id' OR c.professional_id = 'user-id')
  AND m.sender_id != 'user-id'
  AND m.read_at IS NULL;

-- Unread notifications for user
SELECT COUNT(*) FROM notifications
WHERE user_id = 'user-id' AND read_at IS NULL;
```

---

### API Endpoint Testing

**Using cURL**:

```bash
# Get conversations
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/chat/conversations

# Get messages
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/chat/conversations/CONV_ID/messages

# Send message (REST fallback)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Test message","type":"TEXT"}' \
  http://localhost:3333/chat/conversations/CONV_ID/messages

# Get notifications
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/notifications

# Mark as read
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3333/notifications/NOTIF_ID/read
```

---

### WebSocket Testing

**Using Browser Console**:

```javascript
// Connect
const socket = io('http://localhost:3333/chat', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

// Test connection
socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected');
});

// Join conversation
socket.emit('join_conversation', {
  conversationId: 'CONV_ID'
}, (response) => {
  console.log('Join response:', response);
});

// Send message
socket.emit('send_message', {
  conversationId: 'CONV_ID',
  content: 'Test from console',
  type: 'TEXT'
}, (response) => {
  console.log('Send response:', response);
});

// Listen for messages
socket.on('new_message', (msg) => {
  console.log('📨 New message:', msg);
});

// Listen for notifications
socket.on('new_notification', (notif) => {
  console.log('🔔 New notification:', notif);
});
```

---

## Frontend Testing

### Component Testing

**Chat Components**:
- [ ] `ChatMessage` displays correctly for own/other messages
- [ ] `ChatInput` auto-resizes
- [ ] `ChatInput` typing indicators work
- [ ] `ChatWindow` loads messages
- [ ] `ChatWindow` auto-scrolls
- [ ] `ConversationsList` displays all conversations

**Notification Components**:
- [ ] `NotificationItem` shows correct icon per type
- [ ] `NotificationItem` unread indicator works
- [ ] `NotificationsDropdown` badge updates
- [ ] `NotificationsDropdown` opens/closes correctly

---

### Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)

**Check**:
- [ ] WebSocket connects
- [ ] Notifications appear
- [ ] Chat works
- [ ] UI displays correctly

---

### Responsive Testing

Test on different screen sizes:
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

**Check**:
- [ ] Chat UI adapts
- [ ] Notifications dropdown fits screen
- [ ] Messages are readable
- [ ] Buttons are clickable

---

## Integration Testing

### End-to-End Checklist

**Complete Flow**:
- [ ] Job creation → Conversation created
- [ ] Quote sent → Client notified
- [ ] Quote accepted → Pro notified, chat active
- [ ] Job started → Client notified
- [ ] Job completed → Client notified
- [ ] Payment released → Pro notified
- [ ] All notifications delivered in real-time
- [ ] Chat messages delivered in real-time
- [ ] Read receipts work
- [ ] Typing indicators work

---

### Error Scenarios

- [ ] Invalid token → WebSocket disconnects
- [ ] Server restart → Clients reconnect automatically
- [ ] Network interruption → Messages queued and sent on reconnect
- [ ] Database error → Graceful error messages
- [ ] Missing conversation → Appropriate error shown

---

## WebSocket Testing

### Connection Testing

**Test Cases**:
1. [ ] Connect with valid token → Success
2. [ ] Connect with invalid token → Disconnect
3. [ ] Connect without token → Disconnect
4. [ ] Multiple tabs same user → All receive events
5. [ ] Reconnection after disconnect → Works

---

### Event Testing

**Message Events**:
- [ ] `send_message` → `new_message` received by other user
- [ ] `typing_start` → Other user sees indicator
- [ ] `typing_stop` → Indicator disappears
- [ ] `mark_read` → Other user sees read receipts

**Notification Events**:
- [ ] `new_notification` → Badge updates
- [ ] `unread_count` → Count accurate

---

### Performance Testing

**Load Test**:
- [ ] Send 100 messages rapidly → All delivered
- [ ] 10 users connected → All receive broadcasts
- [ ] Large message (5000 chars) → Handled correctly

**Memory Test**:
- [ ] Long-running connection (1 hour) → No memory leaks
- [ ] Disconnect/reconnect 10 times → Works correctly

---

## Performance Testing

### Response Times

**Acceptable Limits**:
- REST API: < 200ms
- WebSocket message delivery: < 100ms
- Notification delivery: < 100ms

**Test**:
```javascript
// Measure REST API
console.time('API');
await fetch('/chat/conversations', { headers: { Authorization: `Bearer ${token}` }});
console.timeEnd('API');
// Expected: < 200ms

// Measure WebSocket
const start = Date.now();
socket.emit('send_message', {...}, () => {
  console.log('Latency:', Date.now() - start, 'ms');
  // Expected: < 100ms
});
```

---

### Database Performance

**Check Indexes**:
```sql
-- Should have indexes on:
\d conversations  -- client_id, professional_id
\d messages       -- conversation_id + created_at, sender_id
\d notifications  -- user_id + read_at, user_id + created_at
```

---

### Concurrent Users

**Test**:
- [ ] 10 users sending messages simultaneously
- [ ] 50 users connected to WebSocket
- [ ] 100 notifications sent in 1 minute

**Monitor**:
- Server CPU usage
- Memory usage
- Database connections
- Response times

---

## Known Issues

### Current Limitations

1. **Pagination**: Conversations list not paginated (loads all)
2. **File Upload**: Not implemented yet
3. **Message Editing**: Not supported
4. **Message Deletion**: Not supported
5. **Email Notifications**: Not implemented
6. **Push Notifications**: Not implemented

### Browser Issues

1. **Safari**: WebSocket may disconnect on page sleep
   - **Workaround**: Reconnect on page focus

2. **Mobile**: Background tab may disconnect
   - **Workaround**: Auto-reconnect implemented

---

## Test Report Template

```markdown
## Test Report

**Date**: 01/02/2026
**Tester**: [Name]
**Environment**: [Dev/Staging/Prod]

### Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Pass Rate: Y/X%

### Passed Tests
- ✅ Job creation creates conversation
- ✅ Notifications delivered in real-time
- ✅ Chat messages work bidirectionally
...

### Failed Tests
- ❌ Test name
  - **Expected**: ...
  - **Actual**: ...
  - **Steps to Reproduce**: ...

### Issues Found
1. Issue description
   - **Severity**: High/Medium/Low
   - **Impact**: ...
   - **Suggested Fix**: ...

### Notes
Additional observations...
```

---

## Troubleshooting

### WebSocket Not Connecting

**Symptoms**: No real-time updates

**Check**:
1. Backend logs show connection attempts
2. Browser console shows no errors
3. Token is valid
4. CORS allows origin

**Fix**:
```javascript
// Check token expiry
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Expires:', new Date(payload.exp * 1000));
```

---

### Notifications Not Appearing

**Symptoms**: Badge doesn't update

**Check**:
1. WebSocket connected (`socket.connected`)
2. User joined correct room
3. Notification created in database
4. Frontend listening to `new_notification`

**Fix**: Check browser console for WebSocket events

---

### Messages Not Delivered

**Symptoms**: Message sent but not received

**Check**:
1. Both users joined conversation
2. WebSocket connected for both
3. Message saved in database
4. Broadcast sent to room

**Fix**: Check server logs for delivery confirmation

---

**End of Testing Guide**
