/**
 * Almacén en memoria de JWT revocados (por `jti`).
 *
 * Limitación conocida: se pierde al reiniciar el proceso y no se comparte
 * entre instancias. Para multi-proceso/cluster reemplazar por Redis o por
 * una tabla en Turso. Es suficiente para el modelo actual (single PM2 app)
 * y respeta la expiración natural del token al hacer cleanup periódico.
 */

const revoked = new Map(); // jti -> expiresAtMs

export const revokeJti = (jti, expiresAtSeconds) => {
  if (!jti) return;
  revoked.set(jti, expiresAtSeconds * 1000);
};

export const isJtiRevoked = (jti) => {
  if (!jti) return false;
  const exp = revoked.get(jti);
  if (!exp) return false;
  if (Date.now() > exp) {
    revoked.delete(jti);
    return false;
  }
  return true;
};

// Limpieza periódica de entradas ya expiradas
setInterval(() => {
  const now = Date.now();
  for (const [jti, exp] of revoked.entries()) {
    if (now > exp) revoked.delete(jti);
  }
}, 10 * 60 * 1000).unref?.();

export default { revokeJti, isJtiRevoked };
