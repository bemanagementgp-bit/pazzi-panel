import Joi from 'joi';

/**
 * Schemas de validación para todos los endpoints
 */

export const schemas = {
  /**
   * Login validation
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Email debe ser válido',
        'any.required': 'Email es requerido',
      }),
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        'string.min': 'Contraseña debe tener al menos 8 caracteres',
        'any.required': 'Contraseña es requerida',
      }),
  }),

  /**
   * Crear/editar punto de venta
   */
  punto: Joi.object({
    nombre: Joi.string()
      .trim()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.min': 'Nombre debe tener al menos 3 caracteres',
        'string.max': 'Nombre no puede exceder 255 caracteres',
        'any.required': 'Nombre es requerido',
      }),
    zona: Joi.string()
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Zona debe tener al menos 2 caracteres',
        'string.max': 'Zona no puede exceder 100 caracteres',
        'any.required': 'Zona es requerida',
      }),
    direccion: Joi.string()
      .trim()
      .min(5)
      .max(255)
      .required()
      .messages({
        'string.min': 'Dirección debe tener al menos 5 caracteres',
        'string.max': 'Dirección no puede exceder 255 caracteres',
        'any.required': 'Dirección es requerida',
      }),
    telefono: Joi.string()
      .pattern(/^[\d\s\-\+()]*$/)
      .min(9)
      .max(20)
      .required()
      .messages({
        'string.pattern.base': 'Teléfono tiene formato inválido',
        'string.min': 'Teléfono debe tener al menos 9 caracteres',
        'any.required': 'Teléfono es requerido',
      }),
    lat: Joi.number()
      .min(-90)
      .max(90)
      .required()
      .messages({
        'number.min': 'Latitud debe estar entre -90 y 90',
        'number.max': 'Latitud debe estar entre -90 y 90',
        'any.required': 'Latitud es requerida',
      }),
    lng: Joi.number()
      .min(-180)
      .max(180)
      .required()
      .messages({
        'number.min': 'Longitud debe estar entre -180 y 180',
        'number.max': 'Longitud debe estar entre -180 y 180',
        'any.required': 'Longitud es requerida',
      }),
    horario: Joi.string()
      .trim()
      .max(100)
      .allow('')
      .messages({
        'string.max': 'Horario no puede exceder 100 caracteres',
      }),
  }),

  /**
   * Validar ID en params
   */
  id: Joi.object({
    id: Joi.number()
      .integer()
      .positive()
      .required()
      .messages({
        'number.positive': 'ID debe ser un número positivo',
        'any.required': 'ID es requerido',
      }),
  }),
};

/**
 * Middleware de validación
 * Valida req.body contra un schema y devuelve error 400 si falla
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        error: 'Validación fallida',
        details: messages,
      });
    }

    // Reemplazar req.body con valores validados y sanitizados
    req.body = value;
    next();
  };
};

/**
 * Middleware de validación para params
 */
export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message);
      return res.status(400).json({
        error: 'Validación fallida',
        details: messages,
      });
    }

    // Reemplazar req.params con valores validados
    req.params = value;
    next();
  };
};

export default {
  schemas,
  validate,
  validateParams,
};
