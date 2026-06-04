import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter para login.
 * Máximo 5 intentos FALLIDOS en 15 minutos por IP.
 *
 * NOTA IMPORTANTE: `skipSuccessfulRequests` se evalúa DESPUÉS del handler
 * (cuando `res.statusCode` ya fue seteado). La versión anterior usaba
 * `skip: (req,res) => res.statusCode === 200`, pero `skip()` corre ANTES del
 * handler, cuando el statusCode todavía es 200 por default → saltaba TODAS
 * las requests y dejaba el endpoint sin protección efectiva contra fuerza
 * bruta. No volver a esa forma.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: 'Demasiados intentos de login. Intenta nuevamente en unos minutos.',
    });
  },
});

/**
 * Rate Limiter general para toda la API. Se monta a nivel app.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({ error: 'Demasiadas requests. Intenta nuevamente más tarde.' });
  },
});

/**
 * Rate Limiter más estricto para mutaciones (POST/PUT/DELETE).
 */
export const createUpdateDeleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => !['POST', 'PUT', 'DELETE'].includes(req.method),
  handler: (req, res) => {
    res.status(429).json({ error: 'Demasiadas operaciones. Intenta nuevamente más tarde.' });
  },
});

export default {
  loginLimiter,
  apiLimiter,
  createUpdateDeleteLimiter,
};
