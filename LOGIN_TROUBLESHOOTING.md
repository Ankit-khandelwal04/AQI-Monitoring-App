# 🔧 Login Issue Troubleshooting Guide

## Problem: Unable to Login

This is likely because:
1. Backend database hasn't been seeded with user accounts
2. Backend is not accessible
3. Network connectivity issue

---

## ✅ Solution: Seed the Database

### Step 1: Check Backend is Running

Open this URL in your browser:
```
https://aqi-monitoring-app1.onrender.com/health
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "healthy": true
  }
}
```

If you see this, backend is running! ✅

If you get an error or timeout:
- Wait 30-60 seconds (free tier wakes up from sleep)
- Try again

---

### Step 2: Seed the Database (IMPORTANT!)

You need to run these commands in the **Render Shell**:

#### How to Access Render Shell:

1. Go to https://dashboard.render.com
2. Click on your web service: **aqi-monitoring-app1**
3. Click **"Shell"** tab (top right corner)
4. Wait for shell to load

#### Commands to Run:

```bash
# 1. Create database tables
alembic upgrade head

# 2. Seed database with users and data
python scripts/seed_db.py

# 3. (Optional) Train ML models
python ml/aqi_ml_pipeline.py
```

**Copy and paste each command one by one, wait for each to complete.**

---

### Step 3: Verify Users Were Created

In the Render Shell, run:

```bash
python -c "
from app.database.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
for user in users:
    print(f'Email: {user.email}, Role: {user.role}')
db.close()
"
```

**Expected output:**
```
Email: admin@nashikaqi.in, Role: admin
Email: ankit@nashikaqi.in, Role: user
Email: priya@nashikaqi.in, Role: user
```

---

### Step 4: Test Login from Mobile App

After seeding, try logging in again:

**Admin Account:**
- Email: `admin@nashikaqi.in`
- Password: `Admin@123` (capital A!)

**User Accounts:**
- Email: `ankit@nashikaqi.in`
- Password: `User@1234` (capital U!)

OR

- Email: `priya@nashikaqi.in`
- Password: `User@1234` (capital U!)

---

## 🔍 Additional Troubleshooting

### Issue 1: "Network Error" or "Cannot connect"

**Check:**
1. Is your phone connected to internet?
2. Try opening https://aqi-monitoring-app1.onrender.com/docs in phone browser
3. If it doesn't load, backend might be sleeping (wait 60 seconds)

**Solution:**
- Wait for backend to wake up (free tier sleeps after 15 min)
- First request takes 30-60 seconds

### Issue 2: "Invalid credentials"

**Check:**
1. Password is case-sensitive!
   - Admin password: `Admin@123` (capital A)
   - User password: `User@1234` (capital U)
2. No extra spaces in email or password
3. Email is exactly: `admin@nashikaqi.in`

**Solution:**
- Type carefully
- Copy-paste from this document

### Issue 3: "Server error" or 500 error

**Check:**
1. Database might not be seeded
2. Database tables might not exist

**Solution:**
- Run the seed commands in Render Shell (Step 2 above)

### Issue 4: Backend shows "Database connection failed"

**Check:**
1. Go to Render dashboard
2. Check if PostgreSQL database is running
3. Check environment variables

**Solution:**
1. Ensure `DATABASE_URL` is set in environment variables
2. Should be the Internal Database URL from your PostgreSQL service
3. Restart the web service

---

## 🧪 Test Backend Directly

### Test 1: Health Check
```bash
curl https://aqi-monitoring-app1.onrender.com/health
```

### Test 2: Login API
```bash
curl -X POST https://aqi-monitoring-app1.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nashikaqi.in",
    "password": "Admin@123"
  }'
```

**Expected response:**
```json
{
  "status": "success",
  "data": {
    "access_token": "eyJ...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "admin@nashikaqi.in",
      "role": "admin"
    }
  }
}
```

If you get a token, backend is working! ✅

---

## 📋 Quick Checklist

- [ ] Backend is running (health check returns 200)
- [ ] Database migrations run (`alembic upgrade head`)
- [ ] Database seeded (`python scripts/seed_db.py`)
- [ ] Users exist in database (verified with query)
- [ ] Phone has internet connection
- [ ] Using correct credentials (case-sensitive!)
- [ ] Backend URL in app is correct

---

## 🔄 If Still Not Working

### Option 1: Check App Logs

If you have access to Android Studio or adb:
```bash
adb logcat | grep -i "error\|exception"
```

### Option 2: Rebuild APK

If backend URL was wrong:
1. Verify `.env` has: `EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com`
2. Rebuild APK: `eas build --platform android --profile preview`
3. Install new APK

### Option 3: Check Render Logs

1. Go to Render dashboard
2. Click on your web service
3. Click "Logs" tab
4. Look for errors when you try to login

---

## 💡 Most Common Solution

**90% of the time, the issue is that the database hasn't been seeded.**

Run these commands in Render Shell:
```bash
alembic upgrade head
python scripts/seed_db.py
```

Then try logging in again! 🚀

---

## 📞 Need More Help?

If you're still stuck:
1. Check Render logs for errors
2. Verify backend health endpoint works
3. Test login API with curl (see Test 2 above)
4. Share the error message you see in the app

---

## ✅ Success Indicators

Login is working when:
- ✅ App shows loading spinner
- ✅ No error messages
- ✅ Redirects to dashboard
- ✅ Shows user name/email
- ✅ Data loads from backend

Good luck! 🎉
