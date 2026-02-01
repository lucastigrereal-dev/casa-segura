// Re-export all types from Prisma
export type {
  User,
  Professional,
  Category,
  Mission,
  Specialty,
  Address,
  Job,
  Review,
  Quote,
  ProfessionalService,
} from '@casa-segura/database';

export {
  Role,
  UserStatus,
  ProLevel,
  RiskLevel,
  JobStatus,
  QuoteStatus,
  PaymentStatus,
  PaymentMethod,
  TransactionType,
  WithdrawalStatus,
} from '@casa-segura/database';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Auth types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  phone: string;
  password: string;
  name: string;
  role?: 'CLIENT' | 'PROFESSIONAL';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Job types
export interface CreateJobDto {
  mission_id: string;
  address_id: string;
  scheduled_date?: string;
  scheduled_window?: string;
  diagnosis_answers?: Record<string, unknown>;
  photos_before?: string[];
}

// Quote types
export interface CreateQuoteDto {
  job_id: string;
  amount: number;
  notes?: string;
  available_dates: string[];
}

export interface UpdateQuoteDto {
  amount?: number;
  notes?: string;
  available_dates?: string[];
}

// Professional Service types
export interface CreateProfessionalServiceDto {
  mission_id: string;
  price_min: number;
  price_max: number;
  description?: string;
}

export interface UpdateProfessionalServiceDto {
  price_min?: number;
  price_max?: number;
  description?: string;
  is_active?: boolean;
}

// Professional Stats
export interface ProfessionalStats {
  earnings_month: number;
  earnings_week: number;
  pending_quotes: number;
  acceptance_rate: number;
  rating_avg: number;
  total_jobs: number;
  earnings_last_7_days: Array<{
    date: string;
    amount: number;
  }>;
}

export interface ProfessionalEarnings {
  available_balance: number;
  total_earnings_month: number;
  platform_fee_rate: number;
  transactions: Array<{
    id: string;
    type: 'EARNING' | 'FEE' | 'WITHDRAWAL';
    amount: number;
    job_code?: string;
    date: Date;
    description: string;
  }>;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalJobs: number;
  completedJobs: number;
  revenue: number;
  pendingJobs: number;
}

// Payment types
export interface CreatePaymentDto {
  job_id: string;
  method: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD';
  installments?: number;
}

export interface PaymentResponse {
  id: string;
  status: string;
  amount: number;
  method: string;
  qr_code?: string;
  qr_code_base64?: string;
  expires_at?: string;
  gateway_payment_id?: string;
}

export interface CreateWithdrawalDto {
  amount: number;
  pix_key: string;
}

export interface WithdrawalResponse {
  id: string;
  amount: number;
  pix_key: string;
  status: string;
  requested_at: string;
}

export interface CreateRefundDto {
  payment_id: string;
  amount: number;
  reason: string;
}

export interface FinancialStats {
  available: number;
  held: number;
  total_earned: number;
  total_withdrawn: number;
  pending_withdrawals: number;
  transactions_last_30_days: Array<{
    date: string;
    amount: number;
    type: string;
  }>;
}
