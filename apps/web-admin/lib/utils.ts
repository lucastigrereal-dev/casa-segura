import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPhone(phone: string): string {
  const numbers = phone.replace(/\D/g, '');
  if (numbers.length === 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  if (numbers.length === 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }
  return phone;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    QUOTED: 'bg-blue-100 text-blue-800',
    ACCEPTED: 'bg-indigo-100 text-indigo-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    VERIFIED: 'bg-green-100 text-green-800',
    PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendente',
    QUOTED: 'Orcado',
    ACCEPTED: 'Aceito',
    IN_PROGRESS: 'Em Andamento',
    COMPLETED: 'Concluido',
    CANCELLED: 'Cancelado',
    ACTIVE: 'Ativo',
    INACTIVE: 'Inativo',
    VERIFIED: 'Verificado',
    PENDING_VERIFICATION: 'Aguardando Verificacao',
    CLIENT: 'Cliente',
    PROFESSIONAL: 'Profissional',
    ADMIN: 'Administrador',
    DAILY: 'Diaria',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensal',
    ONE_TIME: 'Unica',
  };
  return labels[status] || status;
}
