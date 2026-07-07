/**
 * Tests para funciones de autenticación
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/auth.js';

describe('Authentication Security Functions', () => {

  describe('Password Hashing with Bcrypt', () => {
    
    test('hashPassword genera un hash válido', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash.startsWith('$2b$')).toBe(true);
      expect(hash).not.toBe(password);
    });

    test('El mismo password genera hashes diferentes (salt aleatorio)', async () => {
      const password = 'TestPass123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);
      
      expect(hash1).not.toBe(hash2);
    });

    test('verifyPassword valida hash correcto', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    test('verifyPassword rechaza password incorrecto', async () => {
      const password = 'TestPass123!';
      const hash = await hashPassword(password);
      
      const isValid = await verifyPassword('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('Password Strength Validation', () => {
    
    test('Acepta password fuerte', () => {
      const result = validatePasswordStrength('Pazzi2024!Secure');
      expect(result).toBe(true);
    });

    test('Rechaza password sin mayúscula', () => {
      const result = validatePasswordStrength('pazzi2024!secure');
      expect(result).toBe(false);
    });

    test('Rechaza password sin minúscula', () => {
      const result = validatePasswordStrength('PAZZI2024!SECURE');
      expect(result).toBe(false);
    });

    test('Rechaza password sin número', () => {
      const result = validatePasswordStrength('PazziSecure!');
      expect(result).toBe(false);
    });

    test('Rechaza password muy corta (< 8 caracteres)', () => {
      const result = validatePasswordStrength('Pass12!');
      expect(result).toBe(false);
    });

    test('Acepta password con 8+ caracteres, mayúscula, minúscula y número', () => {
      const result = validatePasswordStrength('Pass1234');
      expect(result).toBe(true);
    });
  });
});
