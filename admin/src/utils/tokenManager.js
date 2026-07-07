/**
 * Token Manager - Manejo seguro de JWT tokens
 * 
 * Usa sessionStorage en lugar de localStorage:
 * - sessionStorage se limpia al cerrar la pestaña
 * - Más resistente a XSS que localStorage
 * - Más seguro para datos sensibles
 */

const TOKEN_KEY = 'pazzi_admin_token';
const ADMIN_DATA_KEY = 'pazzi_admin_data';
const TOKEN_EXPIRY_KEY = 'pazzi_token_expiry';

/**
 * Obtener token del almacenamiento
 * @returns {string|null} - Token JWT o null
 */
export const getToken = () => {
  try {
    // Verificar si el token ha expirado
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      clearToken();
      return null;
    }
    
    return sessionStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error obteniendo token:', error);
    return null;
  }
};

/**
 * Guardar token en almacenamiento seguro
 * @param {string} token - JWT token
 * @param {number} expiresInHours - Horas de expiración
 */
export const setToken = (token, expiresInHours = 2) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    
    // Calcular y guardar timestamp de expiración
    const expiryTime = Date.now() + (expiresInHours * 60 * 60 * 1000);
    sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  } catch (error) {
    console.error('Error guardando token:', error);
  }
};

/**
 * Obtener datos del admin
 * @returns {Object|null} - Datos del admin o null
 */
export const getAdminData = () => {
  try {
    const data = sessionStorage.getItem(ADMIN_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error obteniendo datos del admin:', error);
    return null;
  }
};

/**
 * Guardar datos del admin
 * @param {Object} adminData - Datos del admin
 */
export const setAdminData = (adminData) => {
  try {
    sessionStorage.setItem(ADMIN_DATA_KEY, JSON.stringify(adminData));
  } catch (error) {
    console.error('Error guardando datos del admin:', error);
  }
};

/**
 * Limpiar todos los datos de autenticación
 */
export const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_DATA_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch (error) {
    console.error('Error limpiando token:', error);
  }
};

/**
 * Verificar si hay token válido
 * @returns {boolean} - True si hay token válido
 */
export const isTokenValid = () => {
  const token = getToken();
  return !!token;
};

/**
 * Obtener tiempo restante del token en segundos
 * @returns {number} - Segundos restantes o -1 si no hay token
 */
export const getTokenTimeRemaining = () => {
  try {
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
    if (!expiry) return -1;
    
    const remaining = parseInt(expiry) - Date.now();
    return remaining > 0 ? Math.floor(remaining / 1000) : -1;
  } catch (error) {
    console.error('Error calculando tiempo restante:', error);
    return -1;
  }
};

export default {
  getToken,
  setToken,
  getAdminData,
  setAdminData,
  clearToken,
  isTokenValid,
  getTokenTimeRemaining,
};
