# PowerShell script to fix web bundle compilation errors
# This script clears all caches and restarts the web server

Write-Host "🔧 Fixing Web Bundle Compilation..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop any running processes
Write-Host "1️⃣  Stopping any running Expo processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {$_.Path -like "*expo*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Step 2: Clear all caches
Write-Host "2️⃣  Clearing all caches..." -ForegroundColor Yellow

if (Test-Path ".expo") {
    Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cleared .expo cache" -ForegroundColor Green
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force node_modules/.cache -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cleared node_modules/.cache" -ForegroundColor Green
}

if (Test-Path ".expo/web/cache") {
    Remove-Item -Recurse -Force .expo/web/cache -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cleared .expo/web/cache" -ForegroundColor Green
}

# Step 3: Clear npm cache
Write-Host "3️⃣  Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "   ✅ Cleared npm cache" -ForegroundColor Green

Write-Host ""
Write-Host "✅ All caches cleared!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Starting web server..." -ForegroundColor Cyan
Write-Host ""

# Step 4: Start web server with cleared cache
npx expo start --web --clear
