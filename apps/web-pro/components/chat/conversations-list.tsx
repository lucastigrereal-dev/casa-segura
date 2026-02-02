'use client';

import React, { useState, useEffect } from 'react';
import { Conversation } from '@casa-segura/shared';
import { useAuth } from '@/hooks/use-auth';
import { chatApi } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ConversationsListProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationsList({
  selectedConversationId,
  onSelectConversation,
}: ConversationsListProps) {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load conversations
  useEffect(() => {
    const loadConversations = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);
        const data = await chatApi.getConversations(token);
        setConversations(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar conversas');
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="text-center text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <p className="font-medium">Nenhuma conversa ainda</p>
          <p className="text-sm mt-2">
            As conversas aparecerão aqui quando você tiver chamados em andamento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        // Get other user (client or professional)
        const otherUser =
          conversation.client_id === user?.userId
            ? conversation.professional
            : conversation.client;

        const isSelected = conversation.id === selectedConversationId;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
              isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              {otherUser?.avatar_url ? (
                <img
                  src={otherUser.avatar_url}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">
                    {otherUser?.name?.charAt(0).toUpperCase() || '?'}
                  </span>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Name and timestamp */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {otherUser?.name || 'Usuário'}
                  </h4>
                  {conversation.last_message_at && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>

                {/* Job code */}
                <p className="text-xs text-gray-500 mb-1">
                  Chamado #{conversation.job?.code}
                </p>

                {/* Last message preview */}
                {conversation.last_message_preview && (
                  <p className="text-sm text-gray-600 truncate">
                    {conversation.last_message_preview}
                  </p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
