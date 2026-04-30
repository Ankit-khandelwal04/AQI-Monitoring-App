# Switch Mobile App to Local Backend

Write-Host "🔄 Switching to LOCAL backend..." -ForegroundColor Cyan

$envFile = "FullStackMobile/.env"

# Read current content
$content = Get-Content $envFile -Raw

# Comment out production URL
$content = $content -replace 'EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com', '# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com'

# Uncomment local URL
$content = $content -replace '# EXPO_PUBLIC_API_URL=http://192.168.67.66:8000', 'EXPO_PUBLIC_API_URL=http://192.168.67.66:8000'

# Write back
Set-Content $envFile $content

Write-Host "✅ Switched to LOCAL backend: http://192.168.67.66:8000" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Make sure backend is running: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
Write-Host "  2. Restart Expo: expo start -c" -ForegroundColor White
Write-Host "  3. Login with: admin@nashikaqi.in / admin@123" -ForegroundColor White
