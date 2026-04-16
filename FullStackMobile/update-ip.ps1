# PowerShell script to automatically update API URL when WiFi changes
# Usage: .\update-ip.ps1

Write-Host "🔍 Detecting current IP address..." -ForegroundColor Cyan

# Get the current WiFi IP address
$ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Wi-Fi" -ErrorAction SilentlyContinue).IPAddress

if (-not $ip) {
    # Try Ethernet if WiFi not found
    $ip = (Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet" -ErrorAction SilentlyContinue).IPAddress
}

if (-not $ip) {
    Write-Host "❌ Could not detect IP address" -ForegroundColor Red
    Write-Host "Please run 'ipconfig' manually and update .env file" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Detected IP: $ip" -ForegroundColor Green

# Update .env file
$envPath = ".env"
$apiUrl = "EXPO_PUBLIC_API_URL=http://${ip}:8000"

Set-Content -Path $envPath -Value $apiUrl

Write-Host "✅ Updated .env file" -ForegroundColor Green
Write-Host ""
Write-Host "📝 New configuration:" -ForegroundColor Cyan
Write-Host "   API URL: http://${ip}:8000" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart frontend: npx expo start --clear" -ForegroundColor White
Write-Host "   2. Ensure backend is running on 0.0.0.0:8000" -ForegroundColor White
Write-Host ""
