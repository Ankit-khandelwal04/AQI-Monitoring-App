# Render Deployment Fix Guide

## Issue
Render couldn't find `requirements.txt` because it was looking in the root directory, but the file is in `FullStackBackend/` subdirectory.

## Solution
Use `render.yaml` to specify the correct root directory.

---

## ✅ Fixed Configuration

A `render.yaml` file has been created in the root directory with the correct configuration.

---

## 🚀 Deployment Steps (Updated)

### Method 1: Using render.yaml (Automatic - Recommended)

#### Step 1: Push Changes to GitHub
The `render.yaml` file is now in your repository. Push it:

```bash
git add render.yaml
git commit -m "Add render.yaml for automatic deployment"
git push origin main
```

#### Step 2: Create New Web Service on Render
1. Go to https://render.com/dashboard
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `AQI-Monitoring-App`
4. Render will **automatically detect** `render.yaml`
5. Click "Apply" to use the configuration
6. The service will be created with all settings from `render.yaml`

#### Step 3: Create PostgreSQL Database (if not already created)
1. Click "New +" → "PostgreSQL"
2. Name: `aqi-postgres`
3. Database: `aqi_db`
4. Plan: Free
5. Click "Create Database"

#### Step 4: Link Database to Web Service
The `render.yaml` already references the database, so it will auto-link!

#### Step 5: Add Additional Environment Variables (Optional)
If you need Google Maps API key:
1. Go to your web service
2. Click "Environment" tab
3. Add:
```
GOOGLE_MAPS_API_KEY=your-api-key-here
```

#### Step 6: Deploy
Render will automatically deploy! Wait 5-10 minutes.

---

### Method 2: Manual Configuration (If render.yaml doesn't work)

#### Step 1: Create PostgreSQL Database First
1. Go to https://render.com/dashboard
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `aqi-postgres`
   - **Database**: `aqi_db`
   - **User**: `postgres`
   - **Plan**: Free
4. Click "Create Database"
5. **Copy the "Internal Database URL"** (starts with `postgresql://`)

#### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. **IMPORTANT**: Configure these settings:

**Basic Settings:**
- **Name**: `aqi-monitoring-api`
- **Region**: Oregon (US West)
- **Branch**: `main`
- **Root Directory**: `FullStackBackend` ⚠️ **THIS IS CRITICAL!**
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Advanced Settings:**
- **Plan**: Free
- **Auto-Deploy**: Yes (optional)

#### Step 3: Add Environment Variables
Click "Environment" tab and add:

```
DATABASE_URL=<paste-internal-database-url-from-step-1>
SECRET_KEY=your-super-secret-key-change-this-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=*
PYTHON_VERSION=3.11.0
```

**Important**: 
- Replace `<paste-internal-database-url-from-step-1>` with actual URL
- Generate a strong SECRET_KEY (use: `openssl rand -hex 32`)

#### Step 4: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait 5-10 minutes for build
3. Check logs for any errors

---

## 🔧 After Deployment

### Step 1: Run Database Migrations
1. Go to your web service on Render
2. Click "Shell" tab (top right)
3. Run these commands:

```bash
# Run migrations
alembic upgrade head

# Seed database with initial data
python scripts/seed_db.py

# Train ML models (optional, takes 2-3 minutes)
python ml/aqi_ml_pipeline.py
```

### Step 2: Test Your API
Visit these URLs (replace with your actual URL):

```
https://aqi-monitoring-api-xxxx.onrender.com/health
https://aqi-monitoring-api-xxxx.onrender.com/docs
```

You should see:
- `/health` returns: `{"status":"success","data":{"healthy":true}}`
- `/docs` shows the API documentation

### Step 3: Test Login
```bash
curl -X POST https://your-app.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nashikaqi.in","password":"Admin@123"}'
```

Should return a token!

---

## 🐛 Common Issues & Solutions

### Issue 1: "Could not open requirements file"
**Cause**: Root directory not set correctly

**Solution**:
- In Render dashboard, go to Settings
- Set **Root Directory** to: `FullStackBackend`
- Click "Save Changes"
- Trigger manual deploy

### Issue 2: "Module not found" errors
**Cause**: Dependencies not installed correctly

**Solution**:
- Check build logs for errors
- Ensure `requirements.txt` has all dependencies
- Try clearing build cache: Settings → "Clear build cache & deploy"

### Issue 3: "Database connection failed"
**Cause**: DATABASE_URL not set or incorrect

**Solution**:
- Go to Environment tab
- Check DATABASE_URL is set
- Should look like: `postgresql://user:password@host/database`
- Use **Internal Database URL** from your Render PostgreSQL

### Issue 4: "Port already in use"
**Cause**: Not using Render's $PORT variable

**Solution**:
- Ensure start command uses `$PORT`: 
- `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Issue 5: Python version mismatch
**Cause**: Using Python 3.14 (too new, some packages incompatible)

**Solution**:
- Add environment variable: `PYTHON_VERSION=3.11.0`
- Redeploy

### Issue 6: "Build takes too long / times out"
**Cause**: Installing ML packages (numpy, pandas, scikit-learn) takes time

**Solution**:
- This is normal, wait 10-15 minutes
- Free tier has longer build times
- Consider upgrading to paid plan if needed

---

## 📋 Deployment Checklist

Before deploying, ensure:

- [ ] `render.yaml` is in root directory (or Root Directory set to `FullStackBackend`)
- [ ] `requirements.txt` exists in `FullStackBackend/`
- [ ] PostgreSQL database created on Render
- [ ] DATABASE_URL environment variable set
- [ ] SECRET_KEY environment variable set
- [ ] PYTHON_VERSION set to 3.11.0
- [ ] Start command uses `$PORT` variable
- [ ] Repository is public or Render has access

After deployment:

- [ ] Build completed successfully
- [ ] Service is running (green status)
- [ ] `/health` endpoint returns 200
- [ ] `/docs` shows API documentation
- [ ] Database migrations run successfully
- [ ] Database seeded with initial data
- [ ] Login endpoint works
- [ ] ML models trained (optional)

---

## 🎯 Quick Fix Commands

If you're already on Render and getting errors:

### Fix 1: Update Root Directory
```
Settings → Root Directory → FullStackBackend → Save Changes → Manual Deploy
```

### Fix 2: Set Python Version
```
Environment → Add Variable:
PYTHON_VERSION=3.11.0
→ Save → Manual Deploy
```

### Fix 3: Clear Cache and Rebuild
```
Settings → Clear build cache & deploy
```

---

## 📊 Expected Build Output

Successful build should show:

```
==> Cloning from https://github.com/Ankit-khandelwal04/AQI-Monitoring-App
==> Checking out commit...
==> Using Python version 3.11.0
==> Running build command 'pip install -r requirements.txt'...
Successfully installed fastapi-0.115.5 uvicorn-0.32.1 ...
==> Build succeeded 🎉
==> Starting service with 'uvicorn app.main:app --host 0.0.0.0 --port $PORT'...
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:10000
```

---

## 🔄 Updating Your Deployment

### Update Code
```bash
# Make changes to your code
git add .
git commit -m "Update backend"
git push origin main
```

Render will auto-deploy if enabled!

### Update Environment Variables
1. Go to Environment tab
2. Edit or add variables
3. Click "Save Changes"
4. Service will automatically restart

### Update Database
```bash
# In Render Shell
alembic upgrade head
```

---

## 💡 Pro Tips

1. **Use render.yaml**: Easier to manage and version control
2. **Monitor logs**: Check logs regularly for errors
3. **Set up alerts**: Render can email you on deploy failures
4. **Use Internal URLs**: For database connections within Render
5. **Free tier sleeps**: First request after 15 min takes 30 seconds
6. **Upgrade for production**: $7/month for always-on service

---

## 🌐 Your API URLs

After successful deployment:

- **Base URL**: `https://aqi-monitoring-api-xxxx.onrender.com`
- **Health Check**: `https://aqi-monitoring-api-xxxx.onrender.com/health`
- **API Docs**: `https://aqi-monitoring-api-xxxx.onrender.com/docs`
- **Login**: `https://aqi-monitoring-api-xxxx.onrender.com/auth/login`
- **Zones**: `https://aqi-monitoring-api-xxxx.onrender.com/map/zones`

---

## 📱 Connect Mobile App

After backend is deployed:

1. Copy your Render URL
2. Update `FullStackMobile/.env`:
```
EXPO_PUBLIC_API_URL=https://aqi-monitoring-api-xxxx.onrender.com
```
3. Rebuild APK:
```bash
cd FullStackMobile
eas build --platform android --profile production
```

---

## ✅ Success Indicators

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Service shows "Live" status (green)
- ✅ Health endpoint returns 200
- ✅ API docs are accessible
- ✅ Login works and returns token
- ✅ Database queries work
- ✅ No errors in logs

---

## 📞 Need More Help?

- **Render Docs**: https://render.com/docs
- **Render Community**: https://community.render.com
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/

---

## 🎉 Next Steps

Once deployed:

1. Test all API endpoints
2. Update mobile app with backend URL
3. Build and test APK
4. Monitor logs for errors
5. Set up database backups
6. Consider upgrading to paid plan for production

Your backend is now live and ready to serve your mobile app! 🚀
