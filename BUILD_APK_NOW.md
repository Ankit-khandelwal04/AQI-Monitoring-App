# 🚀 Build Your APK - Step by Step Guide

## Prerequisites Completed ✅
- ✅ EAS CLI installed
- ✅ Backend deployed at: https://aqi-monitoring-app1.onrender.com
- ✅ Frontend configured with production URL

---

## 📱 Step-by-Step APK Build Process

### Step 1: Login to Expo (If Not Already Logged In)

Open your terminal and run:

```bash
eas login
```

**If you don't have an Expo account:**
1. Go to https://expo.dev/signup
2. Create a free account
3. Verify your email
4. Come back and run `eas login`

**If you have an account:**
- Enter your email: `ankit123ironboy@gmail.com`
- Enter your password
- Press Enter

---

### Step 2: Navigate to Mobile App Directory

```bash
cd FullStackMobile
```

---

### Step 3: Check Current Configuration

```bash
# Check if app.json exists
cat app.json

# Check if eas.json exists
cat eas.json
```

---

### Step 4: Configure EAS Build (First Time Only)

If `eas.json` doesn't exist, run:

```bash
eas build:configure
```

This will:
- Create `eas.json` configuration file
- Set up build profiles
- Link your project to Expo

**When prompted:**
- "Would you like to automatically create an EAS project?" → Press **Y** (Yes)
- Accept default settings

---

### Step 5: Update app.json (Important!)

Make sure your `app.json` has these settings:

```json
{
  "expo": {
    "name": "AQI Monitoring",
    "slug": "aqi-monitoring-app",
    "version": "1.0.0",
    "android": {
      "package": "com.nashik.aqimonitoring",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

---

### Step 6: Build Production APK

Run this command:

```bash
eas build --platform android --profile production
```

**What happens:**
1. EAS uploads your code to Expo servers
2. Builds APK in the cloud (takes 10-20 minutes)
3. Provides download link when complete

**During build, you'll be asked:**
- "Generate a new Android Keystore?" → Press **Y** (Yes, first time)
- EAS will automatically generate and manage your keystore

---

### Step 7: Monitor Build Progress

After starting the build:

1. **In Terminal**: You'll see build progress
2. **In Browser**: Visit https://expo.dev/accounts/[your-account]/builds
3. **Build Status**:
   - 🟡 "In Queue" → Waiting to start
   - 🔵 "In Progress" → Building (10-20 min)
   - 🟢 "Finished" → Success! Download APK
   - 🔴 "Failed" → Check logs for errors

---

### Step 8: Download APK

When build completes:

**Option 1: From Terminal**
- Click the download link shown in terminal

**Option 2: From Expo Dashboard**
1. Go to https://expo.dev
2. Click "Builds"
3. Find your latest build
4. Click "Download"

**Option 3: QR Code**
- Scan QR code shown in terminal
- Download directly to phone

---

### Step 9: Install APK on Android Device

**Method 1: USB Transfer**
1. Connect phone to computer via USB
2. Copy APK to phone's Downloads folder
3. On phone, open Files app
4. Navigate to Downloads
5. Tap the APK file
6. Allow "Install from Unknown Sources" if prompted
7. Tap "Install"

**Method 2: Cloud Transfer**
1. Upload APK to Google Drive / Dropbox
2. Open link on phone
3. Download APK
4. Install as above

**Method 3: Direct Download**
1. Open Expo build link on phone browser
2. Download APK directly
3. Install

---

### Step 10: Test Your App

After installation:

1. **Open App** - Should launch without errors
2. **Test Login**:
   - Email: `admin@nashikaqi.in`
   - Password: `Admin@123` (capital A!)
3. **Check Dashboard** - Should load real data from backend
4. **Test Maps** - Should show zones
5. **Test Historical Data** - Should display charts
6. **Test ML Predictions** - Should show forecasts

---

## 🔧 Alternative: Build for Preview (Faster Testing)

If you want a quicker build for testing:

```bash
eas build --platform android --profile preview
```

This creates an APK that's easier to test but not optimized for production.

---

## 📋 Complete Command Sequence

Here's the full sequence to copy-paste:

```bash
# 1. Login to Expo (if not logged in)
eas login

# 2. Navigate to mobile app
cd FullStackMobile

# 3. Configure EAS (first time only)
eas build:configure

# 4. Build production APK
eas build --platform android --profile production

# 5. Wait for build to complete (10-20 minutes)
# 6. Download APK from provided link
# 7. Install on Android device
# 8. Test the app!
```

---

## 🐛 Troubleshooting

### Issue: "Not logged in"
**Solution:**
```bash
eas login
```
Enter your Expo credentials.

### Issue: "No eas.json found"
**Solution:**
```bash
eas build:configure
```

### Issue: "Build failed - Invalid package name"
**Solution:**
Update `android.package` in `app.json`:
```json
"android": {
  "package": "com.nashik.aqimonitoring"
}
```

### Issue: "Build failed - Missing assets"
**Solution:**
Make sure these files exist in `FullStackMobile/assets/`:
- `icon.png`
- `splash.png`
- `adaptive-icon.png`

If missing, create placeholder images or use default Expo assets.

### Issue: "Cannot connect to backend"
**Solution:**
Check `FullStackMobile/.env`:
```bash
EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com
```

### Issue: "Build takes too long"
**Solution:**
- This is normal! Cloud builds take 10-20 minutes
- Check build status at: https://expo.dev/builds
- Free tier may have queue times

---

## 📊 Build Profiles Explained

### Development Build
```bash
eas build --platform android --profile development
```
- Includes dev tools
- Larger file size (~50-100 MB)
- Good for debugging

### Preview Build
```bash
eas build --platform android --profile preview
```
- Production-like
- Medium file size (~20-40 MB)
- Good for testing

### Production Build
```bash
eas build --platform android --profile production
```
- Fully optimized
- Smallest file size (~15-30 MB)
- Ready for distribution
- **Use this for final APK!**

---

## ✅ Success Checklist

After building and installing:

- [ ] APK downloaded successfully
- [ ] APK installed on Android device
- [ ] App launches without crashes
- [ ] Login works with admin credentials
- [ ] Dashboard loads with real data
- [ ] Maps display correctly
- [ ] Historical data shows charts
- [ ] ML predictions work
- [ ] No connection errors
- [ ] All features functional

---

## 🎯 Expected Build Output

When build succeeds, you'll see:

```
✔ Build finished

Build details: https://expo.dev/accounts/[your-account]/projects/aqi-monitoring-app/builds/[build-id]

APK: https://expo.dev/artifacts/eas/[artifact-id].apk

Install and run the app:
› Download the APK from the link above
› Transfer to your Android device
› Install and run
```

---

## 📱 Sharing Your APK

Once you have the APK:

### Option 1: Direct Share
- Upload to Google Drive
- Share link with users
- Users download and install

### Option 2: QR Code
- Generate QR code for download link
- Users scan to download

### Option 3: Google Play Store (Future)
```bash
eas submit --platform android
```
- Requires Google Play Developer account ($25 one-time)
- Full app store distribution

---

## 🔄 Updating Your APK

When you make changes:

1. **Update version** in `app.json`:
```json
"version": "1.0.1"
```

2. **Rebuild**:
```bash
eas build --platform android --profile production
```

3. **Distribute new APK** to users

---

## 💡 Pro Tips

1. **Save Build Links**: Bookmark your Expo builds page
2. **Test Before Distributing**: Always test APK on multiple devices
3. **Version Numbers**: Increment for each release
4. **Keep Old APKs**: In case you need to rollback
5. **Monitor Backend**: Check Render logs for API errors
6. **User Feedback**: Set up a way for users to report issues

---

## 🎉 You're Ready!

Your app is configured and ready to build. Just run:

```bash
cd FullStackMobile
eas build --platform android --profile production
```

And wait for your APK! 🚀

---

## 📞 Need Help?

- **Expo Docs**: https://docs.expo.dev/build/introduction/
- **EAS Build**: https://docs.expo.dev/build/setup/
- **Troubleshooting**: https://docs.expo.dev/build-reference/troubleshooting/

Good luck with your build! 🎊
