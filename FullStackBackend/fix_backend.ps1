# Fix Backend Dependencies - Handles paths with spaces correctly
# This script fixes psycopg2 and other binary extension issues

Write-Host "🔧 Fixing Backend Dependencies..." -ForegroundColor Cyan
Write-Host "="*60

# Make sure we're in the right directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "`n⚠️  Virtual environment not activated. Activating now..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

Write-Host "`n📍 Using Python: $((Get-Command python).Source)" -ForegroundColor Cyan
Write-Host "📍 Virtual Environment: $env:VIRTUAL_ENV" -ForegroundColor Cyan

# Step 1: Upgrade pip, setuptools, and wheel
Write-Host "`n📦 Step 1: Upgrading pip, setuptools, and wheel..." -ForegroundColor Yellow
python -m pip install --upgrade pip setuptools wheel

# Step 2: Uninstall psycopg2
Write-Host "`n🗑️  Step 2: Uninstalling psycopg2..." -ForegroundColor Yellow
python -m pip uninstall -y psycopg2-binary psycopg2 2>$null

# Step 3: Clear pip cache
Write-Host "`n🧹 Step 3: Clearing pip cache..." -ForegroundColor Yellow
python -m pip cache remove psycopg2* 2>$null

# Step 4: Reinstall psycopg2-binary
Write-Host "`n📥 Step 4: Reinstalling psycopg2-binary..." -ForegroundColor Yellow
python -m pip install --no-cache-dir --force-reinstall psycopg2-binary==2.9.10

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Failed with specific version. Trying latest..." -ForegroundColor Yellow
    python -m pip install --no-cache-dir --force-reinstall psycopg2-binary
}

# Step 5: Verify installation
Write-Host "`n✅ Step 5: Verifying installation..." -ForegroundColor Green

$verifyScript = @"
try:
    import pydantic
    import pydantic_core
    import fastapi
    import sqlalchemy
    import psycopg2
    print('✅ All dependencies verified!')
    print(f'   Pydantic: {pydantic.__version__}')
    print(f'   Pydantic Core: {pydantic_core.__version__}')
    print(f'   FastAPI: {fastapi.__version__}')
    print(f'   SQLAlchemy: {sqlalchemy.__version__}')
    print(f'   psycopg2: {psycopg2.__version__}')
    exit(0)
except ImportError as e:
    print(f'❌ Import failed: {e}')
    exit(1)
"@

$result = python -c $verifyScript

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 SUCCESS! Backend is ready!" -ForegroundColor Green
    Write-Host "`n🚀 Start your backend with:" -ForegroundColor Cyan
    Write-Host "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some dependencies still failing." -ForegroundColor Red
    Write-Host "`n🔄 Recommended: Recreate virtual environment" -ForegroundColor Yellow
    Write-Host "   1. deactivate" -ForegroundColor White
    Write-Host "   2. Remove-Item -Recurse -Force venv" -ForegroundColor White
    Write-Host "   3. python -m venv venv" -ForegroundColor White
    Write-Host "   4. .\venv\Scripts\Activate.ps1" -ForegroundColor White
    Write-Host "   5. pip install -r requirements.txt" -ForegroundColor White
}

Write-Host "`n" + ("="*60)
