# 🚀 START HERE - Build Your APK

## ✅ Everything is Ready!

All configuration files have been created and pushed to GitHub. You're ready to build your APK!

---

## 📋 Quick Start (3 Steps)

### Step 1: Login to Expo

Open PowerShell and run:

```powershell
eas login
```

**If you don't have an Expo account:**
1. Go to https://expo.dev/signup
2. Create a free account (takes 2 minutes)
3. Verify your email
4. Come back and run `eas login` again

**Enter your credentials:**
- Email: `ankit123ironboy@gmail.com` (or your Expo email)
- Password: (your Expo password)

---

### Step 2: Navigate to Mobile App

```powershell
cd FullStackMobile
```

---

### Step 3: Build APK

**Option A: Use the PowerShell Script (Easiest)**

```powershell
.\build-apk.ps1
```

This interactive script will:
- Check if EAS CLI is installed
- Verify you're logged in
- Show build options
- Start the build process

**Option B: Direct Command**

```powershell
eas build --platform android --profile production
```

---

## ⏱️ What Happens Next?

1. **Upload** (1-2 minutes): Your code uploads to Expo servers
2. **Queue** (0-5 minutes): Waiting for build server
3. **Build** (10-20 minutes): APK is being built
4. **Complete**: Download link provided!

**Monitor progress:**
- In terminal: Real-time updates
- In browser: https://expo.dev/builds

---

## 📥 Download Your APK

When build completes, you'll see:

```
✔ Build finished

Build details: https://expo.dev/accounts/[your-account]/projects/...

APK: https://expo.dev/artifacts/eas/[artifact-id].apk
```

**Click the APK link to download!**

---

## 📱 Install on Android

1. **Transfer APK to phone**:
   - USB cable
   - Google Drive
   - Email
   - Direct download on phone

2. **Install**:
   - Open APK file on phone
   - Allow "Install from Unknown Sources" if prompted
   - Tap "Install"
   - Tap "Open"

3. **Test**:
   - Login with: `admin@nashikaqi.in` / `Admin@123`
   - Check if data loads from backend
   - Test all features

---

## 🎯 Complete Command Sequence

Copy and paste these commands one by one:

```powershell
# 1. Login to Expo
eas login

# 2. Navigate to mobile app
cd FullStackMobile

# 3. Build production APK
eas build --platform android --profile production

# Wait 10-20 minutes...
# Download APK when complete
# Install on Android device
# Test the app!
```

---

## ✅ Configuration Summary

Everything is already configured:

- ✅ **Backend URL**: https://aqi-monitoring-app1.onrender.com
- ✅ **App Name**: AQI Monitoring Nashik
- ✅ **Package**: com.nashik.aqimonitoring
- ✅ **Version**: 1.0.0
- ✅ **Build Profiles**: Development, Preview, Production
- ✅ **Permissions**: Location, Internet
- ✅ **Google Maps**: API key configured

---

## 🐛 Troubleshooting

### "Not logged in"
```powershell
eas login
```

### "Command not found: eas"
```powershell
npm install -g eas-cli
```

### "Build failed"
- Check build logs at https://expo.dev/builds
- See `BUILD_APK_NOW.md` for detailed troubleshooting

### "Cannot connect to backend"
- Make sure backend is running: https://aqi-monitoring-app1.onrender.com/health
- Check if it returns: `{"status":"success","data":{"healthy":true}}`

---

## 📚 Additional Resources

- **Detailed Guide**: `BUILD_APK_NOW.md`
- **Production Setup**: `PRODUCTION_DEPLOYMENT_COMPLETE.md`
- **Expo Docs**: https://docs.expo.dev/build/introduction/

---

## 🎉 You're All Set!

Just run these 3 commands:

```powershell
eas login
cd FullStackMobile
eas build --platform android --profile production
```

Your APK will be ready in 10-20 minutes! 🚀

---

## 💡 Pro Tip

While waiting for the build:

1. ✅ Test your backend: https://aqi-monitoring-app1.onrender.com/docs
2. ✅ Check database is seeded (run in Render Shell):
   ```bash
   alembic upgrade head
   python scripts/seed_db.py
   ```
3. ✅ Prepare to share APK with users

Good luck! 🎊
