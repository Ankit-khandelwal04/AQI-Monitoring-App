# Recreate Virtual Environment - Clean Installation
# This is the most reliable way to fix binary dependency issues

Write-Host "🔄 Recreating Virtual Environment..." -ForegroundColor Cyan
Write-Host "="*60

# Make sure we're in the right directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Step 1: Deactivate if active
Write-Host "`n📤 Step 1: Deactivating virtual environment..." -ForegroundColor Yellow
if ($env:VIRTUAL_ENV) {
    deactivate 2>$null
    Write-Host "   ✅ Deactivated" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Not currently activated" -ForegroundColor Gray
}

# Step 2: Backup .env file
Write-Host "`n💾 Step 2: Backing up .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Copy-Item ".env" ".env.backup" -Force
    Write-Host "   ✅ Backed up to .env.backup" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No .env file to backup" -ForegroundColor Gray
}

# Step 3: Remove old venv
Write-Host "`n🗑️  Step 3: Removing old virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "   Deleting venv folder (this may take a moment)..." -ForegroundColor Gray
    Remove-Item -Recurse -Force venv -ErrorAction SilentlyContinue
    
    # Wait a bit for file system
    Start-Sleep -Seconds 2
    
    if (Test-Path "venv") {
        Write-Host "   ⚠️  Could not delete venv. Close any programs using it and try again." -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Removed old venv" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  No existing venv found" -ForegroundColor Gray
}

# Step 4: Create new venv
Write-Host "`n🆕 Step 4: Creating new virtual environment..." -ForegroundColor Yellow
python -m venv venv

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to create venv. Check Python installation." -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Created new venv" -ForegroundColor Green

# Step 5: Activate new venv
Write-Host "`n🔌 Step 5: Activating new virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

if (-not $env:VIRTUAL_ENV) {
    Write-Host "   ❌ Failed to activate venv" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Activated: $env:VIRTUAL_ENV" -ForegroundColor Green

# Step 6: Upgrade pip
Write-Host "`n⬆️  Step 6: Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip setuptools wheel
Write-Host "   ✅ Upgraded pip" -ForegroundColor Green

# Step 7: Install dependencies
Write-Host "`n📥 Step 7: Installing dependencies from requirements.txt..." -ForegroundColor Yellow
Write-Host "   This will take a few minutes..." -ForegroundColor Gray
python -m pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Installed all dependencies" -ForegroundColor Green

# Step 8: Verify installation
Write-Host "`n✅ Step 8: Verifying installation..." -ForegroundColor Green

$verifyScript = @"
import sys
dependencies = [
    ('pydantic', 'Pydantic'),
    ('pydantic_core', 'Pydantic Core'),
    ('fastapi', 'FastAPI'),
    ('sqlalchemy', 'SQLAlchemy'),
    ('psycopg2', 'psycopg2'),
    ('uvicorn', 'Uvicorn'),
    ('alembic', 'Alembic'),
]

all_ok = True
for module_name, display_name in dependencies:
    try:
        module = __import__(module_name)
        version = getattr(module, '__version__', 'unknown')
        print(f'   ✅ {display_name}: {version}')
    except ImportError as e:
        print(f'   ❌ {display_name}: FAILED')
        all_ok = False

sys.exit(0 if all_ok else 1)
"@

python -c $verifyScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 SUCCESS! Virtual environment recreated successfully!" -ForegroundColor Green
    Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Make sure PostgreSQL is running" -ForegroundColor White
    Write-Host "   2. Check your .env file has correct DATABASE_URL" -ForegroundColor White
    Write-Host "   3. Start backend:" -ForegroundColor White
    Write-Host "      uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Yellow
} else {
    Write-Host "`n⚠️  Some dependencies failed to install" -ForegroundColor Red
    Write-Host "   Check the error messages above" -ForegroundColor Yellow
}

Write-Host "`n" + ("="*60)
