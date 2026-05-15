# Test direct INSERT with literal values
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBhenppLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODAyNjMyMSwiZXhwIjoxNzc4MDMzNTIxfQ.xFzk-r45EciV3VNSY0_IE33Ks9apU71NLbfVTb86Hok"

# Test a simple GET first
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos" -Method Get -UseBasicParsing
Write-Host "GET /api/puntos successful"
$datos = $response.Content | ConvertFrom-Json
Write-Host "Number of puntos: $($datos.Length)"
