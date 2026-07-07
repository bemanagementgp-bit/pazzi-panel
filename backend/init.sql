-- Crear tabla puntos_de_venta
CREATE TABLE IF NOT EXISTS puntos_de_venta (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  zona VARCHAR(50) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  horario VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'aprobado',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  usuario VARCHAR(255) NOT NULL,
  recurso VARCHAR(100) NOT NULL,
  recurso_id INTEGER,
  cambios TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos iniciales desde data/puntos-de-venta.json
INSERT INTO puntos_de_venta (nombre, zona, direccion, telefono, lat, lng, horario, estado)
VALUES 
  ('Pazzi Buns - Sede Central', 'CABA', 'Av. Corrientes 1234, CABA', '+54 11 1234-5678', -34.603722, -58.381592, '09:00 - 22:00', 'aprobado'),
  ('Pazzi Buns - San Isidro', 'Zona Norte', 'Calle 9 de Julio 456, San Isidro', '+54 11 2345-6789', -34.476671, -58.507669, '10:00 - 21:00', 'aprobado'),
  ('Pazzi Buns - La Matanza', 'Zona Oeste', 'Calle Mitre 789, La Matanza', '+54 11 3456-7890', -34.754194, -58.625278, '09:30 - 20:30', 'aprobado'),
  ('Pazzi Buns - Avellaneda', 'Zona Sur', 'Av. Vélez Sársfield 101, Avellaneda', '+54 11 4567-8901', -34.662663, -58.363611, '08:00 - 21:00', 'aprobado'),
  ('Pazzi Buns - Mar del Plata', 'Mar del Plata', 'Av. Constitución 202, Mar del Plata', '+54 223 456-7890', -38.000000, -57.557667, '10:00 - 22:00', 'aprobado'),
  ('Pazzi Buns - Córdoba', 'Córdoba', 'Calle Rivadavia 303, Córdoba', '+54 351 567-8901', -31.420000, -64.188889, '09:00 - 21:00', 'aprobado')
ON CONFLICT DO NOTHING;
