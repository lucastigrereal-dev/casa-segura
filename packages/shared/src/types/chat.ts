// ============================================
// CHAT & NOTIFICATIONS TYPES
// ============================================

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  SYSTEM = 'SYSTEM',
}

export enum NotificationType {
  NEW_JOB = 'NEW_JOB',
  NEW_QUOTE = 'NEW_QUOTE',
  QUOTE_ACCEPTED = 'QUOTE_ACCEPTED',
  QUOTE_REJECTED = 'QUOTE_REJECTED',
  JOB_STARTED = 'JOB_STARTED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_REVIEW = 'NEW_REVIEW',
  SYSTEM = 'SYSTEM',
}

// ============================================
// MESSAGE INTERFACES
// ============================================

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  type: MessageType;
  content: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  read_at?: Date;
  created_at: Date;
}

// ============================================
// CONVERSATION INTERFACES
// ============================================

export interface Conversation {
  id: string;
  job_id: string;
  job?: {
    id: string;
    code: string;
    status: string;
  };
  client_id: string;
  client?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  professional_id?: string;
  professional?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  last_message_at?: Date;
  last_message_preview?: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// NOTIFICATION INTERFACES
// ============================================

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  job_id?: string;
  quote_id?: string;
  data?: any;
  read_at?: Date;
  clicked_at?: Date;
  created_at: Date;
}

// ============================================
// SOCKET.IO EVENT TYPES
// ============================================

export interface SocketEvents {
  // Client -> Server
  join_conversation: (data: { conversationId: string }) => void;
  leave_conversation: (data: { conversationId: string }) => void;
  send_message: (data: {
    conversationId: string;
    content: string;
    type?: MessageType;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }) => void;
  typing_start: (data: { conversationId: string }) => void;
  typing_stop: (data: { conversationId: string }) => void;
  mark_read: (data: { conversationId: string }) => void;

  // Server -> Client
  new_message: (message: Message) => void;
  user_typing: (data: {
    userId: string;
    conversationId: string;
    typing: boolean;
  }) => void;
  messages_read: (data: {
    conversationId: string;
    userId: string;
  }) => void;
  unread_count: (data: { count: number }) => void;
  new_notification: (notification: Notification) => void;
}

// ============================================
// DTO TYPES
// ============================================

export interface CreateConversationDto {
  jobId: string;
  clientId: string;
  professionalId?: string;
}

export interface CreateMessageDto {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  jobId?: string;
  quoteId?: string;
  data?: any;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ConversationsResponse {
  conversations: Conversation[];
}

export interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  limit: number;
  offset: number;
}

export interface UnreadCountResponse {
  count: number;
}
