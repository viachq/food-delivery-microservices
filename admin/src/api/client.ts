import axios from 'axios';

// Direct service URLs (no Gateway)
const AUTH_SERVICE_URL = 'http://localhost:8001';
const CATALOG_SERVICE_URL = 'http://localhost:8002';
const ORDER_SERVICE_URL = 'http://localhost:8003';

// Determine which service handles the endpoint
function getServiceUrl(path: string): string {
  // Auth Service
  if (path.startsWith('/auth') || path.startsWith('/users') || path.startsWith('/admin/users')) {
    return AUTH_SERVICE_URL;
  }
  
  // Catalog Service
  if (path.startsWith('/restaurant') || path.startsWith('/admin/restaurant') ||
      path.startsWith('/categories') || path.startsWith('/admin/categories') ||
      path.startsWith('/menu') || path.startsWith('/admin/menu')) {
    return CATALOG_SERVICE_URL;
  }
  
  // Order Service
  if (path.startsWith('/cart') || path.startsWith('/orders') || path.startsWith('/admin/orders') ||
      path.startsWith('/payments') || path.startsWith('/reviews') || path.startsWith('/admin/stats')) {
    return ORDER_SERVICE_URL;
  }
  
  // Default to Order Service (most common)
  return ORDER_SERVICE_URL;
}

// Create axios instance with dynamic baseURL
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to set correct baseURL based on path
api.interceptors.request.use((config) => {
  const path = config.url || '';
  config.baseURL = getServiceUrl(path);
  
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
