import winston from 'winston';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, '../logs');

// Crear directorio de logs si no existe
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Logger con Winston - Usa archivo + console en desarrollo
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      // Sanitizar para no incluir datos sensibles
      const safeMeta = { ...meta };
      if (safeMeta.password) delete safeMeta.password;
      if (safeMeta.token) delete safeMeta.token;
      if (safeMeta.authToken) delete safeMeta.authToken;

      const metaString = Object.keys(safeMeta).length > 0 ? JSON.stringify(safeMeta) : '';
      return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaString}`;
    })
  ),
  defaultMeta: { service: 'pazzi-api' },
  transports: [
    // Archivo de errores
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Archivo combinado
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// En desarrollo, agregar console transport
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const safeMeta = { ...meta };
          if (safeMeta.password) delete safeMeta.password;
          if (safeMeta.token) delete safeMeta.token;
          const metaString = Object.keys(safeMeta).length > 0 ? JSON.stringify(safeMeta) : '';
          return `${level}: ${message} ${metaString}`;
        })
      ),
    })
  );
}

/**
 * Middleware para loguear requests HTTP
 */
export const loggerMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'info';
    
    logger[level](`${req.method} ${req.path}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    });
  });

  next();
};

/**
 * Loguear operaciones de auditoría (creación, edición, eliminación)
 */
export const auditLog = (action, user, resource, resourceId, details = {}) => {
  logger.info(`Audit: ${action}`, {
    action,
    user,
    resource,
    resourceId,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

/**
 * Loguear errores de seguridad
 */
export const securityLog = (event, details = {}) => {
  logger.warn(`Security: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

export default logger;
