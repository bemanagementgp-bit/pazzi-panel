# Test create punto endpoint
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBhenppLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODAyNjMyMSwiZXhwIjoxNzc4MDMzNTIxfQ.xFzk-r45EciV3VNSY0_IE33Ks9apU71NLbfVTb86Hok"
$body = @{nombre="Pizzería Test"; zona="Zona Norte"; direccion="Calle Principal 123"; telefono="+34987654321"; lat=40.4168; lng=-3.7038} | ConvertTo-Json
$headers = @{"Authorization"="Bearer $token"}
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos" -Method Post -ContentType "application/json" -Body $body -Headers $headers -UseBasicParsing
Write-Host $response.Content
