import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import db from '../config/database.js';
import verifyToken, { verifyAdmin } from '../middleware/auth.js';
import { verifyPassword } from '../utils/auth.js';
import { validate, validateParams, schemas } from '../middleware/validation.js';
import { loginLimiter, createUpdateDeleteLimiter } from '../middleware/rateLimiters.js';
import logger, { auditLog, securityLog } from '../utils/logger.js';

dotenv.config();
const router = express.Router();

// ============ LOGIN ============
router.post('/login', loginLimiter, validate(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Determinar qué rol corresponde al email
    let role = null;
    if (email === process.env.ADMIN_EMAIL) {
      role = 'admin';
    } else if (email === process.env.VENDEDOR_EMAIL) {
      role = 'vendedor';
    } else {
      securityLog('Failed login attempt', { email, reason: 'email_mismatch' });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña según el rol
    let isValidPassword = false;
    const isDev = process.env.NODE_ENV === 'development';

    if (role === 'admin') {
      if (isDev && process.env.ADMIN_PASSWORD_PLAIN) {
        isValidPassword = password === process.env.ADMIN_PASSWORD_PLAIN;
        if (isValidPassword) logger.warn('⚠️  Login con ADMIN_PASSWORD_PLAIN (modo desarrollo).');
      } else {
        isValidPassword = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH);
      }
    } else if (role === 'vendedor') {
      if (isDev && process.env.VENDEDOR_PASSWORD_PLAIN) {
        isValidPassword = password === process.env.VENDEDOR_PASSWORD_PLAIN;
      } else {
        isValidPassword = await verifyPassword(password, process.env.VENDEDOR_PASSWORD_HASH);
      }
    }

    if (!isValidPassword) {
      securityLog('Failed login attempt', { email, reason: 'invalid_password' });
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar JWT con expiración desde .env
    const expirationHours = process.env.JWT_EXPIRATION || 2;
    const token = jwt.sign(
      { email, role },
      process.env.JWT_SECRET,
      { expiresIn: `${expirationHours}h` }
    );

    auditLog('Login', email, role, null, { success: true });
    logger.info('Successful login', { email, role });

    return res.json({
      message: 'Login exitoso',
      token,
      admin: { email, role },
    });
  } catch (error) {
    logger.error('Error en login', { error: error.message });
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ============ GET ALL PUNTOS (público) ============
router.get('/', async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM puntos_de_venta WHERE estado = ?',
      args: ['aprobado']
    });
    const puntos = result.rows.map(row => ({
      id: row.id,
      nombre: row.nombre,
      zona: row.zona,
      direccion: row.direccion,
      telefono: row.telefono,
      lat: row.lat,
      lng: row.lng,
      horario: row.horario,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
    res.json(puntos);
  } catch (error) {
    console.error('Error al obtener puntos:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ GET ONE PUNTO (público) ============
router.get('/:id', validateParams(schemas.id), async (req, res) => {
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM puntos_de_venta WHERE id = ?',
      args: [req.params.id]
    });
    
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }
    
    const row = result.rows[0];
    const punto = {
      id: row.id,
      nombre: row.nombre,
      zona: row.zona,
      direccion: row.direccion,
      telefono: row.telefono,
      lat: row.lat,
      lng: row.lng,
      horario: row.horario,
      estado: row.estado,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
    res.json(punto);
  } catch (error) {
    console.error('Error al obtener punto:', error);
    res.status(500).json({ error: 'Error al obtener datos' });
  }
});

// ============ CREATE PUNTO (solo admin) ============
router.post('/', verifyToken, createUpdateDeleteLimiter, validate(schemas.punto), async (req, res) => {
  try {
    const { nombre, zona, direccion, telefono, lat, lng, horario } = req.body;

    logger.info('Creating punto with data', { nombre, zona, direccion, telefono, lat, lng });

    // Use direct SQL with string literals to avoid parameter binding issues
    const query = `
      INSERT INTO puntos_de_venta (nombre, zona, direccion, telefono, lat, lng, horario, estado)
      VALUES (
        '${nombre.replace(/'/g, "''")}',
        '${zona.replace(/'/g, "''")}',
        '${direccion.replace(/'/g, "''")}',
        '${telefono.replace(/'/g, "''")}',
        ${lat},
        ${lng},
        '${(horario || '').replace(/'/g, "''")}',
        'aprobado'
      )
    `;

    const result = await db.execute(query);

    // Registrar en auditoría
    auditLog('CREATE', req.user?.email || 'unknown', 'punto_de_venta', null, {
      nombre,
      zona,
      direccion,
      telefono,
    });

    logger.info('Punto creado', { nombre, zona });

    res.status(201).json({
      message: 'Punto de venta creado exitosamente',
    });
  } catch (error) {
    logger.error('Error al crear punto', { error: error.message });
    res.status(500).json({ error: 'Error al crear punto' });
  }
});

// ============ UPDATE PUNTO (solo admin) ============
router.put('/:id', verifyAdmin, createUpdateDeleteLimiter, validateParams(schemas.id), validate(schemas.punto), async (req, res) => {
  try {
    const { nombre, zona, direccion, telefono, lat, lng, horario } = req.body;
    const { id } = req.params;

    logger.info('Updating punto', { id, nombre, zona });

    // First, fetch the current data using string literal
    const selectQuery = `SELECT * FROM puntos_de_venta WHERE id = ${id}`;
    const selectResult = await db.execute(selectQuery);

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
    
    // Use direct SQL with string literals
    const query = `
      UPDATE puntos_de_venta 
      SET 
        nombre = '${(nombre || row.nombre).replace(/'/g, "''")}',
        zona = '${(zona || row.zona).replace(/'/g, "''")}',
        direccion = '${(direccion || row.direccion).replace(/'/g, "''")}',
        telefono = '${(telefono || row.telefono).replace(/'/g, "''")}',
        lat = ${lat !== undefined ? lat : row.lat},
        lng = ${lng !== undefined ? lng : row.lng},
        horario = '${(horario || row.horario || '').replace(/'/g, "''")}',
        estado = 'aprobado',
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    await db.execute(query);

    // Registrar cambios en auditoría
    const changes = {};
    if (nombre && nombre !== oldData.nombre) changes.nombre = { old: oldData.nombre, new: nombre };
    if (zona && zona !== oldData.zona) changes.zona = { old: oldData.zona, new: zona };
    if (direccion && direccion !== oldData.direccion) changes.direccion = { old: oldData.direccion, new: direccion };
    if (telefono && telefono !== oldData.telefono) changes.telefono = { old: oldData.telefono, new: telefono };

    auditLog('UPDATE', req.user?.email || 'unknown', 'punto_de_venta', id, changes);
    logger.info('Punto actualizado', { id, nombre });

    res.json({
      message: 'Punto actualizado exitosamente',
    });
  } catch (error) {
    logger.error('Error al actualizar punto', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Error al actualizar punto' });
  }
});

// ============ DELETE PUNTO (solo admin) ============
router.delete('/:id', verifyAdmin, createUpdateDeleteLimiter, validateParams(schemas.id), async (req, res) => {
  try {
    const { id } = req.params;

    logger.info('Deleting punto', { id });

    const selectQuery = `SELECT * FROM puntos_de_venta WHERE id = ${id}`;
    const selectResult = await db.execute(selectQuery);

    if (!selectResult.rows.length) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }

    const row = selectResult.rows[0];
    const nombre = row.nombre;

    const query = `DELETE FROM puntos_de_venta WHERE id = ${id}`;
    await db.execute(query);

    // Registrar eliminación en auditoría
    auditLog('DELETE', req.user?.email || 'unknown', 'punto_de_venta', id, {
      nombre,
      zona: row.zona,
    });

    logger.info('Punto eliminado', { id, nombre });

    res.json({ message: 'Punto eliminado exitosamente' });
  } catch (error) {
    logger.error('Error al eliminar punto', { error: error.message, id: req.params.id });
    res.status(500).json({ error: 'Error al eliminar punto' });
  }
});

export default router;
