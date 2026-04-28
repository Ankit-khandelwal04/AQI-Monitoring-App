# 🔐 Login Fix - Complete Instructions

## ✅ Problem Identified!

The issue is that **users haven't been created in the database yet**. You need to run the seed script on Render.

---

## 🚀 Solution: Run Seed Script on Render

### Step 1: Access Render Shell

1. Go to https://dashboard.render.com
2. Click on your web service: **aqi-monitoring-app1**
3. Click **"Shell"** tab (top right corner)
4. Wait for the shell to load (shows `$` prompt)

### Step 2: Run These Commands

Copy and paste these commands **one by one** in the Render Shell:

```bash
# 1. Create database tables
alembic upgrade head
```

Wait for it to complete, then run:

```bash
# 2. Create users and seed data
python scripts/seed.py
```

You should see output like:
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

---

## 🔑 Correct Login Credentials

After running the seed script, use these credentials:

### Admin Account
- **Email**: `admin@nashikaqi.in`
- **Password**: `admin@123` (all lowercase!)

### User Accounts
- **Email**: `ankit@nashikaqi.in`
- **Password**: `user@1234` (all lowercase!)

OR

- **Email**: `priya@nashikaqi.in`
- **Password**: `user@1234` (all lowercase!)

---

## ⚠️ Important Notes

1. **Passwords are case-sensitive!**
   - Use `admin@123` NOT `Admin@123`
   - Use `user@1234` NOT `User@1234`

2. **No extra spaces**
   - Type carefully or copy-paste

3. **Email must be exact**
   - `admin@nashikaqi.in` (not .com!)

---

## 🧪 Test Backend First

Before trying the app, test the backend directly:

### Test 1: Health Check
Open in browser:
```
https://aqi-monitoring-app1.onrender.com/health
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

### Test 2: Login API
Run in terminal (or use Postman):
```bash
curl -X POST https://aqi-monitoring-app1.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nashikaqi.in",
    "password": "admin@123"
  }'
```

Should return a token:
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

## 📱 Try Login in App Again

After seeding the database:

1. **Open the app** on your phone
2. **Enter credentials**:
   - Email: `admin@nashikaqi.in`
   - Password: `admin@123` (lowercase!)
3. **Tap Login**
4. **Should work!** ✅

---

## 🔍 If Still Not Working

### Check 1: Backend Logs
1. Go to Render dashboard
2. Click "Logs" tab
3. Try to login from app
4. Watch for errors in logs

### Check 2: Network Connection
- Make sure phone has internet
- Try opening https://aqi-monitoring-app1.onrender.com/docs in phone browser
- If it doesn't load, wait 60 seconds (backend waking up from sleep)

### Check 3: App Configuration
Verify the app was built with correct backend URL:
- Should be: `https://aqi-monitoring-app1.onrender.com`
- No trailing slash
- HTTPS (not HTTP)

---

## 🔄 If You Need to Rebuild APK

If the backend URL was wrong in the APK:

1. **Check `.env` file**:
```bash
cd FullStackMobile
cat .env
```

Should show:
```
EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com
```

2. **Rebuild APK**:
```powershell
cd FullStackMobile
eas build --platform android --profile preview
```

3. **Download and install new APK**

---

## 📊 Verify Users in Database

To confirm users were created, run this in Render Shell:

```bash
python -c "
from app.database.database import SessionLocal
from app.models.user import User

db = SessionLocal()
users = db.query(User).all()
print(f'Found {len(users)} users:')
for user in users:
    print(f'  - {user.email} ({user.role})')
db.close()
"
```

Expected output:
```
Found 3 users:
  - admin@nashikaqi.in (admin)
  - ankit@nashikaqi.in (user)
  - priya@nashikaqi.in (user)
```

---

## ✅ Success Checklist

- [ ] Ran `alembic upgrade head` in Render Shell
- [ ] Ran `python scripts/seed.py` in Render Shell
- [ ] Saw "✅ Created 3 users" message
- [ ] Backend health check works
- [ ] Login API test returns token
- [ ] Using correct password: `admin@123` (lowercase!)
- [ ] Phone has internet connection
- [ ] App connects to backend

---

## 🎉 After Successful Login

Once logged in, you should see:
- ✅ Dashboard with real AQI data
- ✅ Maps with zones
- ✅ Historical data charts
- ✅ ML predictions
- ✅ User profile

---

## 💡 Quick Summary

**The fix:**
1. Run `alembic upgrade head` in Render Shell
2. Run `python scripts/seed.py` in Render Shell
3. Login with: `admin@nashikaqi.in` / `admin@123` (lowercase!)

That's it! 🚀

---

## 📞 Still Need Help?

If you're still stuck after following these steps:
1. Share the error message from the app
2. Check Render logs for errors
3. Verify backend health endpoint works
4. Test login API with curl

Good luck! 🎊
