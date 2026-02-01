const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';
const TOKEN_KEY = 'casa_segura_admin_token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro na requisicao' }));
    throw new Error(error.message);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'ADMIN' | 'CLIENT' | 'PROFESSIONAL';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  user_id: string;
  user: User;
  bio?: string;
  experience_years?: number;
  service_radius_km?: number;
  is_verified: boolean;
  is_available: boolean;
  rating?: number;
  total_reviews: number;
  total_jobs: number;
  categories: Category[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  order: number;
  created_at: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ONE_TIME';
  is_active: boolean;
  created_at: string;
}

export interface Job {
  id: string;
  code: string;
  title: string;
  description: string;
  status: 'PENDING' | 'QUOTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  client: User;
  professional?: Professional;
  category: Category;
  address: Address;
  scheduled_date?: string;
  quoted_price?: number;
  final_price?: number;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_default: boolean;
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

export interface DashboardStats {
  totalUsers: number;
  totalProfessionals: number;
  totalJobs: number;
  totalRevenue: number;
  pendingJobs: number;
  completedJobs: number;
  activeProfessionals: number;
  newUsersThisMonth: number;
}

// API endpoints
export const usersApi = {
  list: (params?: { page?: number; limit?: number; search?: string; role?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    return api.get<PaginatedResponse<User>>(`/users?${query}`);
  },
  get: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User> & { password: string }) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleActive: (id: string) => api.patch<User>(`/users/${id}/toggle-active`),
};

export const professionalsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; verified?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.verified !== undefined) query.set('verified', String(params.verified));
    return api.get<PaginatedResponse<Professional>>(`/professionals?${query}`);
  },
  get: (id: string) => api.get<Professional>(`/professionals/${id}`),
  verify: (id: string) => api.patch<Professional>(`/professionals/${id}/verify`),
  unverify: (id: string) => api.patch<Professional>(`/professionals/${id}/unverify`),
  toggleAvailable: (id: string) => api.patch<Professional>(`/professionals/${id}/toggle-available`),
};

export const categoriesApi = {
  list: (params?: { page?: number; limit?: number; active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.active !== undefined) query.set('active', String(params.active));
    return api.get<PaginatedResponse<Category>>(`/categories?${query}`);
  },
  get: (id: string) => api.get<Category>(`/categories/${id}`),
  create: (data: Partial<Category>) => api.post<Category>('/categories', data),
  update: (id: string, data: Partial<Category>) => api.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
  reorder: (ids: string[]) => api.post('/categories/reorder', { ids }),
};

export const missionsApi = {
  list: (params?: { page?: number; limit?: number; type?: string; active?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.type) query.set('type', params.type);
    if (params?.active !== undefined) query.set('active', String(params.active));
    return api.get<PaginatedResponse<Mission>>(`/missions?${query}`);
  },
  get: (id: string) => api.get<Mission>(`/missions/${id}`),
  create: (data: Partial<Mission>) => api.post<Mission>('/missions', data),
  update: (id: string, data: Partial<Mission>) => api.patch<Mission>(`/missions/${id}`, data),
  delete: (id: string) => api.delete(`/missions/${id}`),
  toggleActive: (id: string) => api.patch<Mission>(`/missions/${id}/toggle-active`),
};

export const jobsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    return api.get<PaginatedResponse<Job>>(`/jobs?${query}`);
  },
  get: (id: string) => api.get<Job>(`/jobs/${id}`),
  updateStatus: (id: string, status: string) => api.patch<Job>(`/jobs/${id}/status`, { status }),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getRecentJobs: (limit = 5) => api.get<Job[]>(`/dashboard/recent-jobs?limit=${limit}`),
};

export const paymentsApi = {
  listWithdrawals: (params?: { skip?: number; take?: number; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.skip) query.set('skip', String(params.skip));
    if (params?.take) query.set('take', String(params.take));
    if (params?.status) query.set('status', params.status);
    return api.get<{ data: any[]; total: number }>(`/payments/withdrawals?${query}`);
  },
  approveWithdrawal: (id: string, data: { approve: boolean; rejection_reason?: string }) =>
    api.patch(`/payments/withdrawals/${id}/approve`, data),
  getFinancialStats: () => api.get<any>('/payments/stats/platform'),
};
