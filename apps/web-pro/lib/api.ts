const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

interface LoginResponse {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      role: string;
      avatar_url?: string;
      professional?: {
        id: string;
        level: string;
        is_available: boolean;
        rating_avg: number;
        cpf_verified: boolean;
        selfie_verified: boolean;
        address_verified: boolean;
      };
    };
    accessToken: string;
    refreshToken: string;
  };
}

interface RegisterResponse {
  data: {
    user: {
      id: string;
      email: string;
      name: string;
      phone: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

const apiCall = async (
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  token?: string,
  body?: unknown,
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API error: ${response.status}`);
  }

  return response.json();
};

export const authApi = {
  login: async (email: string, password: string) => {
    return apiCall('POST', '/auth/login', undefined, {
      email,
      password,
    }) as Promise<LoginResponse>;
  },

  register: async (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
  }) => {
    return apiCall('POST', '/auth/register', undefined, {
      ...data,
      role: 'PROFESSIONAL',
    }) as Promise<RegisterResponse>;
  },

  getMe: async (token: string) => {
    return apiCall('GET', '/auth/me', token) as Promise<{
      data: {
        id: string;
        email: string;
        name: string;
        phone: string;
        role: string;
        avatar_url?: string;
        professional?: {
          id: string;
          level: string;
          is_available: boolean;
          rating_avg: number;
          cpf_verified: boolean;
          selfie_verified: boolean;
          address_verified: boolean;
        };
      };
    }>;
  },

  refresh: async (refreshToken: string) => {
    return apiCall('POST', '/auth/refresh', undefined, {
      refreshToken,
    }) as Promise<{
      data: {
        accessToken: string;
        refreshToken: string;
      };
    }>;
  },
};

export const professionalsApi = {
  getMyStats: async (token: string) => {
    return apiCall('GET', '/professionals/me/stats', token);
  },

  getMyEarnings: async (token: string, skip = 0, take = 20) => {
    return apiCall('GET', `/professionals/me/earnings?skip=${skip}&take=${take}`, token);
  },

  toggleAvailability: async (token: string, isAvailable: boolean) => {
    return apiCall('PATCH', '/professionals/me/availability', token, {
      isAvailable,
    });
  },

  updateRadius: async (token: string, work_radius_km: number) => {
    return apiCall('PATCH', '/professionals/me/radius', token, {
      work_radius_km,
    });
  },
};

export const jobsApi = {
  getAvailable: async (token: string, skip = 0, take = 20) => {
    return apiCall('GET', `/jobs/available?skip=${skip}&take=${take}`, token);
  },

  getMyJobs: async (token: string, skip = 0, take = 20, status?: string) => {
    const query = new URLSearchParams({ skip: String(skip), take: String(take) });
    if (status) query.append('status', status);
    return apiCall('GET', `/jobs/my-pro-jobs?${query}`, token);
  },

  getJobById: async (token: string, id: string) => {
    return apiCall('GET', `/jobs/${id}`, token);
  },

  startJob: async (token: string, jobId: string) => {
    return apiCall('POST', `/jobs/${jobId}/start`, token);
  },

  completeJob: async (token: string, jobId: string, photosAfter: string[]) => {
    return apiCall('POST', `/jobs/${jobId}/complete`, token, {
      photos_after: photosAfter,
    });
  },
};

export const quotesApi = {
  create: async (token: string, data: {
    job_id: string;
    amount: number;
    notes?: string;
    available_dates: string[];
  }) => {
    return apiCall('POST', '/quotes', token, data);
  },

  getByJobId: async (token: string, jobId: string) => {
    return apiCall('GET', `/quotes/job/${jobId}`, token);
  },

  getMyQuotes: async (token: string) => {
    return apiCall('GET', '/quotes/my', token);
  },

  accept: async (token: string, quoteId: string) => {
    return apiCall('PATCH', `/quotes/${quoteId}/accept`, token);
  },

  reject: async (token: string, quoteId: string, reason?: string) => {
    return apiCall('PATCH', `/quotes/${quoteId}/reject`, token, { reason });
  },
};

export const paymentsApi = {
  getMyBalance: async (token: string) => {
    return apiCall('GET', '/payments/balance/me', token);
  },

  getMyTransactions: async (token: string, skip = 0, take = 10) => {
    return apiCall('GET', `/payments/transactions/me?skip=${skip}&take=${take}`, token);
  },

  getFinancialStats: async (token: string) => {
    return apiCall('GET', '/payments/stats/me', token);
  },

  createWithdrawal: async (token: string, data: { amount: number; pix_key: string }) => {
    return apiCall('POST', '/payments/withdrawals', token, data);
  },

  listWithdrawals: async (token: string, skip = 0, take = 5) => {
    return apiCall('GET', `/payments/withdrawals?skip=${skip}&take=${take}`, token);
  },
};

export const chatApi = {
  getConversations: async (token: string) => {
    return apiCall('GET', '/chat/conversations', token);
  },

  getConversation: async (token: string, id: string) => {
    return apiCall('GET', `/chat/conversations/${id}`, token);
  },

  getConversationByJob: async (token: string, jobId: string) => {
    return apiCall('GET', `/chat/conversations/job/${jobId}`, token);
  },

  getMessages: async (token: string, conversationId: string, limit = 50, before?: string) => {
    const query = before ? `?limit=${limit}&before=${before}` : `?limit=${limit}`;
    return apiCall('GET', `/chat/conversations/${conversationId}/messages${query}`, token);
  },

  sendMessage: async (token: string, conversationId: string, data: { content: string; type?: string }) => {
    return apiCall('POST', `/chat/conversations/${conversationId}/messages`, token, data);
  },

  markAsRead: async (token: string, conversationId: string) => {
    return apiCall('POST', `/chat/conversations/${conversationId}/read`, token);
  },

  getUnreadCount: async (token: string) => {
    return apiCall('GET', '/chat/unread-count', token);
  },
};

export const notificationsApi = {
  getAll: async (token: string, limit = 20, offset = 0, unreadOnly = false) => {
    const query = `?limit=${limit}&offset=${offset}&unreadOnly=${unreadOnly}`;
    return apiCall('GET', `/notifications${query}`, token);
  },

  getUnreadCount: async (token: string) => {
    return apiCall('GET', '/notifications/unread-count', token);
  },

  markAsRead: async (token: string, id: string) => {
    return apiCall('POST', `/notifications/${id}/read`, token);
  },

  markAllAsRead: async (token: string) => {
    return apiCall('POST', '/notifications/read-all', token);
  },

  markAsClicked: async (token: string, id: string) => {
    return apiCall('POST', `/notifications/${id}/click`, token);
  },

  delete: async (token: string, id: string) => {
    return apiCall('DELETE', `/notifications/${id}`, token);
  },
};
