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
      localStorage.removeItem('business');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
    register: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    address?: string;
    }) => API.post('/auth/register', data),
  login: (email: string, password: string) => API.post('/auth/login', { email, password }),
  logout: () => API.post('/auth/logout'),
  getProfile: () => API.get('/auth/profile')
};

// User API (Admin only)
export const userAPI = {
    getAll: () => API.get('/users'),
    create: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: 'admin' | 'manager' | 'cashier';
    }) => API.post('/users', data),
    update: (id: number, data: any) => API.put(`/users/${id}`, data),
    delete: (id: number) => API.delete(`/users/${id}`),
};

// Product API
export const productAPI = {
  getAll: (filters?: { branch_id?: number; category_id?: number; low_stock?: boolean }) => {
    const params = new URLSearchParams();
    if (filters?.branch_id) params.append('branch_id', filters.branch_id.toString());
    if (filters?.category_id) params.append('category_id', filters.category_id.toString());
    if (filters?.low_stock) params.append('low_stock', 'true');
    return API.get(`/products?${params.toString() ? '?' + params.toString() : ''}`);
    
  },
  getOne: (id: number) => API.get(`/products/${id}`),
  create: (data: any) => API.post('/products', data),
  update: (id: number, data: any) => API.put(`/products/${id}`, data),
  delete: (id: number) => API.delete(`/products/${id}`),
  getLowStock: (threshold = 10) => API.get(`/products/low-stock?threshold=${threshold}`),
};

// Category API
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getOne: (id: number) => API.get(`/categories/${id}`),
  create: (data: { name: string; description?: string }) => API.post('/categories', data),
  update: (id: number, data: any) => API.put(`/categories/${id}`, data),
  delete: (id: number) => API.delete(`/categories/${id}`),
};

// Customer API
export const customerAPI = {
    getAll: (filters?: { credit_status?: string; search?: string }) => {
        const params = new URLSearchParams();
        if (filters?.credit_status) params.append('credit_status', filters.credit_status);
        if (filters?.search) params.append('search', filters.search);
        return API.get(`/customers?${params.toString() ? '?' + params.toString() : ''}`);
    },
    getCreditCustomers: () => API.get('/customers/credit'),
    getOne: (id: number) => API.get(`/customers/${id}`),
    create: (data: any) => API.post('/customers', data),
    update: (id: number, data: any) => API.put(`/customers/${id}`, data),
    recordPayment: (id: number, data: { amount: number; notes?: string }) => API.post(`/customers/${id}/payment`, data),
};

// Sale API
export const saleAPI = {
    getAll: (filters?: { start_date?: string; end_date?: string; payment_type?: string }) => {
        const params = new URLSearchParams();
        if (filters?.start_date) params.append('start_date', filters.start_date);
        if (filters?.end_date) params.append('end_date', filters.end_date);
        if (filters?.payment_type) params.append('payment_type', filters.payment_type);
        return API.get(`/sales${params.toString() ? '?' + params.toString() : ''}`);
    },
    getOne: (id: number) => API.get(`/sales/${id}`),
    create: (data: any) => API.post('/sales', data),
    refund: (id: number) => API.post(`/sales/${id}/refund`),
};

// Report API
export const reportAPI = {
    getSalesReport: (period?: string) => {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        return API.get(`/reports/sales${params.toString() ? '?' + params.toString() : ''}`);
    },
    getInventoryReport: () => API.get('/reports/inventory'),
    exportReport: (type: string, start_date?: string, end_date?: string) => {
        const params = new URLSearchParams();
        if (start_date) params.append('start_date', start_date);
        if (end_date) params.append('end_date', end_date);
        return API.get(`/reports/export/${params.toString() ? '?' + params.toString() : ''}`,
         { responseType: 'blob' });
    },
};

// Subscription API
export const subscriptionAPI = {
  getCurrent: () => API.get('/subscription/current'),
  getPlans: () => API.get('/subscription/plans'),
  subscribe: (data: { plan_id: number; billing_cycle: string; payment_method: string; paymentDetails: any }) =>
     API.post('/subscription/subscribe', data),
  cancel: () => API.post('/subscription/cancel'),
};

// Invoice API calls
export const invoiceAPI = {
  getAll: () => API.get('/invoices'),
  getOne: (invoiceNumber: string) => API.get(`/invoices/${invoiceNumber}`),
  download: (invoiceNumber: string) => API.get(`/invoices/${invoiceNumber}/download`,
     { responseType: 'blob' }),
};

export default API;