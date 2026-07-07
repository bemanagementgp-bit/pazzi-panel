import { useState, useEffect } from 'react';
import * as tokenManager from '../utils/tokenManager.js';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Al montar el componente, verificar si hay token válido en sessionStorage
   */
  useEffect(() => {
    const token = tokenManager.getToken();
    const adminData = tokenManager.getAdminData();
    
    if (token && adminData) {
      setIsAuthenticated(true);
      setAdmin(adminData);
    }
    setLoading(false);

    // Auto-logout si el token expira mientras la pestaña está abierta
    const checkExpiryInterval = setInterval(() => {
      const remaining = tokenManager.getTokenTimeRemaining();
      if (remaining <= 0) {
        logout(); // Auto-logout si expira
      }
    }, 60000); // Verificar cada minuto

    return () => clearInterval(checkExpiryInterval);
  }, []);

  /**
   * Login - guardar token y datos del admin en sessionStorage
   * @param {string} email - Email del admin
   * @param {string} token - JWT token
   * @param {Object} adminData - Datos del admin
   */
  const login = (email, token, adminData) => {
    // Guardar con expiración de 2 horas
    tokenManager.setToken(token, 2);
    tokenManager.setAdminData(adminData);
    setIsAuthenticated(true);
    setAdmin(adminData);
  };

  /**
   * Logout - limpiar datos de sesión
   */
  const logout = () => {
    tokenManager.clearToken();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  /**
   * Obtener el token actual
   * @returns {string|null} - Token JWT o null
   */
  const getToken = () => {
    return tokenManager.getToken();
  };

  return {
    isAuthenticated,
    admin,
    loading,
    login,
    logout,
    getToken,
    isAdmin: () => admin?.role === 'admin',
    isVendedor: () => admin?.role === 'vendedor',
  };
};
