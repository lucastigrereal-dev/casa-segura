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
} from '@casa-segura/database';

export {
  Role,
  UserStatus,
  ProLevel,
  RiskLevel,
  JobStatus,
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

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalJobs: number;
  completedJobs: number;
  revenue: number;
  pendingJobs: number;
}
