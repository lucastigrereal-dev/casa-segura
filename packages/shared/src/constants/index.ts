import { JobStatus, ProLevel, RiskLevel, Role, UserStatus, QuoteStatus, PaymentStatus, PaymentMethod, TransactionType, WithdrawalStatus } from '@casa-segura/database';

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  CREATED: 'Criado',
  QUOTED: 'Orçado',
  PENDING_PAYMENT: 'Aguardando Pagamento',
  PAID: 'Pago',
  PENDING_QUOTE: 'Aguardando Orçamento',
  QUOTE_SENT: 'Orçamento Recebido',
  QUOTE_ACCEPTED: 'Orçamento Aceito',
  QUOTE_REJECTED: 'Orçamento Recusado',
  ASSIGNED: 'Atribuído',
  PRO_ACCEPTED: 'Aceito pelo Profissional',
  PRO_ON_WAY: 'Profissional a Caminho',
  IN_PROGRESS: 'Em Andamento',
  PENDING_APPROVAL: 'Aguardando Aprovação',
  COMPLETED: 'Concluído',
  IN_GUARANTEE: 'Em Garantia',
  CLOSED: 'Fechado',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em Disputa',
};

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  QUOTED: 'bg-blue-100 text-blue-800',
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  PENDING_QUOTE: 'bg-yellow-100 text-yellow-800',
  QUOTE_SENT: 'bg-blue-100 text-blue-800',
  QUOTE_ACCEPTED: 'bg-green-100 text-green-800',
  QUOTE_REJECTED: 'bg-red-100 text-red-800',
  ASSIGNED: 'bg-purple-100 text-purple-800',
  PRO_ACCEPTED: 'bg-indigo-100 text-indigo-800',
  PRO_ON_WAY: 'bg-cyan-100 text-cyan-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  IN_GUARANTEE: 'bg-teal-100 text-teal-800',
  CLOSED: 'bg-slate-100 text-slate-800',
  CANCELLED: 'bg-red-100 text-red-800',
  DISPUTED: 'bg-rose-100 text-rose-800',
};

export const PRO_LEVEL_LABELS: Record<ProLevel, string> = {
  BRONZE: 'Bronze',
  SILVER: 'Prata',
  GOLD: 'Ouro',
  PLATINUM: 'Platina',
};

export const PRO_LEVEL_COLORS: Record<ProLevel, string> = {
  BRONZE: 'bg-amber-600 text-white',
  SILVER: 'bg-gray-400 text-white',
  GOLD: 'bg-yellow-500 text-white',
  PLATINUM: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white',
};

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-red-100 text-red-800',
};

export const ROLE_LABELS: Record<Role, string> = {
  CLIENT: 'Cliente',
  PROFESSIONAL: 'Profissional',
  ADMIN: 'Administrador',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativo',
  SUSPENDED: 'Suspenso',
  BANNED: 'Banido',
};

export const USER_STATUS_COLORS: Record<UserStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  BANNED: 'bg-red-100 text-red-800',
};

// Serra Gaúcha cities
export const SERRA_GAUCHA_CITIES = [
  'Bento Gonçalves',
  'Caxias do Sul',
  'Farroupilha',
  'Flores da Cunha',
  'Garibaldi',
  'Carlos Barbosa',
  'Nova Prata',
  'Veranópolis',
  'São Marcos',
  'Antônio Prado',
  'Nova Petrópolis',
  'Gramado',
  'Canela',
] as const;

// Quote Status
export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  PENDING: 'Aguardando Cliente',
  ACCEPTED: 'Aceito',
  REJECTED: 'Recusado',
  EXPIRED: 'Expirado',
};

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
};

// Platform Configuration
export const PLATFORM_FEE_RATE = 0.20; // 20% commission
export const QUOTE_EXPIRY_DAYS = 7;

// App config
export const APP_CONFIG = {
  name: 'Casa Segura',
  description: 'Marketplace de serviços residenciais para Serra Gaúcha',
  defaultWorkRadiusKm: 20,
  guaranteeDays: 30,
  maxPhotosBeforeJob: 5,
  maxPhotosAfterJob: 5,
  minPasswordLength: 6,
  phoneRegex: /^\d{10,11}$/,
  cpfRegex: /^\d{11}$/,
  cepRegex: /^\d{8}$/,
} as const;

// Payment Configuration
export const PAYMENT_CONFIG = {
  platformFeePercentage: 0.20, // 20% platform commission
  professionalPercentage: 0.80, // 80% to professional
  escrowHoldHours: 48, // Hold payment for 48h after job completion
  minWithdrawalAmount: 5000, // R$ 50.00 minimum withdrawal (in centavos)
  pixExpirationMinutes: 30, // PIX QR code valid for 30 minutes
  maxInstallments: 12, // Maximum credit card installments
} as const;

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  FAILED: 'Falhou',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Parcialmente Reembolsado',
  CANCELLED: 'Cancelado',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-purple-100 text-purple-800',
  PARTIALLY_REFUNDED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de Crédito',
  DEBIT_CARD: 'Cartão de Débito',
};

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  PENDING: 'Aguardando Aprovação',
  APPROVED: 'Aprovado',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  REJECTED: 'Rejeitado',
  FAILED: 'Falhou',
};

export const WITHDRAWAL_STATUS_COLORS: Record<WithdrawalStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  FAILED: 'bg-red-100 text-red-800',
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  PAYMENT: 'Pagamento',
  SPLIT_PROFESSIONAL: 'Recebimento',
  SPLIT_PLATFORM: 'Taxa Plataforma',
  REFUND: 'Reembolso',
  WITHDRAWAL: 'Saque',
  FEE: 'Taxa',
};
