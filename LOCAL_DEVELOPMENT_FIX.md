# 🔧 Local Development Login Fix

## Issues Found

1. ✅ **Mobile app is pointing to production** (Render) instead of local backend
2. ⚠️ **Local database might not have users** seeded
3. ✅ **IP address is correct**: `192.168.67.66`

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Update Mobile App to Use Local Backend

Edit `FullStackMobile/.env`:

```bash
# API Configuration
# Production Backend URL (Render) - COMMENT THIS OUT
# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com

# Local Development URL - UNCOMMENT THIS
EXPO_PUBLIC_API_URL=http://192.168.67.66:8000
```

**Or run this command:**
```powershell
cd FullStackMobile
(Get-Content .env) -replace '^EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com', '# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com' | Set-Content .env
Add-Content .env "`nEXPO_PUBLIC_API_URL=http://192.168.67.66:8000"
```

### Step 2: Seed Local Database

Run these commands in the backend directory:

```powershell
cd FullStackBackend

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Run migrations
alembic upgrade head

# Seed database with users
python scripts/seed.py
```

**Expected output:**
```
🌱 Starting seed...
  ✅ Created 3 users
  ✅ Created city: Nashik
  ✅ Created 6 zones
  ✅ Created XXX AQI readings
  ✅ Created 2 sample alerts

✅ Seed complete!

📋 Login credentials:
   Admin : admin@nashikaqi.in  / admin@123
   User  : ankit@nashikaqi.in  / user@1234
```

### Step 3: Restart Everything

**Backend:**
```powershell
cd FullStackBackend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Mobile App:**
```powershell
cd FullStackMobile
npm start
# Or: expo start
```

Then press `a` for Android or scan QR code.

---

## 🔑 Login Credentials (Local)

After seeding, use these credentials:

**Admin:**
- Email: `admin@nashikaqi.in`
- Password: `admin@123` (all lowercase!)

**User:**
- Email: `ankit@nashikaqi.in`
- Password: `user@1234` (all lowercase!)

---

## 🧪 Test Local Backend

### Test 1: Health Check
Open in browser:
```
http://192.168.67.66:8000/health
```

Should show:
```json
{
  "status": "success",
  "data": {
    "healthy": true
  }
}
```

### Test 2: API Docs
```
http://192.168.67.66:8000/docs
```

Should show Swagger UI.

### Test 3: Login API
```powershell
curl -X POST http://192.168.67.66:8000/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@nashikaqi.in\",\"password\":\"admin@123\"}'
```

Should return a token!

---

## 🔄 Switching Between Local and Production

### For Local Development:
```bash
# FullStackMobile/.env
EXPO_PUBLIC_API_URL=http://192.168.67.66:8000
```

### For Production (Render):
```bash
# FullStackMobile/.env
EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com
```

**Note:** After changing `.env`, restart Expo:
```powershell
# Stop Expo (Ctrl+C)
# Clear cache and restart
expo start -c
```

---

## 📊 Verify Database Has Users

Run this in backend directory:

```powershell
cd FullStackBackend
.\.venv\Scripts\Activate.ps1

python -c "from app.database.database import SessionLocal; from app.models.user import User; db = SessionLocal(); users = db.query(User).all(); print(f'Found {len(users)} users:'); [print(f'  - {u.email} ({u.role})') for u in users]; db.close()"
```

**Expected output:**
```
Found 3 users:
  - admin@nashikaqi.in (admin)
  - ankit@nashikaqi.in (user)
  - priya@nashikaqi.in (user)
```

If you see "Found 0 users", run `python scripts/seed.py`.

---

## 🐛 Common Issues

### Issue 1: "Network request failed"

**Cause:** Mobile app can't reach backend

**Check:**
1. Is backend running? Check terminal for "Uvicorn running on..."
2. Is phone on same WiFi as computer?
3. Is IP correct? Run `ipconfig` to verify
4. Is firewall blocking? Temporarily disable Windows Firewall

**Solution:**
```powershell
# Check if backend is accessible
curl http://192.168.67.66:8000/health
```

### Issue 2: "Invalid credentials"

**Cause:** Database not seeded or wrong password

**Solution:**
1. Run `python scripts/seed.py`
2. Use lowercase passwords: `admin@123` not `Admin@123`

### Issue 3: "Connection refused"

**Cause:** Backend not running or wrong port

**Solution:**
1. Start backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Check port 8000 is not in use: `netstat -ano | findstr :8000`

### Issue 4: "Database connection failed"

**Cause:** PostgreSQL not running

**Solution:**
1. Start PostgreSQL service
2. Check connection: `psql -U postgres -d aqi_db`

---

## 🔥 Quick Reset (If Nothing Works)

### 1. Reset Database
```powershell
cd FullStackBackend
.\.venv\Scripts\Activate.ps1

# Drop and recreate database
python -c "from app.database.database import engine, Base; Base.metadata.drop_all(engine); Base.metadata.create_all(engine)"

# Run migrations
alembic upgrade head

# Seed data
python scripts/seed.py
```

### 2. Clear Expo Cache
```powershell
cd FullStackMobile
expo start -c
```

### 3. Restart Backend
```powershell
cd FullStackBackend
.\.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Checklist

- [ ] Mobile `.env` points to local IP: `http://192.168.67.66:8000`
- [ ] Backend is running on `0.0.0.0:8000`
- [ ] PostgreSQL is running
- [ ] Database migrations run: `alembic upgrade head`
- [ ] Database seeded: `python scripts/seed.py`
- [ ] Backend health check works: `http://192.168.67.66:8000/health`
- [ ] Phone on same WiFi as computer
- [ ] Using correct passwords: `admin@123` (lowercase!)
- [ ] Expo cache cleared: `expo start -c`

---

## 🎯 Complete Setup Commands

Run these in order:

```powershell
# 1. Backend Setup
cd FullStackBackend
.\.venv\Scripts\Activate.ps1
alembic upgrade head
python scripts/seed.py

# 2. Start Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 3. In new terminal - Mobile App
cd FullStackMobile
# Update .env first!
expo start -c

# 4. Test
# Open http://192.168.67.66:8000/health in browser
# Login in app with: admin@nashikaqi.in / admin@123
```

---

## 📱 After Fix

Your app should:
- ✅ Connect to local backend
- ✅ Login successfully
- ✅ Load data from local database
- ✅ Show dashboard
- ✅ All features work

---

## 💡 Pro Tip

Create a script to switch between local and production:

**`switch-to-local.ps1`:**
```powershell
(Get-Content FullStackMobile/.env) -replace 'EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com', '# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com' | Set-Content FullStackMobile/.env
Add-Content FullStackMobile/.env "EXPO_PUBLIC_API_URL=http://192.168.67.66:8000"
Write-Host "✅ Switched to LOCAL backend"
```

**`switch-to-production.ps1`:**
```powershell
(Get-Content FullStackMobile/.env) -replace '# EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com', 'EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com' | Set-Content FullStackMobile/.env
(Get-Content FullStackMobile/.env) -replace 'EXPO_PUBLIC_API_URL=http://192.168.67.66:8000', '# EXPO_PUBLIC_API_URL=http://192.168.67.66:8000' | Set-Content FullStackMobile/.env
Write-Host "✅ Switched to PRODUCTION backend"
```

Good luck! 🚀
