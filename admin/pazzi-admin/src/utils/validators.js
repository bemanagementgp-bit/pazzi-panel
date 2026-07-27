/**
 * Validadores para el frontend
 * Proporciona feedback visual al usuario antes de enviar al backend
 */

/**
 * Validar formato de email
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar fortaleza de contraseña
 * Mínimo: 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
 */
export const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validar formato de teléfono
 * Acepta: +54 9 11 1234-5678, +54911123456, (011) 1234-5678, etc.
 */
export const isValidPhone = (phone) => {
  const regex = /^[\d\s\-\+()]*$/;
  const cleaned = phone.replace(/\D/g, '');
  return regex.test(phone) && cleaned.length >= 9 && cleaned.length <= 15;
};

/**
 * Validar nombre de punto (mínimo 3 caracteres)
 */
export const isValidName = (name) => {
  return name.trim().length >= 3 && name.trim().length <= 255;
};

/**
 * Validar dirección (mínimo 5 caracteres)
 */
export const isValidAddress = (address) => {
  return address.trim().length >= 5 && address.trim().length <= 255;
};

/**
 * Validar zona
 */
export const isValidZone = (zone) => {
  const validZones = [
    'Todas',
    'CABA',
    'Zona Norte',
    'Zona Oeste',
    'Zona Sur',
    'Costa Atlántica',
    'Mar del Plata',
    'Córdoba',
    'San Luis',
    'Bariloche',
  ];
  return validZones.includes(zone);
};

/**
 * Validar coordenadas de latitud
 */
export const isValidLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

/**
 * Validar coordenadas de longitud
 */
export const isValidLongitude = (lng) => {
  const num = parseFloat(lng);
  return !isNaN(num) && num >= -180 && num <= 180;
};

/**
 * Objeto con validadores y mensajes de error
 */
export const validators = {
  email: {
    validate: isValidEmail,
    message: 'Email inválido',
  },
  password: {
    validate: isValidPassword,
    message: 'Mínimo 8 caracteres (mayúscula, minúscula, número)',
  },
  phone: {
    validate: isValidPhone,
    message: 'Teléfono inválido (9-15 dígitos)',
  },
  name: {
    validate: isValidName,
    message: 'Nombre debe tener 3-255 caracteres',
  },
  address: {
    validate: isValidAddress,
    message: 'Dirección debe tener 5-255 caracteres',
  },
  zone: {
    validate: isValidZone,
    message: 'Zona no válida',
  },
  latitude: {
    validate: isValidLatitude,
    message: 'Latitud debe estar entre -90 y 90',
  },
  longitude: {
    validate: isValidLongitude,
    message: 'Longitud debe estar entre -180 y 180',
  },
};

/**
 * Validar formulario completo de punto de venta
 */
export const validatePuntoForm = (data) => {
  const errors = {};

  if (!isValidName(data.nombre)) {
    errors.nombre = validators.name.message;
  }

  if (!isValidZone(data.zona)) {
    errors.zona = validators.zone.message;
  }

  if (!isValidAddress(data.direccion)) {
    errors.direccion = validators.address.message;
  }

  if (!isValidLatitude(data.lat)) {
    errors.lat = validators.latitude.message;
  }

  if (!isValidLongitude(data.lng)) {
    errors.lng = validators.longitude.message;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidName,
  isValidAddress,
  isValidZone,
  isValidLatitude,
  isValidLongitude,
  validators,
  validatePuntoForm,
};
