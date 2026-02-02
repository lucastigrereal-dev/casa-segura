'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './use-auth';
import type { Message, Notification, SocketEvents } from '@casa-segura/shared';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export function useSocket() {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  // Event listeners registry
  const listenersRef = useRef<{
    onNewMessage: ((message: Message) => void)[];
    onUserTyping: ((data: { userId: string; conversationId: string; typing: boolean }) => void)[];
    onMessagesRead: ((data: { conversationId: string; userId: string }) => void)[];
    onNewNotification: ((notification: Notification) => void)[];
  }>({
    onNewMessage: [],
    onUserTyping: [],
    onMessagesRead: [],
    onNewNotification: [],
  });

  // Initialize socket connection
  useEffect(() => {
    if (!user || !token) {
      // Disconnect if user logs out
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(`${SOCKET_URL}/chat`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Listen for unread count
    newSocket.on('unread_count', (data: { count: number }) => {
      setUnreadMessages(data.count);
    });

    // Listen for new messages
    newSocket.on('new_message', (message: Message) => {
      listenersRef.current.onNewMessage.forEach((listener) => listener(message));
    });

    // Listen for typing indicators
    newSocket.on('user_typing', (data: { userId: string; conversationId: string; typing: boolean }) => {
      listenersRef.current.onUserTyping.forEach((listener) => listener(data));
    });

    // Listen for messages read
    newSocket.on('messages_read', (data: { conversationId: string; userId: string }) => {
      listenersRef.current.onMessagesRead.forEach((listener) => listener(data));
    });

    // Listen for new notifications
    newSocket.on('new_notification', (notification: Notification) => {
      setUnreadNotifications((prev) => prev + 1);
      listenersRef.current.onNewNotification.forEach((listener) => listener(notification));
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  // Join a conversation
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit('join_conversation', { conversationId });
    },
    [socket]
  );

  // Leave a conversation
  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit('leave_conversation', { conversationId });
    },
    [socket]
  );

  // Send a message
  const sendMessage = useCallback(
    (conversationId: string, content: string, type?: string) => {
      if (!socket) return;
      socket.emit('send_message', {
        conversationId,
        content,
        type,
      });
    },
    [socket]
  );

  // Send typing indicator
  const startTyping = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit('typing_start', { conversationId });
    },
    [socket]
  );

  const stopTyping = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit('typing_stop', { conversationId });
    },
    [socket]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (conversationId: string) => {
      if (!socket) return;
      socket.emit('mark_read', { conversationId });
    },
    [socket]
  );

  // Event listener registration
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    listenersRef.current.onNewMessage.push(callback);
    return () => {
      listenersRef.current.onNewMessage = listenersRef.current.onNewMessage.filter((cb) => cb !== callback);
    };
  }, []);

  const onUserTyping = useCallback(
    (callback: (data: { userId: string; conversationId: string; typing: boolean }) => void) => {
      listenersRef.current.onUserTyping.push(callback);
      return () => {
        listenersRef.current.onUserTyping = listenersRef.current.onUserTyping.filter((cb) => cb !== callback);
      };
    },
    []
  );

  const onMessagesRead = useCallback(
    (callback: (data: { conversationId: string; userId: string }) => void) => {
      listenersRef.current.onMessagesRead.push(callback);
      return () => {
        listenersRef.current.onMessagesRead = listenersRef.current.onMessagesRead.filter((cb) => cb !== callback);
      };
    },
    []
  );

  const onNewNotification = useCallback((callback: (notification: Notification) => void) => {
    listenersRef.current.onNewNotification.push(callback);
    return () => {
      listenersRef.current.onNewNotification = listenersRef.current.onNewNotification.filter(
        (cb) => cb !== callback
      );
    };
  }, []);

  return {
    socket,
    isConnected,
    unreadMessages,
    unreadNotifications,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onUserTyping,
    onMessagesRead,
    onNewNotification,
  };
}
