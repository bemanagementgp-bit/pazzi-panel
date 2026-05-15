# Test create punto endpoint - Debug version
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHBhenppLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3ODAyNjMyMSwiZXhwIjoxNzc4MDMzNTIxfQ.xFzk-r45EciV3VNSY0_IE33Ks9apU71NLbfVTb86Hok"

# Test data
$testData = @{
    nombre = "Pizza Zone"
    zona = "Zona Norte"
    direccion = "Av. Corrientes 1234"
    telefono = "+34987654321"
    lat = 40.4168
    lng = -3.7038
}

Write-Host "Test data: $($testData | ConvertTo-Json)"

$body = $testData | ConvertTo-Json
Write-Host "JSON Body: $body"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "Headers: $($headers | ConvertTo-Json)"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/puntos" -Method Post -Body $body -Headers $headers -UseBasicParsing
    Write-Host "Success: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
