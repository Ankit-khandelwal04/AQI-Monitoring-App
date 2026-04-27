# Build APK Script for AQI Monitoring App
# This script guides you through building the production APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  AQI Monitoring App - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if EAS CLI is installed
Write-Host "[1/5] Checking EAS CLI installation..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
    Write-Host "✅ EAS CLI installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✅ EAS CLI is already installed" -ForegroundColor Green
}
Write-Host ""

# Step 2: Check login status
Write-Host "[2/5] Checking Expo login status..." -ForegroundColor Yellow
$loginStatus = eas whoami 2>&1
if ($loginStatus -match "Not logged in") {
    Write-Host "❌ Not logged in to Expo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login to Expo:" -ForegroundColor Cyan
    Write-Host "  1. If you don't have an account, create one at: https://expo.dev/signup" -ForegroundColor White
    Write-Host "  2. Run this command to login:" -ForegroundColor White
    Write-Host "     eas login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "After logging in, run this script again." -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ Logged in as: $loginStatus" -ForegroundColor Green
}
Write-Host ""

# Step 3: Check configuration files
Write-Host "[3/5] Checking configuration files..." -ForegroundColor Yellow
if (Test-Path "app.json") {
    Write-Host "✅ app.json found" -ForegroundColor Green
} else {
    Write-Host "❌ app.json not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path "eas.json") {
    Write-Host "✅ eas.json found" -ForegroundColor Green
} else {
    Write-Host "❌ eas.json not found!" -ForegroundColor Red
    exit 1
}

if (Test-Path ".env") {
    Write-Host "✅ .env found" -ForegroundColor Green
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "aqi-monitoring-app1.onrender.com") {
        Write-Host "✅ Backend URL configured correctly" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Backend URL might not be set correctly" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  .env not found (using default configuration)" -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Show build options
Write-Host "[4/5] Build Configuration" -ForegroundColor Yellow
Write-Host "Backend URL: https://aqi-monitoring-app1.onrender.com" -ForegroundColor Cyan
Write-Host "App Name: AQI Monitoring Nashik" -ForegroundColor Cyan
Write-Host "Package: com.nashik.aqimonitoring" -ForegroundColor Cyan
Write-Host "Version: 1.0.0" -ForegroundColor Cyan
Write-Host ""

# Step 5: Build options
Write-Host "[5/5] Ready to build!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Choose build profile:" -ForegroundColor Cyan
Write-Host "  1. Production (Recommended) - Optimized, smallest size" -ForegroundColor White
Write-Host "  2. Preview - Quick testing build" -ForegroundColor White
Write-Host "  3. Development - With dev tools" -ForegroundColor White
Write-Host "  4. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Building PRODUCTION APK..." -ForegroundColor Green
        Write-Host "This will take 10-20 minutes. Please wait..." -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile production
    }
    "2" {
        Write-Host ""
        Write-Host "🚀 Building PREVIEW APK..." -ForegroundColor Green
        Write-Host "This will take 10-20 minutes. Please wait..." -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile preview
    }
    "3" {
        Write-Host ""
        Write-Host "🚀 Building DEVELOPMENT APK..." -ForegroundColor Green
        Write-Host "This will take 10-20 minutes. Please wait..." -ForegroundColor Yellow
        Write-Host ""
        eas build --platform android --profile development
    }
    "4" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Build started! Check progress at:" -ForegroundColor Green
Write-Host "https://expo.dev/accounts/[your-account]/builds" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
