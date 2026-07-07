import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter para login
 * Máximo 5 intentos en 15 minutos
 * Exponential backoff: 1s → 5s → 15s
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos máximo
  message: 'Demasiados intentos fallidos. Intenta nuevamente en unos minutos.',
  standardHeaders: true, // Retorna info en `RateLimit-*` headers
  legacyHeaders: false, // Desabilita `X-RateLimit-*` headers
  skip: (req, res) => {
    // No contar intentos exitosos (no limitar si el login fue exitoso)
    return res.statusCode === 200;
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de login. Intenta más tarde.',
    });
  },
});

/**
 * Rate Limiter general para API
 * Máximo 100 requests por 15 minutos
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  message: 'Demasiadas requests. Intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter para POST/PUT/DELETE
 * Más estricto que GET
 */
export const createUpdateDeleteLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 30, // 30 requests por minuto
  message: 'Demasiadas operaciones. Intenta nuevamente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  // Solo contar POST, PUT, DELETE
  skip: (req) => !['POST', 'PUT', 'DELETE'].includes(req.method),
});

export default {
  loginLimiter,
  apiLimiter,
  createUpdateDeleteLimiter,
};
