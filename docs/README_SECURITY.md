# 🍕 PAZZI BUNS - Sistema Seguro de Gestión de Puntos de Venta

**Implementación de seguridad de nivel empresarial con Express.js + Turso SQL**

---

## 🔐 Resumen de Seguridad

Este proyecto implementa **5 fases de hardening de seguridad**:

| Fase | Objetivo | Status |
|------|----------|--------|
| **1** | Secretos & Credenciales | ✅ COMPLETADA |
| **2** | Validación & Rate Limiting | ✅ COMPLETADA |
| **3** | HTTP Security Headers | ✅ COMPLETADA |
| **4** | Logging & Auditoría | ✅ COMPLETADA |
| **5** | Testing & Documentación | ✅ COMPLETADA |

**Resultado**: Seguridad de producción enterprise-grade 🚀

---

## 🚀 Inicio Rápido

### Instalación

```bash
# Clonar y navegar
git clone <repo>
cd Pazzi

# Instalar dependencias (servidor)
cd server
npm install

# Crear archivo .env desde template
cp .env.example .env
```

### Configurar Variables de Entorno

Editar `server/.env`:
```env
TURSO_CONNECTION_URL=libsql://your-db.turso.io
TURSO_AUTH_TOKEN=your_token_here
JWT_SECRET=generated_32_char_hex_string
ADMIN_PASSWORD_HASH=$2b$10$your_bcrypt_hash
FRONTEND_URLS=http://localhost:5173,http://localhost:5174
```

### Ejecutar en Desarrollo

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend web
npm run dev

# Terminal 3: Admin dashboard (opcional)
cd pazzi-admin
npm run dev
```

Acceso:
- 🌐 Web: http://localhost:5173
- 🔧 Admin: http://localhost:5174
- 🔌 API: http://localhost:3000

---

## 📚 Documentación de Seguridad

### Para Entender la Seguridad
- **[SECURITY.md](./SECURITY.md)** - Política completa de seguridad
- **[SETUP_SECURITY.md](./SETUP_SECURITY.md)** - Setup inicial y credenciales

### Para Testing
- **[TESTING.md](./TESTING.md)** - Guía de tests automatizados
- Ejecutar: `cd server && npm test`

### Para Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de deployment
  - PM2 (recomendado para VPS)
  - Docker
  - Vercel (serverless)

### Documentación Técnica
- **[FASE4_LOGGING.md](./FASE4_LOGGING.md)** - Sistema de auditoría
- **[FASE5_TESTING.md](./FASE5_TESTING.md)** - Suite de tests

---

## 🔐 Características de Seguridad Implementadas

### ✅ Autenticación Segura
- Bcrypt con 10 salt rounds
- JWT tokens con 2 horas de expiration
- SessionStorage en frontend (XSS resistant)
- Auto-logout al cerrar pestaña

### ✅ Validación Estricta
- Joi schemas para todos los inputs
- Sanificación automática (trim, type coercion)
- Rangos validados (coordenadas, longitud de strings)
- Formatos específicos (email, teléfono)

### ✅ Rate Limiting
- Login: 5 intentos / 15 minutos
- Operaciones: 30 / minuto
- API general: 100 / 15 minutos

### ✅ HTTP Security
- Helmet.js: 12+ security headers
- HSTS: 1 año
- CSP: Restrictivo
- CORS: Solo frontends autorizados

### ✅ Logging Completo
- Winston logger con rotación automática
- Auditoría de CREATE/UPDATE/DELETE
- Auto-sanitización de credenciales
- Logs separados por nivel (error.log, combined.log)

### ✅ Testing Automatizado
- 37+ tests (Jest + Supertest)
- Validación de schemas
- Autenticación
- Endpoints
- Rate limiting

---

## 📊 Estructura del Proyecto

```
Pazzi/
├── 📄 SECURITY.md              # Política de seguridad
├── 📄 TESTING.md               # Guía de tests
├── 📄 DEPLOYMENT.md            # Deployment
├── 📄 SETUP_SECURITY.md        # Setup inicial
├── 📄 FASE4_LOGGING.md         # Auditoría
├── 📄 FASE5_TESTING.md         # Tests y docs
│
├── server/                      # Backend Express + Turso
│   ├── app.js                  # Main app con middleware de seguridad
│   ├── package.json            # Dependencies + test scripts
│   ├── .env.example            # Template de variables
│   ├── .env.validation.js      # Validar .env en startup
│   │
│   ├── config/
│   │   └── database.js         # Conexión a Turso
│   │
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   ├── validation.js       # Joi schemas
│   │   └── rateLimiters.js     # express-rate-limit
│   │
│   ├── utils/
│   │   ├── auth.js             # Bcrypt, JWT, validación
│   │   └── logger.js           # Winston logger
│   │
│   ├── routes/
│   │   └── puntos.js           # Endpoints auditados
│   │
│   ├── __tests__/              # Test suite
│   │   ├── validation.test.js
│   │   ├── auth.test.js
│   │   └── endpoints.test.js
│   │
│   └── logs/                   # Generados en runtime
│       ├── combined.log
│       ├── error.log
│       └── combined.log.1, etc.
│
├── pazzi-web/                   # Frontend web
│   └── src/components/
│
└── pazzi-admin/                 # Admin dashboard
    └── src/
        ├── utils/
        │   ├── tokenManager.js  # SessionStorage token handling
        │   └── validators.js    # Frontend validation
        └── pages/AdminPage.jsx
```

---

## 🧪 Testing

### Ejecutar Tests Automatizados
```bash
cd server
npm test
```

### Tests Incluidos
1. **Validación** - Email, password, coordinates, etc.
2. **Autenticación** - Bcrypt, JWT generation
3. **Endpoints** - Login, create, protected routes
4. **Rate Limiting** - 429 responses después de límite

### Tests Manuales (curl)
```bash
# Login
curl -X POST http://localhost:3000/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pazzi.com","password":"Pazzi2024!Secure"}'

# Crear punto (requiere token)
curl -X POST http://localhost:3000/api/puntos \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pizza Zone","zona":"Zona Norte",...}'

# Verificar headers de seguridad
curl -i http://localhost:3000/api/puntos | grep -E "X-|Strict|CSP"
```

---

## 📦 Deployment

### Opción 1: PM2 (Recomendado para VPS)
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
```

### Opción 2: Docker
```bash
docker-compose up -d
docker-compose logs -f
```

### Opción 3: Vercel (Serverless)
Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

### Pre-Deployment Checklist
- [ ] `npm test` pasa todos los tests
- [ ] `.env` configurado con credenciales reales
- [ ] `npm run build` se ejecuta sin errores
- [ ] SSL/TLS certificados instalados
- [ ] Base de datos Turso conectada y funcionando
- [ ] Logs se escriben en directorio persistente
- [ ] Rate limiting apropiado para producción

---

## 🔒 Credenciales por Defecto (DESARROLLO SOLO)

**⚠️ CAMBIAR ANTES DE PRODUCCIÓN**

- Email Admin: `admin@pazzi.com`
- Password: `Pazzi2024!Secure`

Cambiar:
```bash
# Generar nuevo hash bcrypt
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NewPassword123!', 10, (e,h) => console.log(h))"

# Actualizar en .env
ADMIN_PASSWORD_HASH=$2b$10$<nuevo_hash>
```

---

## 📊 Monitoreo en Producción

### Ver Logs
```bash
# Últimas líneas
tail -f server/logs/combined.log
tail -f server/logs/error.log

# Errores específicos
grep ERROR server/logs/error.log | tail -20

# Auditoría de cambios
grep "Audit:" server/logs/combined.log
```

### Monitorear Procesos
```bash
# PM2
pm2 monit

# Direct Node
ps aux | grep node

# Puerto 3000
netstat -ano | grep 3000
```

---

## 🚨 Troubleshooting

### Puerto 3000 en uso
```bash
lsof -i :3000
kill -9 <PID>
```

### Base de datos no conecta
- Verificar credenciales Turso en `.env`
- Revisar logs: `tail -f server/logs/error.log`
- Verificar firewall permite conexión

### Tests fallan
```bash
# Asegurar servidor está corriendo
npm run dev

# En otra terminal
npm test

# Ver más detalles
npm test -- --verbose
```

### Rate limiting muy restrictivo
Ajustar en `server/middleware/rateLimiters.js`:
```javascript
loginLimiter: rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutos
  max: 5,                      // 5 intentos (aumentar si necesario)
})
```

---

## 📞 Support & Documentación

- 📖 **Guías**: SECURITY.md, TESTING.md, DEPLOYMENT.md
- 🔍 **Logs**: `server/logs/` (combined.log, error.log)
- 🧪 **Tests**: `npm test` + archivos en `server/__tests__/`
- 🚀 **Deployment**: Ver DEPLOYMENT.md para opciones (PM2, Docker, Vercel)

---

## 📈 Roadmap Futuro

- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 integration
- [ ] Encryption at rest (BD)
- [ ] API versioning
- [ ] GraphQL layer
- [ ] Mobile app native
- [ ] Real-time notifications

---

## 📄 Licencia

MIT

---

## ✨ Resumen

Pazzi Buns implementa seguridad de nivel empresarial con:
- ✅ 5 fases de hardening completadas
- ✅ 37+ tests automatizados
- ✅ Documentación completa
- ✅ Listo para producción
- ✅ Fácil de mantener y escalar

**Iniciar ahora**: `npm run dev` 🚀

---

*Última actualización: 5 de Mayo, 2026*  
*Todas las fases completadas y listas para producción ✅*
