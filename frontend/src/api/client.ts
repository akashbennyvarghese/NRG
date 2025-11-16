import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data: any) => apiClient.post('/auth/register', data),
  login: (data: any) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
};

export const productsAPI = {
  getAll: (filters: any) => apiClient.get('/products', { params: filters }),
  getById: (id: string) => apiClient.get(`/products/${id}`),
  search: (query: string) => apiClient.get('/search/suggestions', { params: { q: query } }),
};

export const cartAPI = {
  get: () => apiClient.get('/cart'),
  addItem: (data: any) => apiClient.post('/cart/items', data),
  removeItem: (itemId: string) => apiClient.delete(`/cart/items/${itemId}`),
  updateItem: (itemId: string, data: any) => apiClient.patch(`/cart/items/${itemId}`, data),
  clear: () => apiClient.delete('/cart'),
};

export const ordersAPI = {
  create: (data: any) => apiClient.post('/orders', data),
  getAll: () => apiClient.get('/orders'),
  getById: (id: string) => apiClient.get(`/orders/${id}`),
  cancel: (id: string) => apiClient.post(`/orders/${id}/cancel`),
};

export const paymentsAPI = {
  createOrder: (data: any) => apiClient.post('/payments/create-order', data),
  verify: (data: any) => apiClient.post('/payments/verify', data),
  refund: (data: any) => apiClient.post('/payments/refund', data),
};

export const adminAPI = {
  // Products
  createProduct: (data: any) => apiClient.post('/admin/products', data),
  updateProduct: (id: string, data: any) => apiClient.patch(`/admin/products/${id}`, data),
  publishProduct: (id: string) => apiClient.post(`/admin/products/${id}/publish`),
  addVariant: (productId: string, data: any) => apiClient.post(`/admin/products/${productId}/variants`, data),
  addImage: (productId: string, data: any) => apiClient.post(`/admin/products/${productId}/images`, data),

  // Inventory
  updateInventory: (variantId: string, data: any) => apiClient.patch(`/admin/inventory/${variantId}`, data),

  // Orders
  getOrders: (filters: any) => apiClient.get('/admin/orders', { params: filters }),
  updateOrderStatus: (orderId: string, data: any) => apiClient.patch(`/admin/orders/${orderId}/status`, data),
  createShipment: (orderId: string, data: any) => apiClient.post(`/admin/orders/${orderId}/shipment`, data),

  // Analytics
  getSalesAnalytics: (filters: any) => apiClient.get('/admin/analytics/sales', { params: filters }),
  getTopProducts: () => apiClient.get('/admin/analytics/top-products'),
};

export default apiClient;
