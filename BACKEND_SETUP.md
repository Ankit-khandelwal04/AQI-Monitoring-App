# Backend Setup & Troubleshooting Guide

## Quick Start

### Start Backend Server
```powershell
cd FullStackBackend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Common Issues & Solutions

### Issue 1: Binary Extension Errors
If you see errors like:
- `ModuleNotFoundError: No module named 'pydantic_core._pydantic_core'`
- `ModuleNotFoundError: No module named 'psycopg2._psycopg'`

**Solution**: Recreate virtual environment
```powershell
cd FullStackBackend
.\recreate_venv.ps1
```

Or manually:
```powershell
# Remove old venv
Remove-Item -Recurse -Force venv

# Create new venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Issue 2: PostgreSQL Connection Error
**Solution**: Ensure PostgreSQL is running
```powershell
Get-Service -Name "*postgresql*"
Start-Service postgresql-x64-17
```

### Issue 3: Port 8000 Already in Use
**Solution**: Kill the process using port 8000
```powershell
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

## Fix Scripts Available

- `recreate_venv.ps1` - Recreate virtual environment (recommended)
- `fix_backend.ps1` - Fix dependencies in existing venv
- `fix_pydantic.py` - Fix pydantic issues specifically
- `fix_all_dependencies.py` - Comprehensive dependency fix
- `fix_now.bat` - Batch file for Windows CMD

## Default Credentials

### Admin
- Email: `admin@nashikaqi.in`
- Password: `admin@123`

### Users
- Email: `ankit@nashikaqi.in` / Password: `user@1234`
- Email: `priya@nashikaqi.in` / Password: `user@1234`

## Backend URLs

- Local: http://localhost:8000
- Network: http://192.168.0.244:8000 (update IP when WiFi changes)
- API Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health
