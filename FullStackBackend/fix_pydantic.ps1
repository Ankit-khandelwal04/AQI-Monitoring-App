# Fix Pydantic Core Installation Issue
# This script reinstalls pydantic and pydantic-core to fix the binary extension issue

Write-Host "🔧 Fixing Pydantic Core Installation..." -ForegroundColor Cyan

# Activate virtual environment
Write-Host "`n📦 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Uninstall pydantic packages completely
Write-Host "`n🗑️  Uninstalling pydantic packages..." -ForegroundColor Yellow
pip uninstall -y pydantic pydantic-core pydantic-settings

# Clear pip cache for pydantic
Write-Host "`n🧹 Clearing pip cache..." -ForegroundColor Yellow
pip cache remove pydantic*

# Reinstall pydantic with specific versions
Write-Host "`n📥 Reinstalling pydantic packages..." -ForegroundColor Yellow
pip install --no-cache-dir pydantic==2.10.3
pip install --no-cache-dir pydantic-settings==2.6.1
pip install --no-cache-dir "pydantic[email]==2.10.3"

# Verify installation
Write-Host "`n✅ Verifying installation..." -ForegroundColor Green
python -c "import pydantic; import pydantic_core; print(f'Pydantic: {pydantic.__version__}'); print(f'Pydantic Core: {pydantic_core.__version__}')"

Write-Host "`n🎉 Done! Try starting the backend now with:" -ForegroundColor Green
Write-Host "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Cyan
