# PowerShell script to train ML models
# Run this from FullStackBackend/ml directory

Write-Host "🤖 AQI ML Model Training Script" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

# Check if we're in the right directory
if (-not (Test-Path "aqi_ml_pipeline.py")) {
    Write-Host "❌ Error: aqi_ml_pipeline.py not found" -ForegroundColor Red
    Write-Host "Please run this script from FullStackBackend/ml directory" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📦 Checking dependencies..." -ForegroundColor Yellow

# Check if virtual environment exists
if (Test-Path "../venv") {
    Write-Host "✅ Virtual environment found" -ForegroundColor Green
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & "../venv/Scripts/Activate.ps1"
} else {
    Write-Host "⚠️  No virtual environment found" -ForegroundColor Yellow
    Write-Host "Using global Python installation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Installing/Updating ML dependencies..." -ForegroundColor Yellow
pip install scikit-learn pandas numpy matplotlib seaborn --quiet

Write-Host ""
Write-Host "🚀 Starting ML Pipeline..." -ForegroundColor Cyan
Write-Host "This will take 2-5 minutes..." -ForegroundColor Yellow
Write-Host ""

# Run the ML pipeline
python aqi_ml_pipeline.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ SUCCESS! ML models trained successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📁 Generated Files:" -ForegroundColor Cyan
    Write-Host "   - data/nashik_aqi_cleaned.csv" -ForegroundColor White
    Write-Host "   - models/aqi_regressor.pkl" -ForegroundColor White
    Write-Host "   - models/aqi_classifier.pkl" -ForegroundColor White
    Write-Host "   - models/label_encoder.pkl" -ForegroundColor White
    Write-Host "   - models/model_metadata.json" -ForegroundColor White
    Write-Host "   - plots/*.png" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Start backend: cd .. && uvicorn app.main:app --reload" -ForegroundColor Yellow
    Write-Host "   2. Visit: http://localhost:8000/docs" -ForegroundColor Yellow
    Write-Host "   3. Test ML endpoints" -ForegroundColor Yellow
    Write-Host "   4. Open mobile app → Admin → Predictions" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Error: ML pipeline failed" -ForegroundColor Red
    Write-Host "Please check the error messages above" -ForegroundColor Yellow
    exit 1
}
