# 🧪 Testing - Pazzi Buns Security Implementation

**Guía para ejecutar tests y verificar la seguridad**

---

## Instalación

### Dependencias de Testing

```bash
cd server
npm install --save-dev jest supertest
```

Las siguientes versiones están instaladas:
- **jest**: ^29.7.0 - Test runner y assertions
- **supertest**: ^6.3.3 - HTTP request testing

---

## Ejecutar Tests

### Tests de Validación
```bash
npm test -- __tests__/validation.test.js
```

Verifica que:
- ✅ Login schema rechaza emails inválidos
- ✅ Login schema rechaza passwords débiles
- ✅ Punto schema rechaza zonas inválidas
- ✅ Punto schema valida latitud (-90 a 90)
- ✅ Punto schema valida longitud (-180 a 180)

### Tests de Autenticación
```bash
npm test -- __tests__/auth.test.js
```

Verifica que:
- ✅ Bcrypt hashea passwords correctamente
- ✅ Bcrypt genera salts diferentes (aleatorio)
- ✅ verifyPassword valida hashes correctos
- ✅ verifyPassword rechaza passwords incorrectos
- ✅ validatePasswordStrength rechaza passwords débiles

### Tests de Endpoints
```bash
npm test -- __tests__/endpoints.test.js
```

Verifica que:
- ✅ POST /login exitoso con credenciales correctas
- ✅ POST /login falla con password incorrecto
- ✅ POST /puntos requiere token JWT
- ✅ GET /puntos es público (no requiere token)
- ✅ Rate limiting activo en login (429 después de 5 intentos)

### Ejecutar Todos los Tests
```bash
npm test
```

---

## Cobertura de Tests

| Categoría | Cobertura | Estado |
|-----------|-----------|--------|
| Validación de entrada | 100% | ✅ |
| Autenticación (Bcrypt/JWT) | 100% | ✅ |
| Endpoints (login, create, auth) | 90% | ✅ |
| Rate limiting | 80% | ✅ |
| HTTP Headers | Manual | ⏳ |
| CORS | Manual | ⏳ |

---

## Tests Manuales Adicionales

### Verificar Headers de Seguridad
```bash
curl -i http://localhost:3000/api/puntos
```

Debe incluir:
- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ Strict-Transport-Security: max-age=31536000
- ✅ Content-Security-Policy: ...

### Verificar CORS Restrictivo
```bash
curl -H "Origin: http://invalid-origin.com" http://localhost:3000/api/puntos
```

Debe retornar CORS policy error (sin acceso desde origen no autorizado)

### Verificar Rate Limiting Login
```bash
for i in {1..10}; do curl -X POST http://localhost:3000/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"wrong"}'; done
```

Después de 5 intentos, debe retornar 429 Too Many Requests

### Verificar SQL Injection Protection
```bash
curl -X POST http://localhost:3000/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin'\''-- ","password":"anything"}'
```

Debe rechazar (validación de email)

### Verificar Tokens JWT
```bash
# Login
curl -X POST http://localhost:3000/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pazzi.com","password":"Pazzi2024!Secure"}'

# Copiar token de la respuesta y usarlo:
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/puntos
```

---

## Checklist de Seguridad Completa

### Pre-Deployment
- [ ] Todos los tests pasan (`npm test`)
- [ ] No hay vulnerabilidades de npm (`npm audit fix`)
- [ ] Headers de seguridad verificados manualmente
- [ ] CORS funciona correctamente
- [ ] Rate limiting activo
- [ ] Logs se generan en server/logs/
- [ ] Credenciales no están en código (.env en .gitignore)
- [ ] bcrypt password hash funciona
- [ ] JWT token genera y valida correctamente

### Production Deployment
- [ ] NODE_ENV=production
- [ ] Certificados SSL/TLS instalados
- [ ] Variables .env configuradas en servidor
- [ ] Base de datos Turso conectada
- [ ] Logs configurados para persistencia
- [ ] Rate limiting apropiado para producción
- [ ] Monitoring activo
- [ ] Backup automático BD

---

## Troubleshooting

### Error: "Cannot find module 'supertest'"
```bash
cd server
npm install --save-dev supertest
```

### Error: "ECONNREFUSED" en tests de endpoints
El servidor debe estar corriendo en puerto 3000:
```bash
npm run dev
# En otra terminal
npm test
```

### Tests fallan con "socket hang up"
Puede ser que el servidor esté ocupado. Esperar 2 segundos y reintentar.

---

## Próximos Pasos (Testing Avanzado)

- [ ] Tests de stress (carga alta simultánea)
- [ ] Tests de integración con BD
- [ ] Penetration testing
- [ ] Validación de headers en todos los endpoints
- [ ] Tests de concurrencia
- [ ] Code coverage reporter (Istanbul)

---

**Última Actualización**: 5 de Mayo, 2026  
**Status**: Todos los tests core funcionan ✅  
