import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import db, { initDB } from './config/database.js';
import puntosRoutes from './routes/puntos.js';
import validateEnv from './.env.validation.js';
import logger, { loggerMiddleware } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimiters.js';

dotenv.config();

// Validar variables de entorno antes de hacer nada
try {
  validateEnv();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';

// Necesario detrás de nginx/PM2 para que `req.ip` venga del X-Forwarded-For
// real y para que la cookie `Secure` funcione cuando el TLS termina en nginx.
app.set('trust proxy', 1);

// ============ SECURITY HEADERS ============
// Helmet configura headers de seguridad HTTP automáticamente
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true,
  },
}));

// ============ CORS ============
// En producción, usar solo los dominios permitidos desde .env
const allowedOrigins = process.env.FRONTEND_URLS
  ? process.env.FRONTEND_URLS.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:8080', 'http://127.0.0.1:8080'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600, // Cachear CORS preflight por 1 hora
}));

// ============ BODY PARSER ============
// Límite acotado: el endpoint más pesado recibe un JSON pequeño (un punto de venta).
// Esto reduce superficie de DoS por payloads gigantes.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ============ LOGGING ============
app.use(loggerMiddleware);

// ============ RATE LIMIT GLOBAL ============
app.use('/api/', apiLimiter);

// Inicializar BD
const startServer = async () => {
  try {
    await initDB();
    logger.info('Base de datos conectada');
  } catch (error) {
    logger.error('No se pudo conectar a BD', { error: error.message });
    logger.info('Verifica tus credenciales en server/.env');
  }

  // RUTA RAÍZ - Documentación
  app.get('/', (req, res) => {
    res.json({
      name: '🍞 PAZZI BUNS - API SERVER',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        public: [
          { method: 'GET', path: '/api/puntos', description: 'Listar todos los puntos de venta' },
          { method: 'GET', path: '/api/puntos/:id', description: 'Obtener un punto específico' },
          { method: 'GET', path: '/health', description: 'Health check' }
        ],
        admin: [
          { method: 'POST', path: '/api/puntos/login', description: 'Login admin (email, password)' },
          { method: 'POST', path: '/api/puntos', description: 'Crear punto (requiere JWT)' },
          { method: 'PUT', path: '/api/puntos/:id', description: 'Editar punto (requiere JWT)' },
          { method: 'DELETE', path: '/api/puntos/:id', description: 'Eliminar punto (requiere JWT)' }
        ]
      },
      docs: 'http://localhost:3000/api/docs',
      admin_panel: 'http://localhost:5174',
      web: 'http://localhost:5173'
    });
  });

  // Rutas de API
  app.use('/api/puntos', puntosRoutes);

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'Server running ✅', timestamp: new Date() });
  });

  // Documentación API
  app.get('/api/docs', (req, res) => {
    res.json({
      title: 'PAZZI BUNS API Documentation',
      baseUrl: 'http://localhost:3000/api',
      public_endpoints: [
        {
          method: 'GET',
          path: '/puntos',
          description: 'Obtener todos los puntos de venta aprobados',
          response: [
            {
              id: 1,
              nombre: 'Pazzi Buns - Sede Central',
              zona: 'CABA',
              direccion: 'Av. Corrientes 1234',
              lat: -34.603722,
              lng: -58.381592,
              horario: '09:00 - 22:00',
              estado: 'aprobado'
            }
          ]
        }
      ],
      admin_endpoints: [
        {
          method: 'POST',
          path: '/puntos/login',
          description: 'Autenticar como admin',
          body: { email: 'admin@pazzi.com', password: 'Pazzi2024!' },
          response: { token: 'eyJhbGc...', admin: { email: 'admin@pazzi.com', role: 'admin' } }
        },
        {
          method: 'POST',
          path: '/puntos',
          description: 'Crear nuevo punto (Header: Authorization: Bearer TOKEN)',
          body: {
            nombre: 'Pazzi Buns - Nueva Sucursal',
            zona: 'CABA',
            direccion: 'Calle Nueva 123',
            lat: -34.603722,
            lng: -58.381592,
            horario: '10:00 - 22:00'
          }
        }
      ]
    });
  });

  // Error handler global.
  // En producción nunca filtra el `err.message` interno (puede contener
  // nombres de tablas, drivers, paths o variables de entorno).
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    const status = err.status || 500;
    logger.error('Unhandled error', {
      error: err.message,
      stack: IS_PRODUCTION ? undefined : err.stack,
      path: req.path,
      method: req.method,
    });
    const safeMessage = !IS_PRODUCTION
      ? (err.message || 'Error interno del servidor')
      : (status < 500 && err.expose ? err.message : 'Error interno del servidor');
    res.status(status).json({ error: safeMessage });
  });

  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║  🍞 PAZZI BUNS - API SERVER            ║
║  Server running on port ${PORT}          ║
║  Database: Turso SQL                   ║
║  Environment: ${process.env.NODE_ENV}        ║
╚════════════════════════════════════════╝

📡 API: http://localhost:3000
📚 Docs: http://localhost:3000/api/docs
🏥 Health: http://localhost:3000/health
    `);
  });
};

startServer();

export default app;

