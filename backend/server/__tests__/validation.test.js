/**
 * Tests para validación de entrada
 * Verifica que Joi schemas rechazan datos inválidos
 */

import { schemas } from '../middleware/validation.js';

describe('Input Validation - Joi Schemas', () => {
  
  describe('Login Validation', () => {
    const schema = schemas.login;

    test('Acepta email y password válidos', async () => {
      const data = {
        email: 'admin@pazzi.com',
        password: 'Pazzi2024!Secure'
      };
      const result = schema.validate(data);
      expect(result.error).toBeUndefined();
    });

    test('Rechaza email inválido', async () => {
      const data = {
        email: 'not-an-email',
        password: 'Pazzi2024!Secure'
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('email');
    });

    test('Rechaza password muy corta', async () => {
      const data = {
        email: 'admin@pazzi.com',
        password: 'Short1!'
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('8');
    });

    test('Rechaza password sin mayúscula', async () => {
      const data = {
        email: 'admin@pazzi.com',
        password: 'lowercase123'
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
    });
  });

  describe('Punto de Venta Validation', () => {
    const schema = schemas.punto;

    test('Acepta punto con datos válidos', async () => {
      const data = {
        nombre: 'Pizzería Test',
        zona: 'Zona Norte',
        direccion: 'Calle Principal 123',
        telefono: '+34987654321',
        lat: 40.4168,
        lng: -3.7038
      };
      const result = schema.validate(data);
      expect(result.error).toBeUndefined();
    });

    test('Rechaza nombre muy corto', async () => {
      const data = {
        nombre: 'AB',
        zona: 'Zona Norte',
        direccion: 'Calle Principal 123',
        telefono: '+34987654321',
        lat: 40.4168,
        lng: -3.7038
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('3');
    });

    test('Rechaza zona inválida', async () => {
      const data = {
        nombre: 'Pizzería Test',
        zona: 'Zona Inexistente',
        direccion: 'Calle Principal 123',
        telefono: '+34987654321',
        lat: 40.4168,
        lng: -3.7038
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('Zona');
    });

    test('Rechaza latitud fuera de rango', async () => {
      const data = {
        nombre: 'Pizzería Test',
        zona: 'Zona Norte',
        direccion: 'Calle Principal 123',
        telefono: '+34987654321',
        lat: 95,
        lng: -3.7038
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('latitud');
    });

    test('Rechaza longitud fuera de rango', async () => {
      const data = {
        nombre: 'Pizzería Test',
        zona: 'Zona Norte',
        direccion: 'Calle Principal 123',
        telefono: '+34987654321',
        lat: 40.4168,
        lng: -200
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('longitud');
    });

    test('Rechaza teléfono con formato inválido', async () => {
      const data = {
        nombre: 'Pizzería Test',
        zona: 'Zona Norte',
        direccion: 'Calle Principal 123',
        telefono: 'invalid-phone',
        lat: 40.4168,
        lng: -3.7038
      };
      const result = schema.validate(data);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('teléfono');
    });
  });

  describe('ID Validation', () => {
    const schema = schemas.id;

    test('Acepta ID válido (entero positivo)', async () => {
      const result = schema.validate({ id: 123 });
      expect(result.error).toBeUndefined();
    });

    test('Rechaza ID negativo', async () => {
      const result = schema.validate({ id: -1 });
      expect(result.error).toBeDefined();
    });

    test('Rechaza ID cero', async () => {
      const result = schema.validate({ id: 0 });
      expect(result.error).toBeDefined();
    });

    test('Rechaza ID no numérico', async () => {
      const result = schema.validate({ id: 'abc' });
      expect(result.error).toBeDefined();
    });
  });
});
