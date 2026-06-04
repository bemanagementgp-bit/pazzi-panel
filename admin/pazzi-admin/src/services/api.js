import axios from 'axios';
import * as tokenManager from '../utils/tokenManager.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  // `withCredentials: true` permite que el navegador envíe y reciba la cookie
  // httpOnly `pazzi_session` que emite el backend tras el login. Requiere que
  // el CORS del backend tenga `credentials: true` y un origen específico (no `*`).
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Interceptor de request: si todavía existe un token en sessionStorage
 * (clientes legacy / refresh tras login), lo enviamos como Bearer.
 * El camino preferido es la cookie httpOnly, que viaja automáticamente.
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
 * Si recibimos 401, limpiamos cualquier token local.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenManager.clearToken();
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post('/puntos/login', { email, password }),
  logout: () => apiClient.post('/puntos/logout'),
};

// Puntos API
export const puntosAPI = {
  getAll:                ()         => apiClient.get('/puntos'),
  getAllAdmin:           ()         => apiClient.get('/puntos/admin/all'),
  getVendedorPendientes: ()         => apiClient.get('/puntos/vendedor/pendientes'),
  getById:               (id)       => apiClient.get(`/puntos/${id}`),
  create:                (data)     => apiClient.post('/puntos', data),
  update:                (id, data) => apiClient.put(`/puntos/${id}`, data),
  updateEstado:          (id, estado) => apiClient.patch(`/puntos/${id}/estado`, { estado }),
  delete:                (id)       => apiClient.delete(`/puntos/${id}`),
};

export default apiClient;
