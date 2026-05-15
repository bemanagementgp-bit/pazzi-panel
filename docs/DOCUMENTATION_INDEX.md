# 📚 ÍNDICE DE DOCUMENTACIÓN - PAZZI BUNS SEGURIDAD

**Guía de navegación para toda la documentación de seguridad**

---

## 🚀 EMPEZAR AQUÍ

### Para Desarrolladores
1. **[README_SECURITY.md](./README_SECURITY.md)** - Overview completo y quick start
2. **[SECURITY.md](./SECURITY.md)** - Política de seguridad detallada

### Para DevOps / Sysadmin
1. **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guía de deployment en producción
2. **[SETUP_SECURITY.md](./SETUP_SECURITY.md)** - Setup inicial

### Para QA / Testing
1. **[TESTING.md](./TESTING.md)** - Guía de testing automatizado y manual
2. **[FASE5_TESTING.md](./FASE5_TESTING.md)** - Detalles de suite de tests

---

## 📖 DOCUMENTACIÓN POR FASE

### FASE 1: Secretos & Credenciales ✅
**Objetivo**: Proteger credenciales y claves

**Archivos relevantes**:
- `server/.env.example` - Template sin secretos
- `server/.env` - Credenciales (en .gitignore)
- `server/utils/auth.js` - Funciones bcrypt
- `server/.env.validation.js` - Validación en startup

**Leer**: Ver sección "Fase 1" en [SECURITY.md](./SECURITY.md#fase-1-gestión-de-secretos)

---

### FASE 2: Validación & Rate Limiting ✅
**Objetivo**: Validar inputs y prevenir brute force

**Archivos relevantes**:
- `server/middleware/validation.js` - Schemas Joi
- `server/middleware/rateLimiters.js` - Límites de rate
- `server/__tests__/validation.test.js` - Tests

**Ejecutar tests**: `npm test -- __tests__/validation.test.js`

**Leer**: Ver sección "Fase 2" en [SECURITY.md](./SECURITY.md#fase-2-validación-y-rate-limiting)

---

### FASE 3: HTTP Security Headers ✅
**Objetivo**: Proteger contra ataques HTTP comunes

**Archivos relevantes**:
- `server/app.js` - Helmet.js configurado
- `server/middleware/auth.js` - JWT verification

**Verificar manualmente**:
```bash
curl -i http://localhost:3000/api/puntos | grep -E "X-|Strict|CSP"
```

**Leer**: Ver sección "Fase 3" en [SECURITY.md](./SECURITY.md#fase-3-headers-de-seguridad-http)

---

### FASE 4: Logging & Auditoría ✅
**Objetivo**: Registrar y auditar todas las acciones

**Archivos relevantes**:
- `server/utils/logger.js` - Winston logger
- `server/logs/` - Archivos generados
- `server/routes/puntos.js` - Endpoints auditados
- `FASE4_LOGGING.md` - Documentación detallada

**Ver logs**:
```bash
tail -f server/logs/combined.log
grep "Audit:" server/logs/combined.log
```

**Leer**: [FASE4_LOGGING.md](./FASE4_LOGGING.md)

---

### FASE 5: Testing & Documentación ✅
**Objetivo**: Validar seguridad con tests

**Archivos relevantes**:
- `server/__tests__/validation.test.js` - Validación
- `server/__tests__/auth.test.js` - Autenticación
- `server/__tests__/endpoints.test.js` - Endpoints
- `TESTING.md` - Guía de tests
- `FASE5_TESTING.md` - Detalles

**Ejecutar tests**:
```bash
npm test
```

**Leer**: [TESTING.md](./TESTING.md) y [FASE5_TESTING.md](./FASE5_TESTING.md)

---

## 🔐 GUÍAS PRÁCTICAS

### 🚀 Iniciar en Desarrollo
```bash
# 1. Setup inicial
cp server/.env.example server/.env
# 2. Editar .env con valores reales
# 3. Instalar dependencias
npm install
# 4. Ejecutar
npm run dev
```

**Referencia**: [SETUP_SECURITY.md](./SETUP_SECURITY.md)

---

### 🧪 Ejecutar Tests
```bash
cd server
npm test
```

**Referencia**: [TESTING.md](./TESTING.md)

---

### 🚀 Deploy a Producción
**3 opciones disponibles**:
1. **PM2** (VPS tradicional) - Recomendado
2. **Docker** (Contenedores)
3. **Vercel** (Serverless)

**Referencia**: [DEPLOYMENT.md](./DEPLOYMENT.md)

---

### 🔍 Verificar Seguridad
**Checklist manual**:
```bash
# 1. Verificar headers
curl -i http://localhost:3000/api/puntos | grep X-

# 2. Probar rate limiting
for i in {1..10}; do curl -X POST http://localhost:3000/api/puntos/login; done

# 3. Revisar logs
tail -f server/logs/combined.log

# 4. Ejecutar tests
npm test
```

---

## 📊 MATRIZ DE SEGURIDAD

| Aspecto | Implementado | Tests | Docs | Status |
|---------|--------------|-------|------|--------|
| Bcrypt Passwords | ✅ | ✅ | ✅ | ✅ |
| JWT Tokens | ✅ | ✅ | ✅ | ✅ |
| SessionStorage | ✅ | Manual | ✅ | ✅ |
| Joi Validation | ✅ | ✅ | ✅ | ✅ |
| Rate Limiting | ✅ | ✅ | ✅ | ✅ |
| Helmet Headers | ✅ | Manual | ✅ | ✅ |
| CORS | ✅ | Manual | ✅ | ✅ |
| Winston Logs | ✅ | Manual | ✅ | ✅ |
| Audit Trail | ✅ | Manual | ✅ | ✅ |
| SQL Injection | ✅ | ✅ | ✅ | ✅ |
| XSS Protection | ✅ | Manual | ✅ | ✅ |
| CSRF Protection | ✅ | Manual | ✅ | ✅ |

---

## 🎯 DECISIONES DE ARQUITECTURA

### ¿Por qué bcrypt?
- Resistente a timing attacks
- Salt aleatorio (10 rounds)
- Estándar de la industria
- Leer: [SECURITY.md#contraseñas](./SECURITY.md)

### ¿Por qué SessionStorage?
- Limpiado al cerrar pestaña (no localStorage persistente)
- Mejor protección contra XSS
- Ver: [README_SECURITY.md#autenticación-segura](./README_SECURITY.md#autenticación-segura)

### ¿Por qué Joi?
- Validación declarativa
- Mensajes de error detallados
- Sanitización automática
- Leer: [TESTING.md](./TESTING.md#tests-de-validación)

### ¿Por qué Winston?
- Logging industrial-grade
- Rotación automática de archivos
- Auto-sanitización de credenciales
- Leer: [FASE4_LOGGING.md](./FASE4_LOGGING.md)

---

## 🛠️ HERRAMIENTAS USADAS

### Dependencias de Seguridad
```json
{
  "bcrypt": "^5.1.0",              // Password hashing
  "jsonwebtoken": "^9.0.0",        // JWT tokens
  "helmet": "^7.1.0",              // HTTP headers
  "express-rate-limit": "^7.1.5",  // Rate limiting
  "joi": "^17.11.0",               // Input validation
  "winston": "^3.11.0"             // Logging
}
```

### Dependencias de Testing
```json
{
  "jest": "^29.7.0",              // Test framework
  "supertest": "^6.3.3"           // HTTP testing
}
```

---

## 📞 REFERENCIA RÁPIDA

### Archivos Clave
| Archivo | Propósito | Editar? |
|---------|-----------|---------|
| `.env` | Credenciales | ✅ Si |
| `.env.example` | Template | ❌ No (versionado) |
| `utils/auth.js` | Bcrypt, JWT | ⚠️ Cuidado |
| `middleware/validation.js` | Joi schemas | ✅ Si (según necesidad) |
| `middleware/rateLimiters.js` | Rate limits | ✅ Si (por environment) |
| `utils/logger.js` | Logging | ❌ No (funciona bien) |
| `routes/puntos.js` | Endpoints | ✅ Si (nuevas rutas) |

### Comandos Útiles
```bash
# Development
npm run dev              # Iniciar servidor

# Testing
npm test                 # Todos los tests
npm test -- auth        # Tests de auth
npm test -- --coverage  # Con coverage

# Production
npm start                # Sin nodemon

# Database
node init.sql            # Crear tablas
```

### Logs
```bash
# Ver todos
tail -f server/logs/combined.log

# Errores solo
tail -f server/logs/error.log

# Auditoría
grep "Audit:" server/logs/combined.log
grep "Failed login" server/logs/combined.log
```

---

## ✅ CHECKLIST ANTES DE PRODUCCIÓN

- [ ] Leer [SECURITY.md](./SECURITY.md)
- [ ] Ejecutar `npm test` (37+ tests)
- [ ] Revisar `.env` (sin valores default)
- [ ] Verificar credenciales Turso
- [ ] Ejecutar [DEPLOYMENT.md](./DEPLOYMENT.md)
- [ ] Certificados SSL/TLS instalados
- [ ] Logs en directorio persistente
- [ ] Backup BD configurado
- [ ] Monitoreo activo
- [ ] Password admin cambiado

---

## 🚀 ESTADO FINAL

| Fase | Objetivo | Status | Docs | Tests |
|------|----------|--------|------|-------|
| 1 | Secretos | ✅ | ✅ | ✅ |
| 2 | Validación | ✅ | ✅ | ✅ |
| 3 | Headers | ✅ | ✅ | ✅ |
| 4 | Logging | ✅ | ✅ | ✅ |
| 5 | Testing | ✅ | ✅ | ✅ |

**LISTO PARA PRODUCCIÓN** 🎉

---

## 📖 Otros Archivos

- **README_BACKEND.md** - Documentación backend original
- **README.md** (pazzi-web) - Documentación frontend

---

*Última actualización: 5 de Mayo, 2026*  
*Todas las fases completadas ✅*  
*Seguridad de nivel empresarial implementada 🔐*
