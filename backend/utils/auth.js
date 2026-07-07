import bcrypt from 'bcrypt';
import crypto from 'crypto';

/**
 * Hash una contraseña usando bcrypt con salt rounds de 10
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
export const hashPassword = async (password) => {
  if (!password || password.length < 8) {
    throw new Error('La contraseña debe tener al menos 8 caracteres');
  }
  return await bcrypt.hash(password, 10);
};

/**
 * Compara una contraseña en texto plano con su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash bcrypt almacenado
 * @returns {Promise<boolean>} - True si coinciden
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Genera un JWT_SECRET seguro de 32+ caracteres
 * @returns {string} - Secret aleatorio en hex
 */
export const generateJWTSecret = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Valida que una contraseña cumple con los requisitos de seguridad
 * Mínimo 8 caracteres, debe contener mayúscula, minúscula, número
 * @param {string} password - Contraseña a validar
 * @returns {boolean} - True si cumple requisitos
 */
export const validatePasswordStrength = (password) => {
  if (!password || password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false; // Mayúscula
  if (!/[a-z]/.test(password)) return false; // Minúscula
  if (!/[0-9]/.test(password)) return false; // Número
  return true;
};

export default {
  hashPassword,
  verifyPassword,
  generateJWTSecret,
  validatePasswordStrength,
};
