# Check if Render deployment is complete
$url = "https://aqi-monitoring-app1.onrender.com/seed-now"

Write-Host "Checking if deployment is ready..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Get
    Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "`nRun this command to seed the database:" -ForegroundColor Yellow
    Write-Host "  .\seed_production.ps1" -ForegroundColor White
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 404) {
        Write-Host "`n⏳ Still deploying (404 Not Found)" -ForegroundColor Yellow
        Write-Host "Wait 1-2 more minutes and try again" -ForegroundColor Gray
    }
    else {
        Write-Host "`n⏳ Status: $statusCode" -ForegroundColor Yellow
    }
}
