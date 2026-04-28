# 🌱 Seed Database - Free Tier Solution

## Problem
Render's free tier doesn't have Shell access, so we can't run seed scripts directly.

## ✅ Solution
I've created a special API endpoint that you can call from your browser to seed the database!

---

## 🚀 How to Seed the Database (2 Steps)

### Step 1: Check Database Status

Open this URL in your browser:
```
https://aqi-monitoring-app1.onrender.com/setup/check-database
```

This will show you:
- How many users exist
- How many zones exist
- If database is ready

**Expected response (before seeding):**
```json
{
  "status": "success",
  "data": {
    "users": 0,
    "cities": 0,
    "zones": 0,
    "readings": 0,
    "alerts": 0,
    "user_list": [],
    "database_ready": false
  }
}
```

### Step 2: Seed the Database

Open this URL in your browser:
```
https://aqi-monitoring-app1.onrender.com/setup/seed-database
```

**Note:** This is a POST request, so you have two options:

#### Option A: Use Swagger UI (Easiest)

1. Go to: https://aqi-monitoring-app1.onrender.com/docs
2. Scroll down to **"Setup"** section
3. Click on **"POST /setup/seed-database"**
4. Click **"Try it out"**
5. Click **"Execute"**
6. Wait for response (10-30 seconds)

#### Option B: Use curl (Terminal)

```bash
curl -X POST https://aqi-monitoring-app1.onrender.com/setup/seed-database
```

#### Option C: Use Postman

1. Create new POST request
2. URL: `https://aqi-monitoring-app1.onrender.com/setup/seed-database`
3. Click "Send"

---

## ✅ Expected Response

After seeding, you should see:

```json
{
  "status": "success",
  "data": {
    "users_created": 3,
    "city_created": true,
    "zones_created": 6,
    "readings_created": 252,
    "alerts_created": 2,
    "message": "✅ Created 3 users. ✅ Created Nashik city. ✅ Created 6 zones. ✅ Created 252 AQI readings. ✅ Created 2 alerts.",
    "credentials": {
      "admin": {
        "email": "admin@nashikaqi.in",
        "password": "admin@123"
      },
      "users": [
        {
          "email": "ankit@nashikaqi.in",
          "password": "user@1234"
        },
        {
          "email": "priya@nashikaqi.in",
          "password": "user@1234"
        }
      ]
    }
  }
}
```

---

## 🔑 Login Credentials

After seeding, use these credentials in your app:

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

## 🔄 Safe to Run Multiple Times

The endpoint is **idempotent**, meaning:
- ✅ Safe to call multiple times
- ✅ Won't create duplicate users
- ✅ Won't create duplicate zones
- ✅ Will only add missing data

If you run it again, you'll see:
```json
{
  "message": "Database already seeded. No changes made."
}
```

---

## 🧪 Verify It Worked

### Test 1: Check Database Again
```
https://aqi-monitoring-app1.onrender.com/setup/check-database
```

Should now show:
```json
{
  "users": 3,
  "zones": 6,
  "database_ready": true
}
```

### Test 2: Try Login API
```bash
curl -X POST https://aqi-monitoring-app1.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nashikaqi.in",
    "password": "admin@123"
  }'
```

Should return a token! ✅

### Test 3: Login in Mobile App
1. Open your app
2. Email: `admin@nashikaqi.in`
3. Password: `admin@123`
4. Should work! 🎉

---

## 📊 What Gets Created

The seed endpoint creates:

### Users (3)
- 1 Admin account
- 2 User accounts

### City (1)
- Nashik with coordinates

### Zones (6)
- Cidco
- Nashik Road
- College Road
- Gangapur Road
- Satpur
- Panchavati

### AQI Readings (~250)
- 7 days of historical data
- Every 2 hours
- Realistic values with daily patterns

### Alerts (2)
- Sample alerts for high AQI zones

---

## 🐛 Troubleshooting

### Issue: "502 Bad Gateway" or timeout
**Cause**: Backend is waking up from sleep (free tier)

**Solution**: 
- Wait 60 seconds
- Try again
- First request after sleep takes longer

### Issue: "Database connection failed"
**Cause**: DATABASE_URL not set in Render

**Solution**:
1. Go to Render dashboard
2. Check Environment variables
3. Ensure DATABASE_URL is set
4. Restart service

### Issue: Endpoint returns error
**Cause**: Database tables don't exist

**Solution**:
The endpoint will try to create tables automatically. If it fails:
1. Check Render logs for errors
2. Verify PostgreSQL database is running
3. Check DATABASE_URL is correct

---

## 🔒 Security Note

⚠️ **Important**: This endpoint should be disabled in production after initial setup.

For now, it's safe because:
- It's idempotent (won't create duplicates)
- It only creates data if missing
- No authentication required (for initial setup only)

After seeding, you can optionally remove this endpoint or add authentication.

---

## ✅ Quick Summary

1. **Check status**: https://aqi-monitoring-app1.onrender.com/setup/check-database
2. **Seed database**: https://aqi-monitoring-app1.onrender.com/docs → Execute POST /setup/seed-database
3. **Login**: Use `admin@nashikaqi.in` / `admin@123`

That's it! No Shell access needed! 🚀

---

## 📞 Next Steps

After seeding:
1. ✅ Verify users were created
2. ✅ Test login API
3. ✅ Login in mobile app
4. ✅ Check dashboard loads data
5. ✅ Test all features

Good luck! 🎊
