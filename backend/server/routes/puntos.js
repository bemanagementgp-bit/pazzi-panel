import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import db from '../config/database.js';
import verifyToken, { verifyAdmin, extractToken } from '../middleware/auth.js';
import { verifyPassword } from '../utils/auth.js';
import { validate, validateParams, schemas } from '../middleware/validation.js';
import { loginLimiter, createUpdateDeleteLimiter } from '../middleware/rateLimiters.js';
import { revokeJti } from '../utils/tokenStore.js';
import logger, { auditLog, securityLog } from '../utils/logger.js';

dotenv.config();
const router = express.Router();

const envValue = (key) => process.env[key]?.trim();
const normalizeEmail = (value) => value?.trim().toLowerCase();
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * Comparación constant-time de strings para evitar timing attacks
 * en la rama de contraseñas en texto plano (modo dev).
 */
const timingSafeEqualStr = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
};

/**
 * Política de cookie de sesión.
 *  - httpOnly: inaccesible desde JS → mitiga robo por XSS.
 *  - secure:   solo HTTPS en producción.
 *  - sameSite=strict: bloquea envío en navegaciones cross-site.
 */
const sessionCookieOptions = (maxAgeMs) => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: 'strict',
  maxAge: maxAgeMs,
  path: '/',
});

// ============ LOGIN ============
router.post('/login', loginLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestedEmail = normalizeEmail(email);

    let role = null;
    let accountEmail = null;
    if (requestedEmail === normalizeEmail(envValue('ADMIN_EMAIL'))) {
      role = 'admin';
      accountEmail = envValue('ADMIN_EMAIL');
    } else if (requestedEmail === normalizeEmail(envValue('VENDEDOR_EMAIL'))) {
      role = 'vendedor';
      accountEmail = envValue('VENDEDOR_EMAIL');
    } else {
      securityLog('Failed login attempt', { email, reason: 'email_mismatch' });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificación de contraseña.
    // La rama "plain" solo se habilita si NODE_ENV !== production Y
    // ALLOW_PLAIN_PASSWORDS=true está explícito. Comparación constant-time.
    let isValidPassword = false;
    const plainAllowed = !IS_PRODUCTION && envValue('ALLOW_PLAIN_PASSWORDS') === 'true';

    if (role === 'admin') {
      if (plainAllowed && envValue('ADMIN_PASSWORD_PLAIN')) {
        isValidPassword = timingSafeEqualStr(password, envValue('ADMIN_PASSWORD_PLAIN'));
        if (isValidPassword) logger.warn('⚠️  Login con ADMIN_PASSWORD_PLAIN (modo desarrollo).');
      } else {
        isValidPassword = await verifyPassword(password, envValue('ADMIN_PASSWORD_HASH'));
      }
    } else if (role === 'vendedor') {
      if (plainAllowed && envValue('VENDEDOR_PASSWORD_PLAIN')) {
        isValidPassword = timingSafeEqualStr(password, envValue('VENDEDOR_PASSWORD_PLAIN'));
      } else {
        isValidPassword = await verifyPassword(password, envValue('VENDEDOR_PASSWORD_HASH'));
      }
    }

    if (!isValidPassword) {
      securityLog('Failed login attempt', { email, reason: 'invalid_password' });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // JWT con `jti` para poder revocarlo en /logout.
    const expirationHours = parseInt(process.env.JWT_EXPIRATION || '2', 10);
    const jti = crypto.randomBytes(16).toString('hex');
    const token = jwt.sign(
      { email: accountEmail, role, jti },
      process.env.JWT_SECRET,
      { expiresIn: `${expirationHours}h` }
    );

    const maxAgeMs = expirationHours * 60 * 60 * 1000;
    res.cookie('pazzi_session', token, sessionCookieOptions(maxAgeMs));

    auditLog('Login', accountEmail, role, null, { success: true });
    logger.info('Successful login', { email: accountEmail, role });

    // Se mantiene `token` en el body por compatibilidad con clientes
    // existentes; la cookie httpOnly de arriba es el camino preferido.
    return res.json({
      message: 'Login exitoso',
      token,
      admin: { email: accountEmail, role },
    });
  } catch (error) {
    logger.error('Error en login', { error: error.message });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============ LOGOUT ============
router.post('/logout', (req, res) => {
  try {
    const token = extractToken(req);
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded?.jti && decoded?.exp) {
          revokeJti(decoded.jti, decoded.exp);
          auditLog('Logout', decoded.email, decoded.role, null, {});
        }
      } catch { /* token inválido/expirado: igual limpiamos la cookie */ }
    }
    res.clearCookie('pazzi_session', { path: '/' });
    res.json({ message: 'Logout exitoso' });
  } catch (error) {
    logger.error('Error en logout', { error: error.message });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============ GET ALL PUNTOS (público) ============
router.get('/', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM puntos_de_venta WHERE estado = ?',
      args: ['aprobado'],
    });
    const puntos = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      zona: row.zona,
      direccion: row.direccion,
      telefono: row.telefono,
      lat: row.lat,
      lng: row.lng,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
    res.json(puntos);
  } catch (error) {
    logger.error('Error al obtener puntos', { error: error.message });
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ GET PENDIENTES (vendedor) — solo SUS propias solicitudes ============
router.get('/vendedor/pendientes', verifyToken, async (req, res) => {
  try {
    // Autorización a nivel de objeto (BOLA): vendedor solo ve lo suyo.
    const isAdmin = req.user?.role === 'admin';
    const result = isAdmin
      ? await db.execute({
          sql: "SELECT * FROM puntos_de_venta WHERE estado = 'pendiente' ORDER BY createdAt DESC",
          args: [],
        })
      : await db.execute({
          sql: "SELECT * FROM puntos_de_venta WHERE estado = 'pendiente' AND createdBy = ? ORDER BY createdAt DESC",
          args: [req.user?.email || ''],
        });

    const puntos = result.rows.map(row => ({
      id: row.id, nombre: row.nombre, zona: row.zona, direccion: row.direccion,
      telefono: row.telefono, lat: row.lat, lng: row.lng,
      estado: row.estado, createdAt: row.createdAt, updatedAt: row.updatedAt,
    }));
    res.json(puntos);
  } catch (error) {
    logger.error('Error al obtener pendientes', { error: error.message });
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ GET ALL (admin) — todos los estados ============
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM puntos_de_venta ORDER BY createdAt DESC',
      args: [],
    });
    const puntos = result.rows.map(row => ({
      id: row.id, nombre: row.nombre, zona: row.zona, direccion: row.direccion,
      telefono: row.telefono, lat: row.lat, lng: row.lng,
      estado: row.estado, createdAt: row.createdAt, updatedAt: row.updatedAt,
    }));
    res.json(puntos);
  } catch (error) {
    logger.error('Error al obtener todos los puntos', { error: error.message });
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ PATCH ESTADO (solo admin) ============
router.patch(
  '/:id/estado',
  verifyAdmin,
  validateParams(schemas.id),
  validate(schemas.estado),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      const check = await db.execute({
        sql: 'SELECT id, nombre FROM puntos_de_venta WHERE id = ?',
        args: [id],
      });
      if (!check.rows.length) return res.status(404).json({ error: 'Punto no encontrado' });

      await db.execute({
        sql: 'UPDATE puntos_de_venta SET estado = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        args: [estado, id],
      });

      auditLog('ESTADO', req.user?.email || 'unknown', 'punto_de_venta', id, {
        estado,
        nombre: check.rows[0].nombre,
      });
      logger.info('Estado actualizado', { id, estado });
      res.json({ message: 'Estado actualizado' });
    } catch (error) {
      logger.error('Error al actualizar estado', { error: error.message });
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  }
);

// ============ GET ONE PUNTO (público) ============
router.get('/:id', validateParams(schemas.id), async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM puntos_de_venta WHERE id = ?',
      args: [req.params.id],
    });

    if (!result.rows.length) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      nombre: row.nombre,
      zona: row.zona,
      direccion: row.direccion,
      telefono: row.telefono,
      lat: row.lat,
      lng: row.lng,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  } catch (error) {
    logger.error('Error al obtener punto', { error: error.message });
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ CREATE PUNTO (autenticado) ============
router.post(
  '/',
  verifyToken,
  createUpdateDeleteLimiter,
  validate(schemas.punto),
  async (req, res) => {
    try {
      const { nombre, zona, direccion, telefono, lat, lng } = req.body;
      const estadoInicial = req.user?.role === 'admin' ? 'aprobado' : 'pendiente';
      const createdBy = req.user?.email || null;

      const result = await db.execute({
        sql: `INSERT INTO puntos_de_venta
                (nombre, zona, direccion, telefono, lat, lng, estado, createdBy)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          nombre,
          zona,
          direccion,
          telefono,
          lat == null || Number.isNaN(lat) ? null : lat,
          lng == null || Number.isNaN(lng) ? null : lng,
          estadoInicial,
          createdBy,
        ],
      });

      auditLog('CREATE', createdBy || 'unknown', 'punto_de_venta', null, {
        nombre, zona, direccion, telefono,
      });
      logger.info('Punto creado', { nombre, zona, createdBy });

      res.status(201).json({
        message: 'Punto de venta creado exitosamente',
        id: result.lastInsertRowid?.toString?.() ?? null,
      });
    } catch (error) {
      logger.error('Error al crear punto', { error: error.message });
      res.status(500).json({ error: 'Error al crear punto' });
    }
  }
);

// ============ UPDATE PUNTO (solo admin) ============
router.put(
  '/:id',
  verifyAdmin,
  createUpdateDeleteLimiter,
  validateParams(schemas.id),
  validate(schemas.punto),
  async (req, res) => {
    try {
      const { nombre, zona, direccion, telefono, lat, lng } = req.body;
      const { id } = req.params;

      const selectResult = await db.execute({
        sql: 'SELECT * FROM puntos_de_venta WHERE id = ?',
        args: [id],
      });
      if (!selectResult.rows.length) {
        return res.status(404).json({ error: 'Punto no encontrado' });
      }

      const row = selectResult.rows[0];
      const oldData = {
        nombre: row.nombre,
        zona: row.zona,
        direccion: row.direccion,
        telefono: row.telefono,
      };

      const newNombre    = nombre    ?? row.nombre;
      const newZona      = zona      ?? row.zona;
      const newDireccion = direccion ?? row.direccion;
      const newTelefono  = telefono  ?? row.telefono;
      const newLat       = lat !== undefined ? lat : row.lat;
      const newLng       = lng !== undefined ? lng : row.lng;

      await db.execute({
        sql: `UPDATE puntos_de_venta
                 SET nombre = ?, zona = ?, direccion = ?, telefono = ?,
                     lat = ?, lng = ?, estado = 'aprobado',
                     updatedAt = CURRENT_TIMESTAMP
               WHERE id = ?`,
        args: [newNombre, newZona, newDireccion, newTelefono, newLat, newLng, id],
      });

      const changes = {};
      if (nombre    && nombre    !== oldData.nombre)    changes.nombre    = { old: oldData.nombre, new: nombre };
      if (zona      && zona      !== oldData.zona)      changes.zona      = { old: oldData.zona, new: zona };
      if (direccion && direccion !== oldData.direccion) changes.direccion = { old: oldData.direccion, new: direccion };
      if (telefono  && telefono  !== oldData.telefono)  changes.telefono  = { old: oldData.telefono, new: telefono };

      auditLog('UPDATE', req.user?.email || 'unknown', 'punto_de_venta', id, changes);
      logger.info('Punto actualizado', { id, nombre: newNombre });

      res.json({ message: 'Punto actualizado exitosamente' });
    } catch (error) {
      logger.error('Error al actualizar punto', { error: error.message, id: req.params.id });
      res.status(500).json({ error: 'Error al actualizar punto' });
    }
  }
);

// ============ DELETE PUNTO (solo admin) ============
router.delete(
  '/:id',
  verifyAdmin,
  createUpdateDeleteLimiter,
  validateParams(schemas.id),
  async (req, res) => {
    try {
      const { id } = req.params;

      const selectResult = await db.execute({
        sql: 'SELECT * FROM puntos_de_venta WHERE id = ?',
        args: [id],
      });
      if (!selectResult.rows.length) {
        return res.status(404).json({ error: 'Punto no encontrado' });
      }

      const row = selectResult.rows[0];
      await db.execute({
        sql: 'DELETE FROM puntos_de_venta WHERE id = ?',
        args: [id],
      });

      auditLog('DELETE', req.user?.email || 'unknown', 'punto_de_venta', id, {
        nombre: row.nombre,
        zona: row.zona,
      });
      logger.info('Punto eliminado', { id, nombre: row.nombre });

      res.json({ message: 'Punto eliminado exitosamente' });
    } catch (error) {
      logger.error('Error al eliminar punto', { error: error.message, id: req.params.id });
      res.status(500).json({ error: 'Error al eliminar punto' });
    }
  }
);

export default router;
