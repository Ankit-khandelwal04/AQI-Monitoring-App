# Switch Mobile App to Production Backend (Render)

Write-Host "🔄 Switching to PRODUCTION backend..." -ForegroundColor Cyan

$envFile = "FullStackMobile/.env"

# Read current content
$content = Get-Content $envFile -Raw

# Uncomment production URL
$content = $content -replace '# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com', 'EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com'

# Comment out local URL
$content = $content -replace 'EXPO_PUBLIC_API_URL=http://192.168.67.66:8000', '# EXPO_PUBLIC_API_URL=http://192.168.67.66:8000'

# Write back
Set-Content $envFile $content

Write-Host "✅ Switched to PRODUCTION backend: https://aqi-monitoring-app1.onrender.com" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "  1. Restart Expo: expo start -c" -ForegroundColor White
Write-Host "  2. Rebuild APK if needed: eas build --platform android --profile production" -ForegroundColor White
Write-Host "  3. Login with: admin@nashikaqi.in / admin@123" -ForegroundColor White
