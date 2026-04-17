@echo off
echo ========================================
echo Fixing Backend Dependencies
echo ========================================

cd /d "%~dp0"

echo.
echo Step 1: Removing old venv...
rmdir /s /q venv 2>nul
if exist venv (
    echo WARNING: Could not delete venv. Please close any programs using it.
    echo Then run this script again.
    pause
    exit /b 1
)
echo OK: Old venv removed

echo.
echo Step 2: Creating new virtual environment...
python -m venv venv
if errorlevel 1 (
    echo ERROR: Failed to create venv
    pause
    exit /b 1
)
echo OK: New venv created

echo.
echo Step 3: Activating venv and upgrading pip...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip setuptools wheel
echo OK: Pip upgraded

echo.
echo Step 4: Installing dependencies (this will take a few minutes)...
python -m pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo OK: Dependencies installed

echo.
echo Step 5: Verifying installation...
python -c "import pydantic, psycopg2, fastapi, sqlalchemy; print('SUCCESS: All dependencies working!')"
if errorlevel 1 (
    echo ERROR: Some dependencies failed
    pause
    exit /b 1
)

echo.
echo ========================================
echo SUCCESS! Backend is ready!
echo ========================================
echo.
echo Start your backend with:
echo uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
echo.
pause
