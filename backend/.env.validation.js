/**
 * Validación de variables de entorno
 * Ejecutar al inicio de la aplicación para asegurar que todas las vars requeridas existen
 */

const requiredEnvVars = [
  'TURSO_CONNECTION_URL',
  'TURSO_AUTH_TOKEN',
  'SERVER_PORT',
  'NODE_ENV',
  'JWT_SECRET',
  'JWT_EXPIRATION',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'FRONTEND_URLS',
];

const optionalEnvVars = [
  'LOG_LEVEL',
  'LOG_DIR',
];

/**
 * Valida que todas las variables de entorno requeridas están definidas
 * @throws {Error} Si falta alguna variable requerida
 */
export const validateEnv = () => {
  const missing = [];
  
  requiredEnvVars.forEach((varName) => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `❌ Variables de entorno requeridas faltantes:\n${missing.map((v) => `   - ${v}`).join('\n')}\n\nCopia .env.example a .env y llena los valores.`
    );
  }

  // Validaciones adicionales
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('❌ JWT_SECRET debe tener al menos 32 caracteres');
  }

  if (!process.env.ADMIN_PASSWORD_HASH.startsWith('$2b$')) {
    throw new Error('❌ ADMIN_PASSWORD_HASH no es un hash bcrypt válido. Debe comenzar con $2b$');
  }

  if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'production') {
    throw new Error('❌ NODE_ENV debe ser "development" o "production"');
  }

  const expiration = parseInt(process.env.JWT_EXPIRATION);
  if (isNaN(expiration) || expiration <= 0) {
    throw new Error('❌ JWT_EXPIRATION debe ser un número positivo (horas)');
  }

  console.log('✅ Todas las variables de entorno son válidas');
};

export default validateEnv;
