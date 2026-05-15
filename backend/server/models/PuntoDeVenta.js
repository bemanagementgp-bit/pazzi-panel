import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PuntoDeVenta = sequelize.define('PuntoDeVenta', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  zona: {
    type: DataTypes.ENUM(
      'Todas',
      'CABA',
      'Zona Norte',
      'Zona Oeste',
      'Zona Sur',
      'Costa Atlántica',
      'Mar del Plata',
      'Córdoba',
      'San Luis',
      'Bariloche'
    ),
    allowNull: false,
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  horario: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'aprobado', 'rechazado'),
    defaultValue: 'aprobado',
  },
}, {
  tableName: 'puntos_de_venta',
  timestamps: true,
});

export default PuntoDeVenta;
