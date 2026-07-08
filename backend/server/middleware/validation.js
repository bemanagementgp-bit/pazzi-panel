import Joi from 'joi';
import { normalizeArgPhone } from '../utils/phone.js';

/**
 * Schemas de validación para todos los endpoints.
 *
 * Estrategia de defensa en profundidad:
 *  - Se prohíben caracteres `<` y `>` para mitigar XSS (aunque React escapa).
 *  - Se prohíben caracteres de control y `\r\n\t` para que el dato no rompa
 *    logs ni archivos exportados.
 *  - Se prohíben los prefijos de fórmula de hojas de cálculo
 *    (`= + - @ TAB CR`) en el primer carácter para evitar CSV/XLS Injection
 *    cuando un admin descargue la plantilla con datos creados por terceros.
 */

// Cualquier carácter de control ASCII excepto el espacio normal.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B-\u001F\u007F]/;
const FORMULA_PREFIX = /^[=+\-@\t\r]/;
const HTML_BRACKETS = /[<>]/;

const safeText = (label) => Joi.string()
  .custom((value, helpers) => {
    if (CONTROL_CHARS.test(value)) return helpers.error('string.controlChars');
    if (HTML_BRACKETS.test(value)) return helpers.error('string.htmlBrackets');
    if (FORMULA_PREFIX.test(value)) return helpers.error('string.formulaPrefix');
    return value;
  })
  .messages({
    'string.controlChars': `${label} contiene caracteres de control no permitidos`,
    'string.htmlBrackets': `${label} no puede contener los caracteres < o >`,
    'string.formulaPrefix': `${label} no puede comenzar con =, +, -, @, tabulación o retorno de carro`,
  });

export const schemas = {
  /**
   * Login validation
   */
  login: Joi.object({
    email: Joi.string()
      .email()
      .max(254)
      .required()
      .messages({
        'string.email': 'Email debe ser válido',
        'any.required': 'Email es requerido',
      }),
    password: Joi.string()
      .min(8)
      .max(200)
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
    nombre: safeText('Nombre')
      .trim()
      .min(3)
      .max(255)
      .required()
      .messages({
        'string.min': 'Nombre debe tener al menos 3 caracteres',
        'string.max': 'Nombre no puede exceder 255 caracteres',
        'any.required': 'Nombre es requerido',
      }),
    zona: safeText('Zona')
      .trim()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'Zona debe tener al menos 2 caracteres',
        'string.max': 'Zona no puede exceder 100 caracteres',
        'any.required': 'Zona es requerida',
      }),
    direccion: safeText('Dirección')
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
      .required()
      .custom((value, helpers) => {
        const normalized = normalizeArgPhone(value);
        if (!normalized) return helpers.error('string.phoneInvalid');
        return normalized;
      })
      .messages({
        'string.phoneInvalid': 'Teléfono inválido. Formato esperado: +54 9 11 1234-5678',
        'any.required': 'Teléfono es requerido',
      }),
    lat: Joi.number()
      .min(-90)
      .max(90)
      .allow(null)
      .optional()
      .messages({
        'number.min': 'Latitud debe estar entre -90 y 90',
        'number.max': 'Latitud debe estar entre -90 y 90',
      }),
    lng: Joi.number()
      .min(-180)
      .max(180)
      .allow(null)
      .optional()
      .messages({
        'number.min': 'Longitud debe estar entre -180 y 180',
        'number.max': 'Longitud debe estar entre -180 y 180',
      }),
    vende_hamburguesa: Joi.boolean().optional().default(false),
    vende_pancho: Joi.boolean().optional().default(false),
    vende_sanguches: Joi.boolean().optional().default(false),
    // Uso interno (proveedores del local). Nunca se expone en los endpoints públicos.
    proveedores: safeText('Proveedores')
      .trim()
      .max(500)
      .allow('')
      .optional()
      .messages({
        'string.max': 'Proveedores no puede exceder 500 caracteres',
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

  /**
   * Cambiar estado (admin)
   */
  estado: Joi.object({
    estado: Joi.string().valid('aprobado', 'pendiente', 'inactivo').required(),
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
