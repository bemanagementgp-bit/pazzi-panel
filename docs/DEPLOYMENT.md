# 🚀 DEPLOYMENT - GUÍA DE SEGURIDAD

**Cómo desplegar Pazzi Buns de forma segura en producción**

---

## Pre-Deployment Checklist

### Seguridad
- [ ] JWT_SECRET generado (32+ caracteres random)
- [ ] ADMIN_PASSWORD_HASH hasheado con bcrypt
- [ ] NODE_ENV=production configurado
- [ ] .env NO incluida en el repositorio
- [ ] Certificados SSL/TLS válidos obtenidos
- [ ] FRONTEND_URLS especificadas para CORS

### Base de Datos
- [ ] Backup de BD completo realizado
- [ ] init.sql ejecutado para crear tablas
- [ ] Tabla audit_log existe
- [ ] Conexión a Turso verificada

### Frontend
- [ ] API_URL apunta a dominio de producción
- [ ] sessionStorage limpio antes del deploy
- [ ] Tokens removidos de localStorage
- [ ] Build optimizado (`npm run build`)

### Testing
- [ ] Login funciona con credenciales correctas
- [ ] Rate limiting activo
- [ ] Headers de seguridad presentes
- [ ] Logs se guardan correctamente
- [ ] CORS rechaza orígenes no permitidos

---

## Opción 1: Deployment con Node.js + PM2

### 1. Instalar PM2 Globalmente

```bash
npm install -g pm2
```

### 2. Crear archivo ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'pazzi-api',
    script: './server/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      SERVER_PORT: 3000,
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    max_restarts: 10,
    min_uptime: '10s',
  }],
};
```

### 3. Crear archivo .env.production

```bash
cp server/.env.example server/.env.production
```

**Llenar valores:**
```
TURSO_CONNECTION_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your_token_here
SERVER_PORT=3000
NODE_ENV=production
JWT_SECRET=generated_secret_32_chars
JWT_EXPIRATION=2
ADMIN_EMAIL=admin@pazzi.com
ADMIN_PASSWORD_HASH=$2b$10$your_bcrypt_hash
FRONTEND_URLS=https://app.pazzi.com,https://admin.pazzi.com
LOG_LEVEL=warn
LOG_DIR=/var/log/pazzi
```

### 4. Instalar Dependencias

```bash
cd server
npm ci --only=production
```

### 5. Iniciar con PM2

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Monitoreo

```bash
pm2 monit
pm2 logs pazzi-api
pm2 status
```

---

## Opción 2: Deployment con Docker

### 1. Crear Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copiar package files
COPY server/package*.json ./server/

# Instalar dependencias
RUN cd server && npm ci --only=production

# Copiar código
COPY server/ ./server/

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start
CMD ["node", "server/app.js"]
```

### 2. Crear docker-compose.yml

```yaml
version: '3.8'

services:
  pazzi-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      TURSO_CONNECTION_URL: ${TURSO_CONNECTION_URL}
      TURSO_AUTH_TOKEN: ${TURSO_AUTH_TOKEN}
      JWT_SECRET: ${JWT_SECRET}
      ADMIN_PASSWORD_HASH: ${ADMIN_PASSWORD_HASH}
      FRONTEND_URLS: ${FRONTEND_URLS}
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    networks:
      - pazzi

networks:
  pazzi:
    driver: bridge
```

### 3. Ejecutar con Docker

```bash
docker-compose up -d
docker-compose logs -f pazzi-api
```

---

## Opción 3: Deployment en Vercel (Recomendado para Serverless)

### 1. Configurar vercel.json

```json
{
  "buildCommand": "cd server && npm ci && cd ..",
  "outputDirectory": "server",
  "env": {
    "NODE_ENV": "production",
    "TURSO_CONNECTION_URL": "@turso_connection_url",
    "TURSO_AUTH_TOKEN": "@turso_auth_token",
    "JWT_SECRET": "@jwt_secret",
    "ADMIN_PASSWORD_HASH": "@admin_password_hash",
    "FRONTEND_URLS": "@frontend_urls"
  }
}
```

### 2. Agregar Secrets en Vercel Dashboard

```
TURSO_CONNECTION_URL = libsql://...
TURSO_AUTH_TOKEN = eyJ...
JWT_SECRET = your_random_32_char_secret
ADMIN_PASSWORD_HASH = $2b$10$...
FRONTEND_URLS = https://app.pazzi.com,https://admin.pazzi.com
```

### 3. Deploy

```bash
npm install -g vercel
vercel
vercel env pull .env.production
vercel deploy --prod
```

---

## Nginx Reverse Proxy (Recomendado)

### 1. Crear configuración Nginx

```nginx
upstream pazzi_api {
  server localhost:3000;
}

server {
  listen 80;
  server_name api.pazzi.com;
  
  # Redirigir HTTP → HTTPS
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name api.pazzi.com;

  # Certificados SSL (Let's Encrypt)
  ssl_certificate /etc/letsencrypt/live/api.pazzi.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/api.pazzi.com/privkey.pem;

  # Seguridad SSL
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  # Proxy
  location / {
    proxy_pass http://pazzi_api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Limitar rate
  limit_req_zone $binary_remote_addr zone=general:10m rate=100r/m;
  limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

  location /api/puntos/login {
    limit_req zone=login burst=2 nodelay;
    proxy_pass http://pazzi_api;
  }

  location / {
    limit_req zone=general burst=20 nodelay;
    proxy_pass http://pazzi_api;
  }
}
```

### 2. Generar Certificados Let's Encrypt

```bash
sudo certbot certonly --standalone -d api.pazzi.com
```

---

## Monitoreo Post-Deployment

### 1. Verificar Salud del Servidor

```bash
curl https://api.pazzi.com/health
```

### 2. Verificar Headers de Seguridad

```bash
curl -i https://api.pazzi.com/health | grep X-
```

### 3. Probar Login

```bash
curl -X POST https://api.pazzi.com/api/puntos/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pazzi.com","password":"Pazzi2024!Secure"}'
```

### 4. Revisar Logs

```bash
tail -f logs/combined.log
tail -f logs/error.log
```

### 5. Monitorar Recursos

```bash
# CPU, memoria
top

# Conexiones de red
netstat -an | grep 3000

# Proceso Node
ps aux | grep node
```

---

## Rollback de Emergencia

```bash
# PM2
pm2 delete pazzi-api
pm2 start ecosystem.config.js

# Docker
docker-compose down
docker-compose up -d

# Git
git revert HEAD
git push
# Re-deploy
```

---

## Mantenimiento Periódico

### Diario
- ✅ Revisar logs de error
- ✅ Monitorar intentos fallidos de login

### Semanal
- ✅ Revisar auditoría de cambios
- ✅ Actualizar dependencias si hay parches de seguridad

### Mensualmente
- ✅ Backup de BD
- ✅ Revisar certificados SSL (vencimiento)
- ✅ Cambiar contraseña admin

### Anualmente
- ✅ Auditoría de seguridad completa
- ✅ Penetration testing
- ✅ Revisión de dependencias

---

## Troubleshooting

### Puerto 3000 en uso
```bash
lsof -i :3000
kill -9 <PID>
```

### Memoria insuficiente
```bash
pm2 restart pazzi-api --max-memory-restart 500M
```

### BD no conecta
- Verificar credenciales Turso
- Verificar firewall permite conexión
- Revisar logs: `tail -f logs/error.log`

### Rate limiting muy restrictivo
- Ajustar en `server/middleware/rateLimiters.js`
- Reinicar servidor: `pm2 restart pazzi-api`

---

**Última Actualización**: Mayo 5, 2026  
**Estado**: Listo para producción  
