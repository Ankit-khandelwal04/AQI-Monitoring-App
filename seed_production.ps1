# Simple script to seed production database
Write-Host "Seeding Production Database..." -ForegroundColor Cyan

$baseUrl = "https://aqi-monitoring-app1.onrender.com"

Write-Host "`n1. Calling seed endpoint..." -ForegroundColor Yellow
try {
    $seedResponse = Invoke-RestMethod -Uri "$baseUrl/seed-now" -Method Get
    Write-Host "Seed Response:" -ForegroundColor Green
    $seedResponse | ConvertTo-Json -Depth 3
}
catch {
    Write-Host "Error calling seed endpoint: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "The endpoint may not be deployed yet. Wait 2-3 minutes and try again." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. Waiting 5 seconds..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "`n3. Testing login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@nashikaqi.in"
    password = "admin@123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json"
    
    Write-Host "`nSUCCESS! Login works!" -ForegroundColor Green
    Write-Host "Email: $($loginResponse.user.email)" -ForegroundColor White
    Write-Host "Role: $($loginResponse.user.role)" -ForegroundColor White
    Write-Host "`nYou can now login to the mobile app!" -ForegroundColor Cyan
}
catch {
    Write-Host "`nLogin failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the credentials or wait a bit longer." -ForegroundColor Yellow
}
