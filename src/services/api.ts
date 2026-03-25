import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor - adds token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handles errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) => API.post('/auth/login', { email, password }),
  logout: () => API.post('/auth/logout'),
  getProfile: () => API.get('/auth/profile'),
  register: (userData: any) => API.post('/auth/register', userData),
};

// Product API
export const productAPI = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return API.get(`/products${params ? '?' + params : ''}`);
  },
  getOne: (id: string) => API.get(`/products/${id}`),
  create: (data: any) => API.post('/products', data),
  update: (id: string, data: any) => API.put(`/products/${id}`, data),
  delete: (id: string) => API.delete(`/products/${id}`),
  getLowStock: (threshold = 10) => API.get(`/products/low-stock?threshold=${threshold}`),
};

// Category API
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getOne: (id: string) => API.get(`/categories/${id}`),
  create: (data: any) => API.post('/categories', data),
  update: (id: string, data: any) => API.put(`/categories/${id}`, data),
  delete: (id: string) => API.delete(`/categories/${id}`),
};

// Customer API
export const customerAPI = {
  getAll: () => API.get('/customers'),
  getOne: (id: string) => API.get(`/customers/${id}`),
  create: (data: any) => API.post('/customers', data),
  update: (id: string, data: any) => API.put(`/customers/${id}`, data),
  delete: (id: string) => API.delete(`/customers/${id}`),
  recordPayment: (id: string, data: any) => API.post(`/customers/${id}/payment`, data),
};

// Sale API
export const saleAPI = {
  getAll: (filters?: any) => {
    const params = new URLSearchParams(filters).toString();
    return API.get(`/sales${params ? '?' + params : ''}`);
  },
  getOne: (id: string) => API.get(`/sales/${id}`),
  create: (data: any) => API.post('/sales', data),
  refund: (id: string) => API.post(`/sales/${id}/refund`),
};

// Report API
export const reportAPI = {
  getSalesReport: (period: string) => API.get(`/reports/sales?period=${period}`),
  getProductPerformance: () => API.get('/reports/products'),
  exportCSV: (type: string) => API.get(`/reports/export/${type}`, { responseType: 'blob' }),
};

// Subscription API
export const subscriptionAPI = {
  getCurrent: () => API.get('/subscription'),
  getPlans: () => API.get('/subscription/plans'),
  subscribe: (planId: string, cycle: string) => API.post('/subscription/subscribe', { planId, cycle }),
  cancel: () => API.post('/subscription/cancel'),
  getInvoices: () => API.get('/subscription/invoices'),
  downloadInvoice: (id: string) => API.get(`/subscription/invoices/${id}/download`, { responseType: 'blob' }),
};

// Invoice API calls
export const invoiceAPI = {
  getAll: () => API.get('/invoices'),
  getOne: (invoiceNumber: string) => API.get(`/invoices/${invoiceNumber}`),
  download: (invoiceNumber: string) => API.get(`/invoices/${invoiceNumber}/download`, { responseType: 'blob' }),
};

export default API;