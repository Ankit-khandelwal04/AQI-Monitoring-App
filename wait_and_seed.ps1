# Wait for Render deployment and seed database
Write-Host "=" * 70 -ForegroundColor Cyan
Write-Host "WAITING FOR RENDER DEPLOYMENT & AUTO-SEEDING" -ForegroundColor Cyan
Write-Host "=" * 70

$baseUrl = "https://aqi-monitoring-app1.onrender.com"
$maxAttempts = 20
$attempt = 0

Write-Host "`nThis script will:" -ForegroundColor Yellow
Write-Host "1. Wait for Render to deploy the latest code (2-3 minutes)"
Write-Host "2. Call /seed-now endpoint to seed the database"
Write-Host "3. Test login with admin credentials"
Write-Host "4. Confirm everything is working"

Write-Host "`nStarting in 10 seconds..." -ForegroundColor Yellow
Write-Host "(Press Ctrl+C to cancel)" -ForegroundColor Gray
Start-Sleep -Seconds 10

while ($attempt -lt $maxAttempts) {
    $attempt++
    $elapsed = $attempt * 15
    
    Write-Host "`n[$attempt/$maxAttempts] Checking deployment status (${elapsed}s elapsed)..." -ForegroundColor Cyan
    
    try {
        # Check if /seed-now endpoint exists
        $response = Invoke-RestMethod -Uri "$baseUrl/seed-now" -Method Get -ErrorAction Stop
        
        Write-Host "✅ Deployment complete! Seed endpoint found." -ForegroundColor Green
        Write-Host "`nSeed Response:" -ForegroundColor Yellow
        $response | ConvertTo-Json -Depth 3
        
        # Wait a moment for seeding to complete
        Write-Host "`nWaiting 5 seconds for seeding to complete..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        
        # Test login
        Write-Host "`nTesting login..." -ForegroundColor Cyan
        $loginBody = @{
            email = "admin@nashikaqi.in"
            password = "admin@123"
        } | ConvertTo-Json
        
        try {
            $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
                -Method Post `
                -Body $loginBody `
                -ContentType "application/json" `
                -ErrorAction Stop
            
            Write-Host "`n" + "=" * 70 -ForegroundColor Green
            Write-Host "🎉 SUCCESS! LOGIN WORKS!" -ForegroundColor Green
            Write-Host "=" * 70 -ForegroundColor Green
            Write-Host "`nLogin Details:" -ForegroundColor Yellow
            Write-Host "  Email: $($loginResponse.user.email)"
            Write-Host "  Name: $($loginResponse.user.name)"
            Write-Host "  Role: $($loginResponse.user.role)"
            Write-Host "  Token: $($loginResponse.access_token.Substring(0, 30))..."
            
            Write-Host "`n📱 You can now login to the mobile app with:" -ForegroundColor Cyan
            Write-Host "  Email:    admin@nashikaqi.in" -ForegroundColor White
            Write-Host "  Password: admin@123" -ForegroundColor White
            
            Write-Host "`n" + "=" * 70 -ForegroundColor Green
            exit 0
        }
        catch {
            Write-Host "⚠️  Seeding completed but login still fails" -ForegroundColor Yellow
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Manual intervention may be required" -ForegroundColor Yellow
            exit 1
        }
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
        }
        
        if ($statusCode -eq 404) {
            Write-Host "  ⏳ Endpoint not found yet (404) - deployment still in progress..." -ForegroundColor Yellow
        }
        else {
            Write-Host "  ⏳ Waiting for deployment..." -ForegroundColor Yellow
        }
        
        if ($attempt -lt $maxAttempts) {
            Write-Host "  Retrying in 15 seconds..." -ForegroundColor Gray
            Start-Sleep -Seconds 15
        }
    }
}

Write-Host "`n" + "=" * 70 -ForegroundColor Red
Write-Host "❌ TIMEOUT: Deployment took longer than expected" -ForegroundColor Red
Write-Host "=" * 70 -ForegroundColor Red
Write-Host "`nPlease:" -ForegroundColor Yellow
Write-Host "1. Check Render dashboard for deployment status"
Write-Host "2. Look for errors in Render logs"
Write-Host "3. Try calling https://aqi-monitoring-app1.onrender.com/seed-now manually"
Write-Host "4. Run .\test_production_login.ps1 to test credentials"

exit 1
