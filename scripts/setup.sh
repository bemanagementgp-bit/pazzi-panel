#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  🍞 PAZZI BUNS - SETUP RÁPIDO                                  ║"
echo "║  Este script configura PostgreSQL e inicia los servidores     ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si PostgreSQL está corriendo
echo "[1/5] Verificando PostgreSQL..."
if ! psql -U postgres -d postgres -c "SELECT 1" > /dev/null 2>&1; then
    echo "❌ PostgreSQL no está corriendo. Por favor inicia PostgreSQL primero."
    exit 1
fi
echo "✅ PostgreSQL está disponible"

# Crear base de datos
echo ""
echo "[2/5] Creando base de datos pazzi_buns..."
psql -U postgres -d postgres -c "CREATE DATABASE pazzi_buns;" 2>/dev/null
echo "✅ Base de datos lista (o ya existe)"

# Inicializar tablas
echo ""
echo "[3/5] Inicializando tablas..."
psql -U postgres -d pazzi_buns -f "server/init.sql" > /dev/null 2>&1
echo "✅ Tablas creadas"

# Instalar dependencias backend
echo ""
echo "[4/5] Instalando dependencias..."
cd server
npm install > /dev/null 2>&1
cd ..
echo "✅ Dependencias instaladas"

echo ""
echo "[5/5] ¡Todo listo!"
echo ""
echo "📌 Para iniciar los servidores, abre 3 terminales y ejecuta:"
echo ""
echo "   Terminal 1 (Backend - puerto 3000):"
echo "   cd server && npm run dev"
echo ""
echo "   Terminal 2 (Admin Panel - puerto 5174):"
echo "   cd pazzi-admin && npm run dev"
echo ""
echo "   Terminal 3 (Web Principal - puerto 5173):"
echo "   npm run dev"
echo ""
echo "🔐 Login Admin:"
echo "   Email: admin@pazzi.com"
echo "   Password: Pazzi2024!"
echo ""
echo "🌐 URLs:"
echo "   Web: http://localhost:5173"
echo "   Admin: http://localhost:5174"
echo "   API: http://localhost:3000/api"
echo ""
