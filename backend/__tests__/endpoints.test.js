/**
 * Tests para endpoints API
 * Nota: Estos tests requieren que el servidor esté corriendo
 */

import request from 'supertest';

const API_URL = 'http://localhost:3000/api';

describe('API Endpoints - Autenticación', () => {

  describe('POST /puntos/login', () => {
    
    test('Login exitoso con credenciales correctas', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'admin@pazzi.com',
          password: 'Pazzi2024!Secure'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('exitoso');
    });

    test('Login falla con password incorrecto', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'admin@pazzi.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('inválidas');
    });

    test('Login falla con email incorrecto', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'wrong@email.com',
          password: 'Pazzi2024!Secure'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('Login falla sin email', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          password: 'Pazzi2024!Secure'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('Login falla sin password', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'admin@pazzi.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('Login rechaza password muy corto', async () => {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'admin@pazzi.com',
          password: 'Short1!'
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /puntos (lista pública)', () => {
    
    test('GET sin token retorna lista de puntos', async () => {
      const response = await request(API_URL)
        .get('/puntos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});

describe('API Endpoints - Protegidos', () => {
  let token = '';

  beforeAll(async () => {
    // Obtener token para tests protegidos
    const loginResponse = await request(API_URL)
      .post('/puntos/login')
      .send({
        email: 'admin@pazzi.com',
        password: 'Pazzi2024!Secure'
      });
    
    token = loginResponse.body.token;
  });

  describe('POST /puntos (crear)', () => {
    
    test('Crear punto sin token falla con 401', async () => {
      const response = await request(API_URL)
        .post('/puntos')
        .send({
          nombre: 'Test Pizza',
          zona: 'Zona Norte',
          direccion: 'Test St',
          telefono: '+34987654321',
          lat: 40.42,
          lng: -3.71
        });

      expect(response.status).toBe(401);
    });

    test('Crear punto con token válido y datos correctos', async () => {
      const response = await request(API_URL)
        .post('/puntos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Pizza Create',
          zona: 'Zona Norte',
          direccion: 'Test St 789',
          telefono: '+34987654321',
          lat: 40.42,
          lng: -3.71
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('exitosamente');
    });

    test('Crear punto falla sin validación (zona inválida)', async () => {
      const response = await request(API_URL)
        .post('/puntos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Pizza',
          zona: 'InvalidZone',
          direccion: 'Test St',
          telefono: '+34987654321',
          lat: 40.42,
          lng: -3.71
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    test('Crear punto falla con coordenadas inválidas', async () => {
      const response = await request(API_URL)
        .post('/puntos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nombre: 'Test Pizza',
          zona: 'Zona Norte',
          direccion: 'Test St',
          telefono: '+34987654321',
          lat: 95, // Fuera de rango
          lng: -3.71
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});

describe('Rate Limiting', () => {
  
  test('Rate limit en login después de múltiples intentos', async () => {
    // Intentar login 6 veces (límite es 5)
    const attempts = [];
    for (let i = 0; i < 6; i++) {
      const response = await request(API_URL)
        .post('/puntos/login')
        .send({
          email: 'admin@pazzi.com',
          password: 'WrongPassword'
        });
      attempts.push(response.status);
    }

    // El 6to intento debería ser 429 (Too Many Requests)
    expect(attempts[5]).toBe(429);
  });
});
