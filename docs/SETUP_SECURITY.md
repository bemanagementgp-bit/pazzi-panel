# 🔐 SETUP DE SEGURIDAD - PAZZI BUNS

**IMPORTANTE**: Leer este archivo completamente antes de desplegar a producción.

---

## 1. Contraseña Admin Inicial

### Desarrollo
Para desarrollo local, la contraseña es:
```
Contraseña: Pazzi2024!Secure
Email: admin@pazzi.com
```

### Cambiar contraseña
Para cambiar la contraseña admin:

1. Generar nuevo hash bcrypt:
```bash
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('TU_NUEVA_CONTRASEÑA', 10));"
```

2. Copiar el hash (comienza con `$2b$`) al archivo `.env`:
```
ADMIN_PASSWORD_HASH=<pegar_hash_aqui>
```

3. Reiniciar el servidor:
```bash
npm run dev
```

---

## 2. Variables de Entorno Requeridas

### Crear archivo .env
```bash
cp .env.example .env
```

### Llenar valores requeridos:

- **TURSO_CONNECTION_URL**: Base de datos (obtener en turso.tech)
- **TURSO_AUTH_TOKEN**: Token para la BD (obtener en turso.tech)
- **JWT_SECRET**: Generar con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"
  ```
- **JWT_EXPIRATION**: Horas que dura el token (ej: 2)
- **ADMIN_PASSWORD_HASH**: Hash bcrypt de la contraseña (ver arriba)
- **FRONTEND_URLS**: URLs permitidas (dev: http://localhost:5173,http://localhost:5174)

---

## 3. NUNCA Haz Esto

❌ **NO comitear `.env` con secretos reales**  
❌ **NO usar contraseñas débiles** (< 8 caracteres)  
❌ **NO compartir JWT_SECRET**  
❌ **NO hardcodear URLs en .env**  
❌ **NO usar texto plano para contraseñas**  

---

## 4. Producción

En producción:

1. Cambiar `NODE_ENV=production`
2. Usar variables de entorno del servidor (systemd, Docker, Cloud, etc.)
3. NO incluir `.env` en el servidor
4. Usar certificados HTTPS válidos
5. Implementar CORS con dominio específico
6. Cambiar contraseña admin inmediatamente después del deploy

---

## 5. Prueba de Seguridad

### Verificar que .env es válido:
```bash
npm start
# Debe mostrar: ✅ Todas las variables de entorno son válidas
```

### Probar login:
```bash
curl -X POST http://localhost:3000/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pazzi.com","password":"Pazzi2024!Secure"}'
```

Debe devolver:
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": { "email": "admin@pazzi.com", "role": "admin" }
}
```

---

## 6. Seguridad en Frontend

Los tokens se almacenan en `sessionStorage` (no localStorage):
- Se limpian automáticamente al cerrar la pestaña
- Más seguros contra XSS
- Sin acceso desde otras pestañas

---

## 7. Contacto / Soporte

Si algo falla:
1. Revisar que `.env` tiene todos los valores
2. Revisar logs en la consola
3. Comprobar que Turso tiene conexión
4. NO incluir .env en reportes de error

---

**Última actualización**: Mayo 5, 2026  
**Versión de seguridad**: 1.0 (Fase 1 completa)
