import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api: AxiosInstance = axios.create({
  baseURL:        BASE_URL,
  timeout:        15000,
  headers:        { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ── Request interceptor — attach JWT ──────────────────────────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ssm_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ── Response interceptor — handle errors globally ─────────────────────────────
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; success?: boolean }>) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ssm_token');
        localStorage.removeItem('ssm_user');
        // Redirect only if not already on an auth page
        const authPaths = ['/login', '/signup', '/forgot-password'];
        if (!authPaths.some((p) => window.location.pathname.includes(p))) {
          window.location.href = '/login';
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.';

    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Typed API helpers ─────────────────────────────────────────────────────────
export const authAPI = {
  register:       (data: unknown)           => api.post('/auth/register', data),
  login:          (data: unknown)           => api.post('/auth/login', data),
  logout:         ()                        => api.post('/auth/logout'),
  getMe:          ()                        => api.get('/auth/me'),
  forgotPassword: (email: string)           => api.post('/auth/forgot-password', { email }),
  resetPassword:  (token: string, password: string) =>
    api.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (data: unknown)           => api.put('/auth/change-password', data),
};

export const userAPI = {
  getProfile:        ()               => api.get('/users/profile'),
  updateProfile:     (data: unknown)  => api.put('/users/profile', data),
  updateAvatar:      (form: FormData) => api.put('/users/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getBookings:       (params?: unknown) => api.get('/users/bookings', { params }),
  getSavedProviders: ()               => api.get('/users/saved-providers'),
  saveProvider:      (id: string)     => api.post(`/users/saved-providers/${id}`),
  unsaveProvider:    (id: string)     => api.delete(`/users/saved-providers/${id}`),
  getNotifications:  (params?: unknown) => api.get('/users/notifications', { params }),
  markNotificationRead: (id: string) => api.put(`/users/notifications/${id}/read`),
};

export const providerAPI = {
  getAll:             (params?: unknown) => api.get('/providers', { params }),
  getNearby:          (params: unknown)  => api.get('/providers/nearby', { params }),
  getById:            (id: string)       => api.get(`/providers/${id}`),
  create:             (data: unknown)    => api.post('/providers', data),
  update:             (id: string, data: unknown) => api.put(`/providers/${id}`, data),
  updateAvailability: (id: string, data: unknown) => api.put(`/providers/${id}/availability`, data),
  getBookings:        (id: string, params?: unknown) => api.get(`/providers/${id}/bookings`, { params }),
  getAnalytics:       (id: string)       => api.get(`/providers/${id}/analytics`),
};

export const serviceAPI = {
  getAll:      (params?: unknown) => api.get('/services', { params }),
  getFeatured: ()                 => api.get('/services/featured'),
  getCategories: ()               => api.get('/services/categories'),
  getById:     (id: string)       => api.get(`/services/${id}`),
  create:      (data: unknown)    => api.post('/services', data),
  update:      (id: string, data: unknown) => api.put(`/services/${id}`, data),
  delete:      (id: string)       => api.delete(`/services/${id}`),
};

export const bookingAPI = {
  getAll:    (params?: unknown)  => api.get('/bookings', { params }),
  getById:   (id: string)        => api.get(`/bookings/${id}`),
  create:    (data: unknown)     => api.post('/bookings', data),
  updateStatus: (id: string, data: unknown) => api.put(`/bookings/${id}/status`, data),
  cancel:    (id: string, reason?: string) => api.put(`/bookings/${id}/cancel`, { reason }),
  reschedule: (id: string, data: unknown)  => api.put(`/bookings/${id}/reschedule`, data),
  delete:    (id: string)        => api.delete(`/bookings/${id}`),
};

export const reviewAPI = {
  getByProvider: (providerId: string, params?: unknown) =>
    api.get(`/reviews/provider/${providerId}`, { params }),
  submit: (data: unknown)          => api.post('/reviews', data),
  update: (id: string, data: unknown) => api.put(`/reviews/${id}`, data),
  delete: (id: string)             => api.delete(`/reviews/${id}`),
};

export const aiAPI = {
  chat:             (data: unknown) => api.post('/ai/chat', data),
  search:           (query: string) => api.post('/ai/search', { query }),
  recommend:        (data: unknown) => api.post('/ai/recommend', data),
  summarizeReviews: (providerId: string) => api.post('/ai/summarize-reviews', { providerId }),
  analyzeImage:     (form: FormData)    => api.post('/ai/analyze-image', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};

export const paymentAPI = {
  createOrder:  (bookingId: string) => api.post('/payments/create-order', { bookingId }),
  verifyPayment: (data: unknown)    => api.post('/payments/verify', data),
  getHistory:   (params?: unknown)  => api.get('/payments/history', { params }),
  refund:       (id: string, reason?: string) => api.post(`/payments/refund/${id}`, { reason }),
};

export const notificationAPI = {
  getAll:    (params?: unknown) => api.get('/notifications', { params }),
  markAllRead: ()               => api.put('/notifications/read-all'),
  delete:    (id: string)       => api.delete(`/notifications/${id}`),
};

export const adminAPI = {
  getDashboard:   ()              => api.get('/admin/dashboard'),
  getAnalytics:   ()              => api.get('/admin/analytics'),
  getUsers:       (params?: unknown) => api.get('/admin/users', { params }),
  updateUserStatus: (id: string, data: unknown) => api.put(`/admin/users/${id}/status`, data),
  deleteUser:     (id: string)    => api.delete(`/admin/users/${id}`),
  getProviders:   (params?: unknown) => api.get('/admin/providers', { params }),
  approveProvider: (id: string, data: unknown) => api.put(`/admin/providers/${id}/approve`, data),
  getBookings:    (params?: unknown) => api.get('/admin/bookings', { params }),
  getCategories:  ()              => api.get('/admin/categories'),
  createCategory: (data: unknown) => api.post('/admin/categories', data),
  updateCategory: (id: string, data: unknown) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id: string)    => api.delete(`/admin/categories/${id}`),
};
