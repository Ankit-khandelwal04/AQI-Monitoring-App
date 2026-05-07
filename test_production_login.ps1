# Test Production Login Script
Write-Host "Testing Production Login Credentials" -ForegroundColor Cyan
Write-Host "=" * 60

$baseUrl = "https://aqi-monitoring-app1.onrender.com"

# Test different credential combinations
$credentials = @(
    @{email="admin@nashikaqi.in"; password="admin@123"; name="Admin (lowercase)"},
    @{email="admin@nashikaqi.in"; password="Admin@123"; name="Admin (capital A)"},
    @{email="admin@nashikaqi.in"; password="ADMIN@123"; name="Admin (all caps)"},
    @{email="ankit@nashikaqi.in"; password="user@1234"; name="User Ankit (lowercase)"},
    @{email="ankit@nashikaqi.in"; password="User@1234"; name="User Ankit (capital U)"},
    @{email="priya@nashikaqi.in"; password="user@1234"; name="User Priya"}
)

foreach ($cred in $credentials) {
    Write-Host "`nTesting: $($cred.name)" -ForegroundColor Yellow
    Write-Host "  Email: $($cred.email)"
    Write-Host "  Password: $($cred.password)"
    
    try {
        $body = @{
            email = $cred.email
            password = $cred.password
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
            -Method Post `
            -Body $body `
            -ContentType "application/json" `
            -ErrorAction Stop
        
        Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "  Token: $($response.access_token.Substring(0, 20))..."
        Write-Host "  Role: $($response.user.role)"
        break
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "  ❌ FAILED (Status: $statusCode)" -ForegroundColor Red
    }
}

Write-Host "`n" + "=" * 60
Write-Host "If all failed, database may not be seeded on Render" -ForegroundColor Yellow
