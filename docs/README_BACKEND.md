# 🍞 Pazzi Buns - Backend + Admin Panel

## Estructura del Proyecto

```
Pazzi/
├── src/                    (Web principal - React)
│   ├── components/
│   ├── main.jsx
│   └── app.jsx
├── server/                 (Backend - Node.js/Express)
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── app.js
│   ├── package.json
│   └── .env
├── pazzi-admin/            (Admin Panel - React)
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── package.json           (Web principal)
```

---

## 🛠️ Setup - PostgreSQL

### 1. Instalar PostgreSQL

- **Windows**: Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt install postgresql postgresql-contrib`

### 2. Crear Base de Datos

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear database
CREATE DATABASE pazzi_buns;

# Salir
\q
```

### 3. Verificar Conexión

```bash
psql -U postgres -d pazzi_buns
```

---

## 🚀 Ejecutar el Proyecto

### Terminal 1: Backend (puerto 3000)

```bash
cd server
npm run dev
```

Resultado esperado:
```
╔════════════════════════════════════════╗
║  🍞 PAZZI BUNS - API SERVER            ║
║  Server running on port 3000           ║
║  Environment: development              ║
╚════════════════════════════════════════╝
```

### Terminal 2: Admin Panel (puerto 5174)

```bash
cd pazzi-admin
npm run dev
```

Abre: `http://localhost:5174`

### Terminal 3: Web Principal (puerto 5173)

```bash
npm run dev
```

Abre: `http://localhost:5173`

---

## 🔐 Login Admin Panel

**Email**: `admin@pazzi.com`  
**Password**: `Pazzi2024!`

Cambiar credenciales en `server/.env`:

```env
ADMIN_EMAIL=tu_email@example.com
ADMIN_PASSWORD=tu_password_nuevo
```

---

## 📡 API Endpoints

### Public (sin autenticación)
- `GET /api/puntos` - Listar todos los puntos de venta
- `GET /api/puntos/:id` - Obtener uno específico

### Admin (requiere JWT token)
- `POST /api/puntos/login` - Login y obtener token
- `POST /api/puntos` - Crear nuevo punto
- `PUT /api/puntos/:id` - Editar punto
- `DELETE /api/puntos/:id` - Eliminar punto

---

## 📋 CRUD Admin Panel

### ✅ Funcionalidades Implementadas

1. **Login** - Email y contraseña
2. **Listar** - Tabla de todos los puntos
3. **Crear** - Modal con formulario
4. **Editar** - Click en "Editar", modal prefilled
5. **Eliminar** - Confirmación de borrado
6. **Logout** - Cerrar sesión

---

## 🗄️ Base de Datos

### Tabla: `puntos_de_venta`

| Campo | Tipo | Requerido |
|-------|------|-----------|
| id | INT (PK, auto) | ✅ |
| nombre | VARCHAR(255) | ✅ |
| zona | ENUM | ✅ |
| direccion | VARCHAR(255) | ✅ |
| telefono | VARCHAR(20) | ✅ |
| lat | FLOAT | ✅ |
| lng | FLOAT | ✅ |
| horario | VARCHAR(100) | ❌ |
| estado | ENUM ('aprobado', 'pendiente', 'rechazado') | ✅ |
| createdAt | TIMESTAMP | ✅ |
| updatedAt | TIMESTAMP | ✅ |

### Zonas Disponibles

```
'Todas', 'CABA', 'Zona Norte', 'Zona Oeste', 'Zona Sur', 
'Costa Atlántica', 'Mar del Plata', 'Córdoba', 'San Luis', 'Bariloche'
```

---

## 🔄 Integración con Web Principal

Para conectar el admin panel con la web:

1. **Actualizar PuntosDeVenta.jsx**:
   ```jsx
   import { puntosAPI } from '../admin/services/api.js';
   
   useEffect(() => {
     puntosAPI.getAll().then(res => setPuntos(res.data));
   }, []);
   ```

2. **Agregar ruta en App.jsx**:
   ```jsx
   <Route path="/admin/*" component={AdminPage} />
   ```

---

## 🐛 Troubleshooting

### Error: "Cannot connect to PostgreSQL"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar puerto (default 5432)

### Error: "Token inválido"
- Verificar JWT_SECRET en `.env` coincide en server
- Token expirado (24 horas)

### Error: "CORS error"
- Verificar que servidor esté corriendo en puerto 3000
- Verificar CORS configurado en app.js

### Admin panel no carga
- Verificar backend corriendo en puerto 3000
- Verificar API URL en `services/api.js`

---

## 📝 Próximas Mejoras

- [ ] Validación de coordenadas GPS
- [ ] Búsqueda y filtrado avanzado
- [ ] Exportar a CSV/PDF
- [ ] Email notificaciones
- [ ] Sistema de roles (múltiples admins)
- [ ] Auditoría de cambios

---

## 👨‍💻 Tech Stack

**Frontend Web**: React 18, Tailwind CSS, Vite  
**Admin Panel**: React 18, Vite, Axios  
**Backend**: Express, Node.js, Sequelize ORM  
**Database**: PostgreSQL  
**Auth**: JWT tokens  

---

## 📞 Support

Para más ayuda, revisa los archivos de configuración en:
- `server/.env`
- `server/app.js`
- `pazzi-admin/src/services/api.js`
