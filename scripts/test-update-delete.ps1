# Test UPDATE and DELETE endpoints
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBhenppLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODAyNjMyMSwiZXhwIjoxNzc4MDMzNTIxfQ.xFzk-r45EciV3VNSY0_IE33Ks9apU71NLbfVTb86Hok"

# Test UPDATE
Write-Host "Testing UPDATE endpoint..."
$updateBody = @{
    nombre = "Pizza Zone Updated"
    zona = "Zona Sur"
    direccion = "Av. Corrientes 5678"
    telefono = "+34987654322"
    lat = 40.42
    lng = -3.71
} | ConvertTo-Json

$headers = @{"Authorization" = "Bearer $token"}
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos/1" -Method Put -ContentType "application/json" -Body $updateBody -Headers $headers -UseBasicParsing
Write-Host "UPDATE response: $($response.Content)"

# Test DELETE  
Write-Host "Testing DELETE endpoint..."
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos/1" -Method Delete -ContentType "application/json" -Headers $headers -UseBasicParsing
Write-Host "DELETE response: $($response.Content)"

Write-Host "Operations completed."
