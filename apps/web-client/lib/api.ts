const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, headers: customHeaders, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// Auth endpoints
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { email: string; phone: string; password: string; name: string; referral_code?: string }) =>
    api.post('/auth/register', data),
  getMe: (token: string) =>
    api.get('/auth/me', { token }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

// Categories endpoints
export const categoriesApi = {
  list: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
};

// Missions endpoints
export const missionsApi = {
  list: (categoryId?: string) =>
    api.get(`/missions${categoryId ? `?categoryId=${categoryId}` : ''}`),
  getById: (id: string) => api.get(`/missions/${id}`),
};

// Jobs endpoints
export const jobsApi = {
  list: (token: string) => api.get('/jobs/my', { token }),
  getById: (id: string, token: string) => api.get(`/jobs/${id}`, { token }),
  getByCode: (code: string, token: string) => api.get(`/jobs/code/${code}`, { token }),
  create: (data: unknown, token: string) => api.post('/jobs', data, { token }),
  updateStatus: (id: string, status: string, token: string) =>
    api.patch(`/jobs/${id}/status`, { status }, { token }),
};

// Addresses endpoints
export const addressesApi = {
  list: (token: string) => api.get('/addresses', { token }),
  create: (data: unknown, token: string) => api.post('/addresses', data, { token }),
  update: (id: string, data: unknown, token: string) =>
    api.patch(`/addresses/${id}`, data, { token }),
  delete: (id: string, token: string) => api.delete(`/addresses/${id}`, { token }),
  setDefault: (id: string, token: string) =>
    api.patch(`/addresses/${id}/default`, {}, { token }),
};

// Professionals endpoints
export const professionalsApi = {
  list: (params?: { categoryId?: string; city?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.categoryId) searchParams.append('categoryId', params.categoryId);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    const query = searchParams.toString();
    return api.get(`/professionals${query ? `?${query}` : ''}`);
  },
  getById: (id: string) => api.get(`/professionals/${id}`),
  register: (data: unknown, token: string) => api.post('/professionals/register', data, { token }),
};

// Reviews endpoints
export const reviewsApi = {
  create: (data: unknown, token: string) => api.post('/reviews', data, { token }),
  getByProfessional: (userId: string) => api.get(`/reviews/professional/${userId}`),
};

// Payments endpoints
export const paymentsApi = {
  create: (data: unknown, token: string) => api.post('/payments', data, { token }),
  getById: (id: string, token: string) => api.get(`/payments/${id}`, { token }),
};

// Chat endpoints
export const chatApi = {
  getConversations: (token: string) => api.get('/chat/conversations', { token }),
  getConversation: (id: string, token: string) => api.get(`/chat/conversations/${id}`, { token }),
  getConversationByJob: (jobId: string, token: string) =>
    api.get(`/chat/conversations/job/${jobId}`, { token }),
  getMessages: (conversationId: string, token: string, limit = 50, before?: string) => {
    const query = before ? `?limit=${limit}&before=${before}` : `?limit=${limit}`;
    return api.get(`/chat/conversations/${conversationId}/messages${query}`, { token });
  },
  sendMessage: (conversationId: string, data: { content: string; type?: string }, token: string) =>
    api.post(`/chat/conversations/${conversationId}/messages`, data, { token }),
  markAsRead: (conversationId: string, token: string) =>
    api.post(`/chat/conversations/${conversationId}/read`, {}, { token }),
  getUnreadCount: (token: string) => api.get('/chat/unread-count', { token }),
};

// Notifications endpoints
export const notificationsApi = {
  getAll: (token: string, limit = 20, offset = 0, unreadOnly = false) => {
    const query = `?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`;
    return api.get(`/notifications${query}`, { token });
  },
  getUnreadCount: (token: string) => api.get('/notifications/unread-count', { token }),
  markAsRead: (id: string, token: string) =>
    api.post(`/notifications/${id}/read`, {}, { token }),
  markAllAsRead: (token: string) =>
    api.post('/notifications/read-all', {}, { token }),
  markAsClicked: (id: string, token: string) =>
    api.post(`/notifications/${id}/click`, {}, { token }),
  delete: (id: string, token: string) =>
    api.delete(`/notifications/${id}`, { token }),
};

// Referrals endpoints
export const referralsApi = {
  getMyCode: (token: string) => api.get('/referrals/my-code', { token }),
  getMyStats: (token: string) => api.get('/referrals/my-stats', { token }),
  validateCode: (code: string) => api.post('/referrals/validate', { code }),
  applyCode: (code: string, token: string) =>
    api.post('/referrals/apply', { code }, { token }),
};

// Credits endpoints
export const creditsApi = {
  getBalance: (token: string) => api.get('/referrals/credits/balance', { token }),
  getTransactions: (token: string, page = 1, limit = 20) =>
    api.get(`/referrals/credits/transactions?page=${page}&limit=${limit}`, { token }),
  applyToJob: (jobId: string, jobAmount: number, token: string) =>
    api.post('/referrals/credits/apply-to-job', { job_id: jobId, job_amount: jobAmount }, { token }),
};
