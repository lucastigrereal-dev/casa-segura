'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message } from '@casa-segura/shared';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';
import { chatApi } from '@/lib/api';

interface ChatWindowProps {
  conversationId: string;
  onClose?: () => void;
}

export function ChatWindow({ conversationId, onClose }: ChatWindowProps) {
  const { user, token } = useAuth();
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    markAsRead,
    onNewMessage,
    onUserTyping,
    onMessagesRead,
  } = useSocket();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastMessageIdRef = useRef<string | null>(null);

  // Get other user info
  const otherUser = conversation
    ? conversation.client_id === user?.userId
      ? conversation.professional
      : conversation.client
    : null;

  // Load conversation and initial messages
  useEffect(() => {
    const loadConversation = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        // Load conversation details
        const conv = await chatApi.getConversation(conversationId, token);
        setConversation(conv);

        // Load messages
        const messagesData = await chatApi.getMessages(conversationId, token, 50);

        // Messages come in DESC order, reverse for display
        const sortedMessages = Array.isArray(messagesData)
          ? messagesData.reverse()
          : [];

        setMessages(sortedMessages);
        setHasMore(sortedMessages.length >= 50);

        // Mark as read
        if (isConnected) {
          markAsRead(conversationId);
        } else {
          await chatApi.markAsRead(conversationId, token);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar conversa');
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId, token]);

  // Join/leave conversation via WebSocket
  useEffect(() => {
    if (isConnected && conversationId) {
      joinConversation(conversationId);

      return () => {
        leaveConversation(conversationId);
      };
    }
  }, [isConnected, conversationId]);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = onNewMessage((message: Message) => {
      if (message.conversation_id === conversationId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark as read if not own message
        if (message.sender_id !== user?.userId && isConnected) {
          markAsRead(conversationId);
        }
      }
    });

    return unsubscribe;
  }, [conversationId, user?.userId, isConnected]);

  // Listen for typing indicators
  useEffect(() => {
    const unsubscribe = onUserTyping((data) => {
      if (data.conversationId === conversationId && data.userId !== user?.userId) {
        setOtherUserTyping(data.typing);
      }
    });

    return unsubscribe;
  }, [conversationId, user?.userId]);

  // Listen for messages read
  useEffect(() => {
    const unsubscribe = onMessagesRead((data) => {
      if (data.conversationId === conversationId && data.userId !== user?.userId) {
        // Update read status for own messages
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === user?.userId && !msg.read_at
              ? { ...msg, read_at: new Date() }
              : msg
          )
        );
      }
    });

    return unsubscribe;
  }, [conversationId, user?.userId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1]?.id !== lastMessageIdRef.current) {
      lastMessageIdRef.current = messages[messages.length - 1]?.id;
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle send message
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !token) return;

    try {
      if (isConnected) {
        // Send via WebSocket
        sendSocketMessage(conversationId, content);
      } else {
        // Fallback to REST API
        const message = await chatApi.sendMessage(
          conversationId,
          { content },
          token
        );
        setMessages((prev) => [...prev, message]);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  // Handle typing indicators
  const handleTypingStart = () => {
    if (isConnected) {
      startTyping(conversationId);
    }
  };

  const handleTypingStop = () => {
    if (isConnected) {
      stopTyping(conversationId);
    }
  };

  // Load more messages (pagination)
  const handleLoadMore = async () => {
    if (!hasMore || loadingMore || !token || messages.length === 0) return;

    try {
      setLoadingMore(true);
      const oldestMessage = messages[0];
      const olderMessages = await chatApi.getMessages(
        conversationId,
        token,
        50,
        oldestMessage.id
      );

      const sortedOlderMessages = Array.isArray(olderMessages)
        ? olderMessages.reverse()
        : [];

      if (sortedOlderMessages.length < 50) {
        setHasMore(false);
      }

      setMessages((prev) => [...sortedOlderMessages, ...prev]);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando conversa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {otherUser?.avatar_url ? (
            <img
              src={otherUser.avatar_url}
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {otherUser?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}

          <div>
            <h3 className="font-semibold text-gray-900">
              {otherUser?.name || 'Conversa'}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                Chamado #{conversation?.job?.code}
              </span>
              {isConnected && (
                <span className="text-xs text-green-500">● Online</span>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Fechar chat"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {/* Load more button */}
        {hasMore && messages.length > 0 && (
          <div className="text-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="text-sm text-blue-500 hover:text-blue-600 disabled:text-gray-400"
            >
              {loadingMore ? 'Carregando...' : 'Carregar mensagens antigas'}
            </button>
          </div>
        )}

        {/* Message list */}
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>Nenhuma mensagem ainda.</p>
            <p className="text-sm mt-2">Envie uma mensagem para iniciar a conversa.</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.userId}
            />
          ))
        )}

        {/* Typing indicator */}
        {otherUserTyping && (
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
            <div className="flex gap-1">
              <span className="animate-bounce">●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>●</span>
            </div>
            <span>{otherUser?.name} está digitando...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        disabled={!isConnected && !token}
        placeholder={
          isConnected
            ? 'Digite sua mensagem...'
            : 'Conectando ao chat...'
        }
      />
    </div>
  );
}
