'use client';

import React from 'react';
import { Message } from '@casa-segura/shared';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function ChatMessage({ message, isOwn, showAvatar = true }: ChatMessageProps) {
  const isRead = message.read_at !== null && message.read_at !== undefined;

  return (
    <div className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {showAvatar && (
        <div className="flex-shrink-0">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={message.sender.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {message.sender?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Message bubble */}
      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
        {/* Sender name (only for other's messages) */}
        {!isOwn && (
          <span className="text-xs text-gray-500 mb-1 px-2">
            {message.sender?.name || 'Desconhecido'}
          </span>
        )}

        {/* Message content */}
        <div
          className={`rounded-lg px-4 py-2 ${
            isOwn
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 rounded-bl-none'
          }`}
        >
          {/* File attachment */}
          {message.type === 'FILE' && message.file_url && (
            <div className="mb-2">
              <a
                href={message.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${isOwn ? 'text-white' : 'text-blue-600'} hover:underline`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm">{message.file_name || 'Arquivo anexado'}</span>
              </a>
            </div>
          )}

          {/* Image attachment */}
          {message.type === 'IMAGE' && message.file_url && (
            <div className="mb-2">
              <img
                src={message.file_url}
                alt="Imagem anexada"
                className="max-w-full rounded"
              />
            </div>
          )}

          {/* Text content */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Timestamp and read receipt */}
        <div className={`flex items-center gap-2 mt-1 px-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
              locale: ptBR,
            })}
          </span>

          {/* Read receipt (only for own messages) */}
          {isOwn && (
            <span className="text-xs">
              {isRead ? (
                <span className="text-blue-500" title="Lida">✓✓</span>
              ) : (
                <span className="text-gray-400" title="Enviada">✓</span>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
