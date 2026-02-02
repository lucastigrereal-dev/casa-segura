'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '@casa-segura/shared';
import { NotificationItem } from './notification-item';
import { useSocket } from '@/hooks/use-socket';
import { useAuth } from '@/hooks/use-auth';
import { notificationsApi } from '@/lib/api';

export function NotificationsDropdown() {
  const router = useRouter();
  const { token } = useAuth();
  const { onNewNotification, unreadNotifications: socketUnreadCount } = useSocket();

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update unread count from socket
  useEffect(() => {
    setUnreadCount(socketUnreadCount);
  }, [socketUnreadCount]);

  // Listen for new notifications
  useEffect(() => {
    const unsubscribe = onNewNotification((notification: Notification) => {
      // Add to list if dropdown is open
      if (isOpen) {
        setNotifications((prev) => [notification, ...prev]);
      }
      // Increment unread count
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
  }, [isOpen, onNewNotification]);

  // Load notifications when dropdown opens
  useEffect(() => {
    if (isOpen && !hasLoadedOnce && token) {
      loadNotifications();
    }
  }, [isOpen, token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  // Load notifications
  const loadNotifications = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await notificationsApi.getAll(token, 20, 0, false);

      // Handle different response formats
      const notificationsList = Array.isArray(response)
        ? response
        : response.notifications || [];

      setNotifications(notificationsList);
      setHasLoadedOnce(true);

      // Update unread count
      const countResponse = await notificationsApi.getUnreadCount(token);
      setUnreadCount(countResponse.count || 0);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!token) return;

    try {
      // Mark as clicked (also marks as read)
      await notificationsApi.markAsClicked(notification.id, token);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id
            ? { ...n, read_at: new Date(), clicked_at: new Date() }
            : n
        )
      );

      // Decrement unread count if it was unread
      if (!notification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate based on notification type
      if (notification.job_id) {
        router.push(`/chamado/${notification.job_id}`);
      }

      // Close dropdown
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to mark notification as clicked:', error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (id: string) => {
    if (!token) return;

    try {
      await notificationsApi.delete(id, token);

      // Update local state
      const deletedNotification = notifications.find((n) => n.id === id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));

      // Decrement unread count if it was unread
      if (deletedNotification && !deletedNotification.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    if (!token) return;

    try {
      await notificationsApi.markAllAsRead(token);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read_at: n.read_at || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell icon with badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
        aria-label="Notificações"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Unread badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} {unreadCount === 1 ? 'nova notificação' : 'novas notificações'}
              </p>
            )}
          </div>

          {/* Notification list */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <svg
                  className="w-16 h-16 text-gray-300 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <p className="text-gray-500 font-medium">Nenhuma notificação</p>
                <p className="text-gray-400 text-sm mt-1">
                  Você será notificado sobre atualizações importantes
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                  onDelete={handleDeleteNotification}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200">
              <button
                onClick={() => {
                  router.push('/notificacoes');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
