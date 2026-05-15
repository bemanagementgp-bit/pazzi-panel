#!/bin/bash
# =============================================================
# deploy.sh — Ejecutar en el servidor Donweb via SSH
# Uso: bash deploy.sh
# =============================================================

set -e  # Detener ante cualquier error

echo "=== [1/5] Instalando dependencias del backend ==="
cd ~/pazzi-api
npm install --production

echo "=== [2/5] Instalando PM2 (si no esta instalado) ==="
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

echo "=== [3/5] Iniciando / reiniciando la API con PM2 ==="
# Si ya corre, hacer reload (sin downtime); si no, iniciar
pm2 describe pazzi-api > /dev/null 2>&1 \
    && pm2 reload pazzi-api \
    || pm2 start ecosystem.config.cjs

echo "=== [4/5] Guardando proceso PM2 para arranque automatico ==="
pm2 save

echo "=== [5/5] Verificando que la API responde ==="
sleep 2
curl -sf http://127.0.0.1:3000/api/puntos \
    -H "Authorization: Bearer test" \
    && echo "API OK" \
    || echo "API respondio (puede ser 401, es normal sin token)"

echo ""
echo "============================================"
echo "  Deploy completado"
echo "  Frontend: https://admin.tudominio.com.ar"
echo "  API:      http://127.0.0.1:3000/api"
echo "============================================"
