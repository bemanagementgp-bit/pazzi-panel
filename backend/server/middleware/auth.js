import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { isJtiRevoked } from '../utils/tokenStore.js';

dotenv.config();

/**
 * Parser de cookies mínimo — evita agregar la dependencia `cookie-parser`.
 */
const parseCookies = (header = '') => {
  const out = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) {
      try { out[k] = decodeURIComponent(v); } catch { out[k] = v; }
    }
  }
  return out;
};

/**
 * Extrae el JWT desde la cookie httpOnly `pazzi_session` (preferido)
 * o desde el header `Authorization: Bearer ...` (compatibilidad).
 */
export const extractToken = (req) => {
  const cookies = parseCookies(req.headers?.cookie || '');
  if (cookies.pazzi_session) return cookies.pazzi_session;
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
};

const verify = (token) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded?.jti && isJtiRevoked(decoded.jti)) {
    const err = new Error('Token revocado');
    err.code = 'REVOKED';
    throw err;
  }
  return decoded;
};

export const verifyToken = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = verify(token);
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

// Solo permite acceso a usuarios con rol 'admin'
export const verifyAdmin = (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ error: 'Token no proporcionado' });

  try {
    const decoded = verify(token);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado: se requiere rol admin' });
    }
    req.admin = decoded;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
};

export default verifyToken;
