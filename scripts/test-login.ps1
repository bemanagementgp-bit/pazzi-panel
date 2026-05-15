# Test login endpoint
$ErrorActionPreference = "SilentlyContinue"
$body = @{email="admin@pazzi.com"; password="Pazzi2024!Secure"} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos/login" -Method Post -ContentType "application/json" -Body $body -UseBasicParsing
Write-Host $response.Content
