# Complete flow test: CREATE, GET ID, UPDATE, DELETE
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBhenppLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODAyNjMyMSwiZXhwIjoxNzc4MDMzNTIxfQ.xFzk-r45EciV3VNSY0_IE33Ks9apU71NLbfVTb86Hok"
$headers = @{"Authorization" = "Bearer $token"}

# Step 1: CREATE
Write-Host "1. Creating punto..."
$createBody = @{
    nombre = "Test Pizza"
    zona = "Zona Norte"
    direccion = "Test St 123"
    telefono = "+34123456789"
    lat = 40.42
    lng = -3.71
} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos" -Method Post -ContentType "application/json" -Body $createBody -Headers $headers -UseBasicParsing
Write-Host "Created: $($response.Content)"

# Step 2: UPDATE (using ID 2 since last one was 1)
Write-Host "2. Updating punto ID 2..."
$updateBody = @{
    nombre = "Test Pizza Updated"
    zona = "Zona Sur"
    direccion = "Test St 456"
    telefono = "+34987654321"
    lat = 40.43
    lng = -3.72
} | ConvertTo-Json
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos/2" -Method Put -ContentType "application/json" -Body $updateBody -Headers $headers -UseBasicParsing
Write-Host "Updated: $($response.Content)"

# Step 3: DELETE
Write-Host "3. Deleting punto ID 2..."
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos/2" -Method Delete -ContentType "application/json" -Headers $headers -UseBasicParsing
Write-Host "Deleted: $($response.Content)"

Write-Host "Complete flow test finished."
