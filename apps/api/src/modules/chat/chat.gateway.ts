import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { MessageType } from '@prisma/client';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  namespace: '/chat',
  cors: {
    origin: '*', // Configure properly in production
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // Track connected users
  private connectedUsers = new Map<string, string>(); // userId -> socketId

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
  ) {}

  /**
   * Handle client connection with JWT authentication
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT
      const payload = await this.jwtService.verifyAsync(token);
      client.userId = payload.sub;

      // Track user connection
      this.connectedUsers.set(payload.sub, client.id);

      // Join user to their personal room for notifications
      client.join(`user:${payload.sub}`);

      console.log(`Client connected: ${client.id}, User: ${payload.sub}`);

      // Send unread count
      const unreadCount = await this.chatService.getUnreadCount(payload.sub);
      client.emit('unread_count', { count: unreadCount });

    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      console.log(`Client disconnected: ${client.id}, User: ${client.userId}`);
    }
  }

  /**
   * Join a conversation room
   */
  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Verify access to conversation
      const conversation = await this.chatService.findConversationById(
        data.conversationId,
        client.userId,
      );

      // Join room
      client.join(`conversation:${data.conversationId}`);

      return { success: true, conversation };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Leave a conversation room
   */
  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`conversation:${data.conversationId}`);
    return { success: true };
  }

  /**
   * Send a message
   */
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: {
      conversationId: string;
      content: string;
      type?: MessageType;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      // Create message
      const message = await this.chatService.createMessage({
        conversationId: data.conversationId,
        senderId: client.userId,
        content: data.content,
        type: data.type,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
      });

      // Broadcast to conversation room
      this.server
        .to(`conversation:${data.conversationId}`)
        .emit('new_message', message);

      // Get conversation to find other user
      const conversation = await this.chatService.findConversationById(
        data.conversationId,
        client.userId,
      );

      // Send notification to other user if online
      const otherUserId =
        conversation.client_id === client.userId
          ? conversation.professional_id
          : conversation.client_id;

      if (otherUserId) {
        await this.emitToUser(otherUserId, 'new_notification', {
          type: 'NEW_MESSAGE',
          title: 'Nova mensagem',
          message: `${message.sender.name}: ${data.content.substring(0, 50)}`,
          conversationId: data.conversationId,
        });

        // Update unread count
        const unreadCount = await this.chatService.getUnreadCount(otherUserId);
        await this.emitToUser(otherUserId, 'unread_count', { count: unreadCount });
      }

      return { success: true, message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing_start')
  async handleTypingStart(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Broadcast to others in the conversation
    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      typing: true,
    });

    return { success: true };
  }

  /**
   * Stop typing indicator
   */
  @SubscribeMessage('typing_stop')
  async handleTypingStop(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    // Broadcast to others in the conversation
    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId: client.userId,
      conversationId: data.conversationId,
      typing: false,
    });

    return { success: true };
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('mark_read')
  async handleMarkRead(
    @MessageBody() data: { conversationId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.chatService.markAsRead(data.conversationId, client.userId);

      // Notify sender that messages were read
      this.server.to(`conversation:${data.conversationId}`).emit('messages_read', {
        conversationId: data.conversationId,
        userId: client.userId,
      });

      // Update unread count
      const unreadCount = await this.chatService.getUnreadCount(client.userId);
      client.emit('unread_count', { count: unreadCount });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Helper to emit event to a specific user
   */
  async emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }
}
