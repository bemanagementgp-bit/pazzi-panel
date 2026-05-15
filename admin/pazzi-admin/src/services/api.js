import axios from 'axios';
import * as tokenManager from '../utils/tokenManager.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor para agregar token JWT a cada request
 * Obtiene el token de sessionStorage de forma segura
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor para manejar errores de autenticación
 * Si recibe 401 (Unauthorized), limpia el token
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      tokenManager.clearToken();
      // Redirigir a login si es necesario (puede hacerse desde el componente)
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/puntos/login', { email, password }),
};

// Puntos API
export const puntosAPI = {
  getAll: () => apiClient.get('/puntos'),
  getById: (id) => apiClient.get(`/puntos/${id}`),
  create: (data) => apiClient.post('/puntos', data),
  update: (id, data) => apiClient.put(`/puntos/${id}`, data),
  delete: (id) => apiClient.delete(`/puntos/${id}`),
};

export default apiClient;
