# API Documentation: Chat & Notifications

**Version**: 1.0.0
**Last Updated**: 01/02/2026
**Base URL**: `http://localhost:3333` (development)

---

## Table of Contents

1. [Authentication](#authentication)
2. [Chat Endpoints](#chat-endpoints)
3. [Notifications Endpoints](#notifications-endpoints)
4. [WebSocket Events](#websocket-events)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)

---

## Authentication

All endpoints require JWT authentication via Bearer token:

```http
Authorization: Bearer <your-jwt-token>
```

WebSocket authentication uses the same token in handshake:

```javascript
const socket = io('http://localhost:3333/chat', {
  auth: { token: 'your-jwt-token' }
});
```

---

## Chat Endpoints

### Base Path: `/chat`

---

### Get All Conversations

Retrieve all conversations for the authenticated user.

**Endpoint**: `GET /chat/conversations`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
[
  {
    "id": "conv-uuid",
    "job_id": "job-uuid",
    "client_id": "user-uuid",
    "professional_id": "user-uuid",
    "last_message_at": "2026-02-01T10:30:00Z",
    "last_message_preview": "Olá, posso ajudar?",
    "created_at": "2026-02-01T09:00:00Z",
    "updated_at": "2026-02-01T10:30:00Z",
    "client": {
      "id": "user-uuid",
      "name": "João Silva",
      "avatar_url": "https://..."
    },
    "professional": {
      "id": "user-uuid",
      "name": "Maria Santos",
      "avatar_url": "https://..."
    },
    "job": {
      "id": "job-uuid",
      "code": "CS-2026-001",
      "status": "IN_PROGRESS"
    }
  }
]
```

---

### Get Conversation by ID

Retrieve a specific conversation.

**Endpoint**: `GET /chat/conversations/:id`

**Parameters**:
- `id` (path) - Conversation UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "conv-uuid",
  "job_id": "job-uuid",
  "client_id": "user-uuid",
  "professional_id": "user-uuid",
  "last_message_at": "2026-02-01T10:30:00Z",
  "last_message_preview": "Olá, posso ajudar?",
  "created_at": "2026-02-01T09:00:00Z",
  "updated_at": "2026-02-01T10:30:00Z",
  "client": { ... },
  "professional": { ... },
  "job": { ... }
}
```

**Errors**:
- `404` - Conversation not found
- `403` - Not authorized to access this conversation

---

### Get Conversation by Job ID

Retrieve conversation for a specific job.

**Endpoint**: `GET /chat/conversations/job/:jobId`

**Parameters**:
- `jobId` (path) - Job UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "conv-uuid",
  "job_id": "job-uuid",
  ...
}
```

**Response** (200 - No conversation):
```json
null
```

---

### Get Messages

Retrieve messages for a conversation (paginated).

**Endpoint**: `GET /chat/conversations/:id/messages`

**Parameters**:
- `id` (path) - Conversation UUID
- `limit` (query, optional) - Number of messages (default: 50, max: 100)
- `before` (query, optional) - Message ID for pagination

**Headers**:
```http
Authorization: Bearer <token>
```

**Example Request**:
```http
GET /chat/conversations/conv-123/messages?limit=50&before=msg-456
```

**Response** (200):
```json
[
  {
    "id": "msg-uuid",
    "conversation_id": "conv-uuid",
    "sender_id": "user-uuid",
    "type": "TEXT",
    "content": "Olá! Estou a caminho.",
    "file_url": null,
    "file_name": null,
    "file_size": null,
    "read_at": "2026-02-01T10:35:00Z",
    "created_at": "2026-02-01T10:30:00Z",
    "sender": {
      "id": "user-uuid",
      "name": "Maria Santos",
      "avatar_url": "https://..."
    }
  }
]
```

**Note**: Messages are returned in **descending** order (newest first).

---

### Send Message (REST Fallback)

Send a message via REST API (WebSocket preferred).

**Endpoint**: `POST /chat/conversations/:id/messages`

**Parameters**:
- `id` (path) - Conversation UUID

**Headers**:
```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "content": "Mensagem de teste",
  "type": "TEXT"
}
```

**Optional Fields**:
```json
{
  "content": "Arquivo enviado",
  "type": "FILE",
  "fileUrl": "https://storage.com/file.pdf",
  "fileName": "documento.pdf",
  "fileSize": 1024000
}
```

**Response** (201):
```json
{
  "id": "msg-uuid",
  "conversation_id": "conv-uuid",
  "sender_id": "user-uuid",
  "type": "TEXT",
  "content": "Mensagem de teste",
  "created_at": "2026-02-01T10:30:00Z",
  "sender": { ... }
}
```

---

### Mark Messages as Read

Mark all unread messages in a conversation as read.

**Endpoint**: `POST /chat/conversations/:id/read`

**Parameters**:
- `id` (path) - Conversation UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true
}
```

---

### Get Unread Count

Get total unread message count for user.

**Endpoint**: `GET /chat/unread-count`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "count": 5
}
```

---

## Notifications Endpoints

### Base Path: `/notifications`

---

### Get All Notifications

Retrieve notifications for authenticated user.

**Endpoint**: `GET /notifications`

**Query Parameters**:
- `limit` (optional) - Number of notifications (default: 20, max: 100)
- `offset` (optional) - Pagination offset (default: 0)
- `unreadOnly` (optional) - Filter unread only (default: false)

**Headers**:
```http
Authorization: Bearer <token>
```

**Example Request**:
```http
GET /notifications?limit=20&offset=0&unreadOnly=true
```

**Response** (200):
```json
{
  "notifications": [
    {
      "id": "notif-uuid",
      "user_id": "user-uuid",
      "type": "NEW_QUOTE",
      "title": "Nova Proposta Recebida",
      "message": "Maria Santos enviou uma proposta de R$ 150,00",
      "job_id": "job-uuid",
      "quote_id": "quote-uuid",
      "data": {
        "professionalName": "Maria Santos",
        "amount": 15000,
        "jobCode": "CS-2026-001"
      },
      "read_at": null,
      "clicked_at": null,
      "created_at": "2026-02-01T10:00:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

---

### Get Unread Count

Get total unread notification count.

**Endpoint**: `GET /notifications/unread-count`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "count": 3
}
```

---

### Mark as Read

Mark a single notification as read.

**Endpoint**: `POST /notifications/:id/read`

**Parameters**:
- `id` (path) - Notification UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "notif-uuid",
  "user_id": "user-uuid",
  "type": "NEW_QUOTE",
  "title": "Nova Proposta Recebida",
  "message": "...",
  "read_at": "2026-02-01T10:30:00Z",
  "created_at": "2026-02-01T10:00:00Z"
}
```

---

### Mark All as Read

Mark all notifications as read.

**Endpoint**: `POST /notifications/read-all`

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true
}
```

---

### Mark as Clicked

Mark notification as clicked (also marks as read).

**Endpoint**: `POST /notifications/:id/click`

**Parameters**:
- `id` (path) - Notification UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "notif-uuid",
  "read_at": "2026-02-01T10:30:00Z",
  "clicked_at": "2026-02-01T10:30:00Z",
  ...
}
```

---

### Delete Notification

Delete a notification.

**Endpoint**: `DELETE /notifications/:id`

**Parameters**:
- `id` (path) - Notification UUID

**Headers**:
```http
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "success": true
}
```

---

## WebSocket Events

### Namespace: `/chat`

**Connection**:
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3333/chat', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

---

### Client → Server Events

#### `join_conversation`

Join a conversation room.

**Payload**:
```json
{
  "conversationId": "conv-uuid"
}
```

**Response**:
```json
{
  "success": true,
  "conversation": { ... }
}
```

---

#### `leave_conversation`

Leave a conversation room.

**Payload**:
```json
{
  "conversationId": "conv-uuid"
}
```

**Response**:
```json
{
  "success": true
}
```

---

#### `send_message`

Send a message via WebSocket.

**Payload**:
```json
{
  "conversationId": "conv-uuid",
  "content": "Olá!",
  "type": "TEXT"
}
```

**Optional Fields**:
```json
{
  "conversationId": "conv-uuid",
  "content": "Arquivo enviado",
  "type": "FILE",
  "fileUrl": "https://...",
  "fileName": "doc.pdf",
  "fileSize": 1024000
}
```

**Response**:
```json
{
  "success": true,
  "message": { ... }
}
```

---

#### `typing_start`

Indicate user started typing.

**Payload**:
```json
{
  "conversationId": "conv-uuid"
}
```

**Note**: Automatically stops after 2 seconds of inactivity.

---

#### `typing_stop`

Indicate user stopped typing.

**Payload**:
```json
{
  "conversationId": "conv-uuid"
}
```

---

#### `mark_read`

Mark messages as read.

**Payload**:
```json
{
  "conversationId": "conv-uuid"
}
```

**Response**:
```json
{
  "success": true
}
```

---

### Server → Client Events

#### `new_message`

New message received.

**Payload**:
```json
{
  "id": "msg-uuid",
  "conversation_id": "conv-uuid",
  "sender_id": "user-uuid",
  "type": "TEXT",
  "content": "Olá!",
  "created_at": "2026-02-01T10:30:00Z",
  "sender": {
    "id": "user-uuid",
    "name": "Maria Santos",
    "avatar_url": "https://..."
  }
}
```

---

#### `user_typing`

User is typing indicator.

**Payload**:
```json
{
  "userId": "user-uuid",
  "conversationId": "conv-uuid",
  "typing": true
}
```

---

#### `messages_read`

Messages were read by other user.

**Payload**:
```json
{
  "conversationId": "conv-uuid",
  "userId": "user-uuid"
}
```

---

#### `unread_count`

Unread message count updated.

**Payload**:
```json
{
  "count": 5
}
```

---

#### `new_notification`

New notification received.

**Payload**:
```json
{
  "id": "notif-uuid",
  "user_id": "user-uuid",
  "type": "NEW_QUOTE",
  "title": "Nova Proposta",
  "message": "...",
  "created_at": "2026-02-01T10:00:00Z"
}
```

---

## Error Handling

### Standard Error Response

```json
{
  "statusCode": 404,
  "message": "Conversation not found",
  "error": "Not Found"
}
```

### Common HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | No permission to access resource |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

**Limits**:
- Short: 10 requests per second
- Medium: 50 requests per 10 seconds
- Long: 100 requests per minute

**Headers**:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1643723400
```

**Error Response** (429):
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests"
}
```

---

## Notification Types

| Type | Triggered When | Recipient |
|------|---------------|-----------|
| `NEW_JOB` | Job created | Matching professionals |
| `NEW_QUOTE` | Quote submitted | Job client |
| `QUOTE_ACCEPTED` | Quote accepted | Professional |
| `QUOTE_REJECTED` | Quote rejected | Professional |
| `JOB_STARTED` | Job started | Client |
| `JOB_COMPLETED` | Job completed | Client |
| `PAYMENT_RECEIVED` | Payment released | Professional |
| `NEW_MESSAGE` | Message sent | Other conversation participant |
| `NEW_REVIEW` | Review submitted | Reviewed user |
| `SYSTEM` | System message | User |

---

## Message Types

| Type | Description | Additional Fields |
|------|-------------|-------------------|
| `TEXT` | Text message | - |
| `IMAGE` | Image attachment | `file_url`, `file_name`, `file_size` |
| `FILE` | File attachment | `file_url`, `file_name`, `file_size` |
| `SYSTEM` | System message | - |

---

## Examples

### Complete Chat Flow

```javascript
// 1. Connect to WebSocket
const socket = io('http://localhost:3333/chat', {
  auth: { token: userToken }
});

// 2. Listen for connection
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// 3. Join conversation
socket.emit('join_conversation', {
  conversationId: 'conv-123'
});

// 4. Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
  displayMessage(message);
});

// 5. Send typing indicator
socket.emit('typing_start', {
  conversationId: 'conv-123'
});

// 6. Send message
socket.emit('send_message', {
  conversationId: 'conv-123',
  content: 'Olá!',
  type: 'TEXT'
});

// 7. Stop typing
socket.emit('typing_stop', {
  conversationId: 'conv-123'
});

// 8. Mark as read
socket.emit('mark_read', {
  conversationId: 'conv-123'
});
```

---

### Complete Notification Flow

```javascript
// 1. Listen for new notifications
socket.on('new_notification', (notification) => {
  console.log('New notification:', notification);
  updateBadge(notification);
});

// 2. Fetch all notifications via REST
const response = await fetch('/notifications?limit=20', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();

// 3. Mark as clicked when user opens
await fetch(`/notifications/${notificationId}/click`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// 4. Navigate to related page
window.location.href = `/chamado/${notification.job_id}`;
```

---

## Troubleshooting

### WebSocket Not Connecting

**Issue**: `connect_error` event fired

**Solutions**:
1. Check token is valid and not expired
2. Verify CORS settings allow your domain
3. Ensure server is running on correct port
4. Check browser console for errors

---

### Messages Not Appearing

**Issue**: Messages sent but not received

**Solutions**:
1. Verify both users have joined the conversation
2. Check WebSocket connection is active (`socket.connected`)
3. Ensure conversation ID is correct
4. Check server logs for errors

---

### Notifications Not Delivered

**Issue**: Notifications created but not received

**Solutions**:
1. Verify WebSocket is connected
2. Check user is in correct room (`user:${userId}`)
3. Verify notification was created in database
4. Check server logs for delivery errors

---

**End of API Documentation**
