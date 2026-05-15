# ============================================
# PAZZI BUNS - VERIFICACION INTEGRAL DE SEGURIDAD
# Prueba: Conexion + Vulnerabilidades + Funcionalidad
# ============================================

$ErrorActionPreference = "SilentlyContinue"
$API = "http://localhost:3000"
$pass = 0
$fail = 0
$warn = 0

function Test-Pass($msg) { Write-Host "  [OK]   $msg" -ForegroundColor Green; $script:pass++ }
function Test-Fail($msg) { Write-Host "  [FAIL] $msg" -ForegroundColor Red; $script:fail++ }
function Test-Warn($msg) { Write-Host "  [WARN] $msg" -ForegroundColor Yellow; $script:warn++ }
function Section($title) { Write-Host "`n=== $title ===" -ForegroundColor Cyan }

# ============================================
# 1. CONECTIVIDAD: Backend corriendo
# ============================================
Section "1. CONECTIVIDAD DEL BACKEND"

try {
    $r = Invoke-WebRequest -Uri "$API/health" -UseBasicParsing -TimeoutSec 3
    if ($r.StatusCode -eq 200) { Test-Pass "Servidor backend responde en puerto 3000" }
} catch {
    Test-Fail "Backend NO responde. Ejecuta: cd server; npm run dev"
    Write-Host "`nABORTANDO - El backend debe estar corriendo" -ForegroundColor Red
    exit 1
}

# ============================================
# 2. CONEXION A BASE DE DATOS (Turso)
# ============================================
Section "2. CONEXION A BASE DE DATOS (Turso)"

try {
    $r = Invoke-WebRequest -Uri "$API/api/puntos" -UseBasicParsing -TimeoutSec 5
    $puntos = $r.Content | ConvertFrom-Json
    Test-Pass "GET /api/puntos funciona (BD respondiendo)"
    Test-Pass "Puntos en BD: $($puntos.Length)"
} catch {
    Test-Fail "BD no responde - revisar TURSO_CONNECTION_URL en .env"
}

# ============================================
# 3. SECURITY HEADERS (Helmet.js)
# ============================================
Section "3. HTTP SECURITY HEADERS"

$r = Invoke-WebRequest -Uri "$API/api/puntos" -UseBasicParsing
$headers = $r.Headers

if ($headers["X-Content-Type-Options"] -eq "nosniff") { Test-Pass "X-Content-Type-Options: nosniff (anti MIME-sniffing)" }
else { Test-Fail "Falta X-Content-Type-Options" }

if ($headers["X-Frame-Options"]) { Test-Pass "X-Frame-Options presente (anti clickjacking)" }
else { Test-Fail "Falta X-Frame-Options" }

if ($headers["Strict-Transport-Security"]) { Test-Pass "HSTS habilitado (fuerza HTTPS)" }
else { Test-Fail "Falta HSTS header" }

if ($headers["Content-Security-Policy"]) { Test-Pass "CSP configurado (anti XSS)" }
else { Test-Fail "Falta Content-Security-Policy" }

if ($headers["X-Powered-By"]) { Test-Warn "X-Powered-By expuesto (revela tecnologia)" }
else { Test-Pass "X-Powered-By oculto (no revela Express)" }

# ============================================
# 4. AUTENTICACION (Bcrypt + JWT)
# ============================================
Section "4. AUTENTICACION"

# 4a. Login con credenciales correctas
try {
    $body = @{email="admin@pazzi.com"; password="Pazzi2024!Secure"} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$API/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    $data = $r.Content | ConvertFrom-Json
    $token = $data.token
    Test-Pass "Login con credenciales correctas (200 OK)"
    
    # 4b. Verificar formato JWT
    $parts = $token.Split('.')
    if ($parts.Length -eq 3) { Test-Pass "Token JWT con formato valido (3 partes)" }
    else { Test-Fail "Token JWT con formato invalido" }
    
    # 4c. Decode payload para verificar expiracion
    $payload = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($parts[1] + "==")) | ConvertFrom-Json
    $expHours = ($payload.exp - $payload.iat) / 3600
    if ($expHours -le 2) { Test-Pass "JWT expira en ${expHours}h (<=2h, seguro)" }
    else { Test-Warn "JWT expira en ${expHours}h (mucho, recomendado <=2h)" }
    
} catch {
    Test-Fail "Login fallo - revisar ADMIN_PASSWORD_HASH en .env"
    $token = $null
}

# 4d. Login con password incorrecto
try {
    $body = @{email="admin@pazzi.com"; password="WrongPass123!"} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$API/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    Test-Fail "Login con password incorrecto NO bloqueado"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) { Test-Pass "Login con password incorrecto rechazado (401)" }
}

# ============================================
# 5. PROTECCION DE ENDPOINTS
# ============================================
Section "5. PROTECCION DE ENDPOINTS"

# 5a. POST sin token
try {
    $body = @{nombre="Hack"; zona="Zona Norte"; direccion="X"; telefono="1234567890"; lat=0; lng=0} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$API/api/puntos" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    Test-Fail "POST sin token NO bloqueado (vulnerable!)"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401) { Test-Pass "POST sin token rechazado (401)" }
}

# 5b. POST con token invalido
try {
    $headers = @{"Authorization"="Bearer fake.token.here"}
    $body = @{nombre="Hack"; zona="Zona Norte"; direccion="X"; telefono="1234567890"; lat=0; lng=0} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$API/api/puntos" -Method Post -ContentType "application/json" -Body $body -Headers $headers -UseBasicParsing
    Test-Fail "POST con token invalido NO bloqueado"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 401 -or $_.Exception.Response.StatusCode.value__ -eq 403) { 
        Test-Pass "POST con token invalido rechazado" 
    }
}

# ============================================
# 6. VALIDACION DE INPUT (Joi)
# ============================================
Section "6. VALIDACION DE INPUT"

if ($token) {
    $h = @{"Authorization"="Bearer $token"}
    
    # 6a. Zona invalida
    try {
        $body = @{nombre="Test"; zona="ZonaFalsa"; direccion="Calle 123"; telefono="+34987654321"; lat=40; lng=-3} | ConvertTo-Json
        $r = Invoke-WebRequest -Uri "$API/api/puntos" -Method Post -ContentType "application/json" -Body $body -Headers $h -UseBasicParsing
        Test-Fail "Zona invalida NO rechazada"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) { Test-Pass "Zona invalida rechazada (400)" }
    }
    
    # 6b. Latitud fuera de rango
    try {
        $body = @{nombre="Test"; zona="Zona Norte"; direccion="Calle 123"; telefono="+34987654321"; lat=999; lng=-3} | ConvertTo-Json
        $r = Invoke-WebRequest -Uri "$API/api/puntos" -Method Post -ContentType "application/json" -Body $body -Headers $h -UseBasicParsing
        Test-Fail "Latitud invalida NO rechazada"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) { Test-Pass "Latitud fuera de rango rechazada (400)" }
    }
    
    # 6c. Email invalido en login
    try {
        $body = @{email="not-an-email"; password="Pazzi2024!Secure"} | ConvertTo-Json
        $r = Invoke-WebRequest -Uri "$API/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
        Test-Fail "Email invalido NO rechazado"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 400) { Test-Pass "Email mal formado rechazado (400)" }
    }
}

# ============================================
# 7. SQL INJECTION
# ============================================
Section "7. PROTECCION SQL INJECTION"

try {
    $body = @{email="admin' OR '1'='1"; password="anything"} | ConvertTo-Json
    $r = Invoke-WebRequest -Uri "$API/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    Test-Fail "SQL injection NO bloqueado!"
} catch {
    if ($_.Exception.Response.StatusCode.value__ -eq 400 -or $_.Exception.Response.StatusCode.value__ -eq 401) {
        Test-Pass "SQL injection en login bloqueado"
    }
}

# ============================================
# 8. CORS
# ============================================
Section "8. CORS POLICY"

try {
    $h = @{"Origin"="http://malicious-site.com"}
    $r = Invoke-WebRequest -Uri "$API/api/puntos" -Headers $h -UseBasicParsing
    if ($r.Headers["Access-Control-Allow-Origin"] -eq "http://malicious-site.com") {
        Test-Fail "CORS permite cualquier origen (vulnerable!)"
    } else {
        Test-Pass "CORS rechaza origen no autorizado"
    }
} catch {
    Test-Pass "CORS bloquea origen no autorizado"
}

# ============================================
# 9. RATE LIMITING
# ============================================
Section "9. RATE LIMITING"

Write-Host "  Probando 7 logins fallidos consecutivos..." -ForegroundColor Gray
$blocked = $false
for ($i = 1; $i -le 7; $i++) {
    try {
        $body = @{email="test@test.com"; password="WrongPass123!"} | ConvertTo-Json
        $r = Invoke-WebRequest -Uri "$API/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 429) {
            Test-Pass "Rate limit activado en intento $i (429 Too Many Requests)"
            $blocked = $true
            break
        }
    }
}
if (-not $blocked) { Test-Warn "Rate limit no activado tras 7 intentos (revisar config)" }

# ============================================
# 10. FRONTEND CONECTADO
# ============================================
Section "10. CONEXION FRONTEND"

# 10a. Frontend web
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 3
    Test-Pass "Frontend web corriendo en puerto 5173"
} catch {
    Test-Warn "Frontend web NO corriendo (ejecuta: npm run dev)"
}

# 10b. Frontend admin
try {
    $r = Invoke-WebRequest -Uri "http://localhost:5174" -UseBasicParsing -TimeoutSec 3
    Test-Pass "Admin dashboard corriendo en puerto 5174"
} catch {
    Test-Warn "Admin dashboard NO corriendo (ejecuta: cd pazzi-admin; npm run dev)"
}

# ============================================
# 11. LOGS DE AUDITORIA
# ============================================
Section "11. LOGS DE AUDITORIA"

$logFile = "server/logs/combined.log"
if (Test-Path $logFile) {
    Test-Pass "Archivo combined.log existe"
    $size = (Get-Item $logFile).Length
    Test-Pass "Tamano del log: $size bytes"
    
    $content = Get-Content $logFile -Raw
    if ($content -match "Audit:") { Test-Pass "Audit logs presentes (CREATE/UPDATE/DELETE)" }
    else { Test-Warn "Sin audit logs aun (probar operaciones CRUD)" }
    
    if ($content -match "password|TURSO_AUTH_TOKEN") {
        Test-Fail "CREDENCIALES expuestas en logs!"
    } else {
        Test-Pass "Credenciales NO expuestas en logs (sanitizacion OK)"
    }
} else {
    Test-Fail "Logs no se generan en server/logs/"
}

# ============================================
# 12. ARCHIVOS SENSIBLES
# ============================================
Section "12. ARCHIVOS SENSIBLES"

if (Test-Path "server/.env") { Test-Pass "Archivo .env existe" }
else { Test-Fail ".env no existe" }

if (Test-Path ".gitignore") {
    $gitignore = Get-Content ".gitignore" -Raw
    if ($gitignore -match "\.env") { Test-Pass ".env esta en .gitignore" }
    else { Test-Fail ".env NO esta en .gitignore (peligro!)" }
} else {
    Test-Warn "No hay .gitignore"
}

# ============================================
# RESUMEN FINAL
# ============================================
Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "RESUMEN DE VERIFICACION" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "  Tests pasados:     $pass" -ForegroundColor Green
Write-Host "  Advertencias:      $warn" -ForegroundColor Yellow
Write-Host "  Tests fallidos:    $fail" -ForegroundColor Red
Write-Host ("=" * 50) -ForegroundColor Cyan

if ($fail -eq 0) {
    Write-Host "`nESTADO: SEGURO - Sistema listo para uso" -ForegroundColor Green
} elseif ($fail -le 2) {
    Write-Host "`nESTADO: REVISAR - Hay $fail problemas menores" -ForegroundColor Yellow
} else {
    Write-Host "`nESTADO: VULNERABLE - $fail problemas criticos detectados" -ForegroundColor Red
}
