import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔗 Conectando a Turso...');

const tursoConnectionUrl = process.env.TURSO_CONNECTION_URL?.trim();
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN?.trim();

if (!tursoConnectionUrl || !tursoConnectionUrl.startsWith('libsql://')) {
  throw new Error('TURSO_CONNECTION_URL inválida. En Render debe empezar con libsql://');
}

if (!tursoAuthToken) {
  throw new Error('TURSO_AUTH_TOKEN faltante. Configura el token real de Turso en Render.');
}

console.log('URL:', tursoConnectionUrl.replace(/^(libsql:\/\/[^.]+).*/, '$1...'));

const db = createClient({
  url: tursoConnectionUrl,
  authToken: tursoAuthToken,
});

// Inicializar tabla
export const initDB = async () => {
  try {
    // Primero, intenta crear la tabla
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS puntos_de_venta (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        zona TEXT NOT NULL,
        direccion TEXT NOT NULL,
        telefono TEXT NOT NULL,
        lat REAL NOT NULL,
        lng REAL NOT NULL,
        horario TEXT,
        estado TEXT DEFAULT 'aprobado',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await db.execute(createTableSQL);
    console.log('✅ Tabla "puntos_de_venta" lista');

    // Migración idempotente: agregar columna `createdBy` si no existe.
    // SQLite no soporta `ADD COLUMN IF NOT EXISTS`, así que detectamos vía PRAGMA.
    try {
      const cols = await db.execute("PRAGMA table_info(puntos_de_venta)");
      const hasCreatedBy = cols.rows.some(r => r.name === 'createdBy' || r[1] === 'createdBy');
      if (!hasCreatedBy) {
        await db.execute("ALTER TABLE puntos_de_venta ADD COLUMN createdBy TEXT");
        console.log('✅ Columna "createdBy" agregada');
      }
    } catch (e) {
      console.warn('⚠️  No se pudo verificar/agregar columna createdBy:', e.message);
    }

    // Insertar datos iniciales si la tabla está vacía
    const countResult = await db.execute('SELECT COUNT(*) as count FROM puntos_de_venta');
    const count = countResult.rows[0]?.[0] || 0;
    
    if (count === 0) {
      console.log('📝 Insertando datos iniciales...');
      await db.execute(`
        INSERT INTO puntos_de_venta (nombre, zona, direccion, telefono, lat, lng, horario, estado)
        VALUES 
          ('Pazzi Buns - Sede Central', 'CABA', 'Av. Corrientes 1234, CABA', '+54 11 1234-5678', -34.603722, -58.381592, '09:00 - 22:00', 'aprobado'),
          ('Pazzi Buns - San Isidro', 'Zona Norte', 'Calle 9 de Julio 456, San Isidro', '+54 11 2345-6789', -34.476671, -58.507669, '10:00 - 21:00', 'aprobado'),
          ('Pazzi Buns - La Matanza', 'Zona Oeste', 'Calle Mitre 789, La Matanza', '+54 11 3456-7890', -34.754194, -58.625278, '09:30 - 20:30', 'aprobado'),
          ('Pazzi Buns - Avellaneda', 'Zona Sur', 'Av. Vélez Sársfield 101, Avellaneda', '+54 11 4567-8901', -34.662663, -58.363611, '08:00 - 21:00', 'aprobado'),
          ('Pazzi Buns - Mar del Plata', 'Mar del Plata', 'Av. Constitución 202, Mar del Plata', '+54 223 456-7890', -38.000000, -57.557667, '10:00 - 22:00', 'aprobado'),
          ('Pazzi Buns - Córdoba', 'Córdoba', 'Calle Rivadavia 303, Córdoba', '+54 351 567-8901', -31.420000, -64.188889, '09:00 - 21:00', 'aprobado')
      `);
      console.log('✅ Datos iniciales insertados');
    }
    
  } catch (error) {
    console.error('❌ Error en BD:', error.message);
    throw error;
  }
};

export default db;


