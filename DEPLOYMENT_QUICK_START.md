# 🚀 Quick Deployment Guide - AQI Monitoring App

## Complete deployment in 30 minutes!

---

## Part 1: Host Your Backend (15 minutes)

### Using Render (Recommended - Free)

#### 1. Sign Up
- Go to https://render.com
- Sign up with GitHub

#### 2. Create PostgreSQL Database
- Click "New +" → "PostgreSQL"
- Name: `aqi-postgres`
- Plan: Free
- Click "Create Database"
- **Copy the "Internal Database URL"** (you'll need this!)

#### 3. Create Web Service
- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select `FullStackBackend` as root directory
- Configure:
  - **Name**: `aqi-monitoring-api`
  - **Environment**: Python 3
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Plan**: Free

#### 4. Add Environment Variables
In the web service, go to "Environment" tab and add:

```
DATABASE_URL=<paste-internal-database-url-from-step-2>
SECRET_KEY=my-super-secret-key-change-this-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=*
```

#### 5. Deploy
- Click "Manual Deploy" → "Deploy latest commit"
- Wait 5-10 minutes
- Your API will be at: `https://aqi-monitoring-api-xxxx.onrender.com`

#### 6. Setup Database
- Go to your web service
- Click "Shell" tab
- Run these commands:
```bash
alembic upgrade head
python scripts/seed_db.py
python ml/aqi_ml_pipeline.py
```

#### 7. Test Your Backend
Visit: `https://your-app-name.onrender.com/docs`

You should see the API documentation!

**✅ Backend is now live!**

**Your Backend URL**: `https://your-app-name.onrender.com`

---

## Part 2: Build Your APK (15 minutes)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Create a free account if you don't have one.

### 3. Update Backend URL
Edit `FullStackMobile/.env`:
```bash
EXPO_PUBLIC_API_URL=https://your-app-name.onrender.com
```
**Replace with your actual Render URL from Part 1!**

### 4. Navigate to Mobile App
```bash
cd FullStackMobile
```

### 5. Configure EAS (First Time Only)
```bash
eas build:configure
```
Press Enter to accept defaults.

### 6. Build APK
```bash
eas build --platform android --profile production
```

This will:
- Upload your code to Expo servers
- Build the APK in the cloud
- Take 10-20 minutes

### 7. Download APK
- EAS will provide a download link
- Click the link to download your APK
- Or check: https://expo.dev/accounts/[your-account]/projects/[your-project]/builds

### 8. Install on Android
- Transfer APK to your Android phone
- Enable "Install from Unknown Sources"
- Tap the APK to install
- Open the app and test!

**✅ APK is ready!**

---

## 🧪 Testing Your Deployment

### Test Backend
```bash
# Health check
curl https://your-app-name.onrender.com/health

# Login test
curl -X POST https://your-app-name.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nashikaqi.in","password":"Admin@123"}'
```

### Test Mobile App
1. Install APK on Android device
2. Open app
3. Login with:
   - **Email**: `admin@nashikaqi.in`
   - **Password**: `Admin@123` (capital A!)
4. Check if data loads
5. Test all features

---

## 🔧 Troubleshooting

### Backend Issues

**"Database connection failed"**
- Check `DATABASE_URL` in environment variables
- Make sure you copied the **Internal Database URL** from Render

**"Build failed"**
- Check build logs in Render dashboard
- Ensure `requirements.txt` is correct
- Try manual deploy again

**"API returns 500 error"**
- Check logs in Render dashboard
- Run migrations: `alembic upgrade head`
- Seed database: `python scripts/seed_db.py`

### Mobile App Issues

**"Unable to connect to backend"**
- Check `EXPO_PUBLIC_API_URL` in `.env`
- Make sure URL is correct (no trailing slash)
- Test backend URL in browser first

**"Build failed on EAS"**
- Check your Expo account has no issues
- Try: `eas build --platform android --profile preview` instead
- Check build logs on Expo dashboard

**"App crashes on startup"**
- Rebuild with correct backend URL
- Check backend is accessible
- Try development build first: `eas build --platform android --profile development`

---

## 📱 Sharing Your APK

### Option 1: Direct Share
- Upload APK to Google Drive
- Share link with users
- Users download and install manually

### Option 2: QR Code
- Upload APK to file hosting
- Generate QR code: https://www.qr-code-generator.com/
- Users scan QR code to download

### Option 3: Google Play Store (Internal Testing)
```bash
eas submit --platform android
```
Follow prompts to upload to Play Store Console.

---

## 🔄 Updating Your App

### Update Backend
1. Make changes to code
2. Push to GitHub:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
3. Render auto-deploys (if enabled) or click "Manual Deploy"

### Update Mobile App
1. Update version in `app.json`:
```json
"version": "1.0.1"
```
2. Rebuild APK:
```bash
eas build --platform android --profile production
```
3. Download new APK
4. Distribute to users

---

## 💡 Pro Tips

### Backend
- **Free tier sleeps after 15 min**: First request takes 30 seconds to wake up
- **Upgrade to $7/month**: Always-on, no sleep
- **Monitor logs**: Check Render dashboard for errors
- **Backup database**: Export from Render dashboard regularly

### Mobile App
- **Test before distributing**: Install on multiple devices
- **Version numbers**: Increment for each release
- **Keep old APKs**: In case you need to rollback
- **User feedback**: Set up a way for users to report issues

---

## 📊 What You've Deployed

### Backend (Render)
- ✅ FastAPI server running 24/7
- ✅ PostgreSQL database with your data
- ✅ ML models for AQI predictions
- ✅ HTTPS enabled automatically
- ✅ API documentation at `/docs`

### Mobile App (APK)
- ✅ Android app installable on any device
- ✅ Connected to your live backend
- ✅ All features working
- ✅ Ready to distribute

---

## 🎯 Next Steps

1. **Test thoroughly** on multiple devices
2. **Get feedback** from beta users
3. **Monitor backend** logs for errors
4. **Plan updates** based on user feedback
5. **Consider paid tier** if you get many users
6. **Set up monitoring** (Sentry, Datadog)
7. **Backup database** regularly
8. **Document** any custom configurations

---

## 📞 Need Help?

### Documentation
- **APK Build Guide**: See `APK_BUILD_GUIDE.md`
- **Backend Hosting**: See `BACKEND_HOSTING_GUIDE.md`
- **Tech Stack**: See `TECH_STACK.md`

### Support
- **Render**: https://render.com/docs
- **Expo**: https://docs.expo.dev/
- **FastAPI**: https://fastapi.tiangolo.com/

### Common Commands Reference

```bash
# Backend - Check logs
# Go to Render dashboard → Logs tab

# Backend - Run migrations
# Render Shell: alembic upgrade head

# Backend - Seed database
# Render Shell: python scripts/seed_db.py

# Mobile - Build APK
cd FullStackMobile
eas build --platform android --profile production

# Mobile - Check build status
eas build:list

# Mobile - Update environment
# Edit FullStackMobile/.env

# Git - Push changes
git add .
git commit -m "Your message"
git push origin main
```

---

## ✅ Deployment Checklist

### Backend Setup
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Web service created
- [ ] Environment variables configured
- [ ] Backend deployed successfully
- [ ] Migrations run
- [ ] Database seeded
- [ ] ML models trained
- [ ] API documentation accessible
- [ ] Health endpoint returns 200

### Mobile App Setup
- [ ] EAS CLI installed
- [ ] Expo account created
- [ ] Backend URL updated in `.env`
- [ ] EAS configured
- [ ] APK built successfully
- [ ] APK downloaded
- [ ] APK installed on test device
- [ ] Login works
- [ ] Data loads correctly
- [ ] All features tested

### Distribution
- [ ] APK tested on multiple devices
- [ ] Version number updated
- [ ] Distribution method chosen
- [ ] Users can download/install
- [ ] Feedback mechanism in place

---

## 🎉 Congratulations!

You've successfully deployed your AQI Monitoring App!

**Your app is now:**
- ✅ Running on a live server
- ✅ Accessible from anywhere
- ✅ Ready for users to download
- ✅ Collecting real-time AQI data
- ✅ Making ML predictions

**Share your app and make an impact on air quality monitoring! 🌍**

---

## 📈 Scaling Considerations

As your app grows:

1. **More users** → Upgrade Render plan ($7/month)
2. **More data** → Upgrade database storage
3. **Better performance** → Add caching (Redis)
4. **Global users** → Use CDN for static assets
5. **High availability** → Multiple server instances
6. **Advanced features** → Add monitoring, analytics

Start simple, scale as needed!
