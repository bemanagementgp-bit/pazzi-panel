import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔗 Conectando a Turso...');
console.log('URL:', process.env.TURSO_CONNECTION_URL);

const db = createClient({
  url: process.env.TURSO_CONNECTION_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
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


