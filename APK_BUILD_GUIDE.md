# APK Build Guide - AQI Monitoring App

## 📱 Building Android APK with Expo

### Prerequisites
- Node.js and npm installed
- Expo CLI installed globally
- Expo account (free tier works)
- Android device or emulator for testing

---

## Method 1: EAS Build (Recommended - Cloud Build)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
Enter your Expo account credentials.

### Step 3: Configure EAS Build
Navigate to your mobile app directory:
```bash
cd FullStackMobile
```

Initialize EAS:
```bash
eas build:configure
```

This creates `eas.json` in your project root.

### Step 4: Update app.json Configuration
Make sure your `app.json` has proper configuration:

```json
{
  "expo": {
    "name": "AQI Monitoring",
    "slug": "aqi-monitoring-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.aqimonitoring"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.yourcompany.aqimonitoring",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

### Step 5: Update Environment Variables for Production

**IMPORTANT**: Before building, update your `.env` file with your production backend URL:

```bash
# FullStackMobile/.env
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```

Or if using IP (not recommended for production):
```bash
EXPO_PUBLIC_API_URL=http://YOUR_PUBLIC_IP:8000
```

### Step 6: Build APK
```bash
# For development build (includes dev tools)
eas build --platform android --profile development

# For production build (optimized, smaller size)
eas build --platform android --profile production

# For preview build (production-like but easier to test)
eas build --platform android --profile preview
```

### Step 7: Download APK
After the build completes (10-20 minutes):
1. EAS will provide a download link
2. Download the APK file
3. Transfer to your Android device
4. Install and test

---

## Method 2: Local Build (Alternative)

### Step 1: Install Android Studio
Download and install Android Studio from https://developer.android.com/studio

### Step 2: Set up Android SDK
1. Open Android Studio
2. Go to Settings → Appearance & Behavior → System Settings → Android SDK
3. Install Android SDK Platform 33 (or latest)
4. Install Android SDK Build-Tools
5. Install Android Emulator

### Step 3: Set Environment Variables
Add to your system PATH:
```bash
# Windows (PowerShell)
$env:ANDROID_HOME = "C:\Users\YourUsername\AppData\Local\Android\Sdk"
$env:PATH += ";$env:ANDROID_HOME\platform-tools"
$env:PATH += ";$env:ANDROID_HOME\tools"

# Linux/Mac
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
```

### Step 4: Prebuild for Android
```bash
cd FullStackMobile
npx expo prebuild --platform android
```

This creates an `android/` directory with native code.

### Step 5: Build APK Locally
```bash
cd android
./gradlew assembleRelease
```

The APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 🔧 EAS Build Configuration (eas.json)

Create or update `FullStackMobile/eas.json`:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 📦 Build Profiles Explained

### Development Build
- Includes dev tools and debugging
- Larger file size (~50-100 MB)
- Hot reload enabled
- Use for testing during development

```bash
eas build --platform android --profile development
```

### Preview Build
- Production-like but easier to distribute
- Optimized but not signed for Play Store
- Good for beta testing
- Medium file size (~20-40 MB)

```bash
eas build --platform android --profile preview
```

### Production Build
- Fully optimized and minified
- Smallest file size (~15-30 MB)
- Ready for Google Play Store
- No dev tools

```bash
eas build --platform android --profile production
```

---

## 🔐 Signing Your APK (For Production)

### Generate Keystore (First Time Only)
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Save the keystore file and remember the passwords!

### Configure EAS to Use Your Keystore
```bash
eas credentials
```

Follow prompts to upload your keystore.

---

## 🚀 Testing Your APK

### Install on Physical Device
1. Enable "Install from Unknown Sources" on your Android device
2. Transfer APK via USB, email, or cloud storage
3. Tap the APK file to install
4. Grant necessary permissions (location, etc.)

### Test Checklist
- [ ] App launches successfully
- [ ] Login works with backend
- [ ] Maps load correctly
- [ ] AQI data displays
- [ ] Navigation works
- [ ] Alerts can be sent (admin)
- [ ] Historical data loads
- [ ] ML predictions work

---

## 🐛 Common Issues & Solutions

### Issue 1: "Unable to connect to backend"
**Solution**: 
- Check `EXPO_PUBLIC_API_URL` in `.env`
- Ensure backend is accessible from the internet
- Test backend URL in browser first

### Issue 2: "Build failed - Out of memory"
**Solution**:
```json
// In eas.json, add:
"android": {
  "buildType": "apk",
  "gradleCommand": ":app:assembleRelease -Dorg.gradle.jvmargs=-Xmx4096m"
}
```

### Issue 3: "Maps not showing"
**Solution**:
- Ensure location permissions are granted
- Check Google Maps API key is valid
- Verify network connectivity

### Issue 4: "App crashes on startup"
**Solution**:
- Check logs: `adb logcat`
- Verify all dependencies are compatible
- Test on different Android versions

---

## 📊 Build Size Optimization

### Reduce APK Size
1. **Enable ProGuard** (minification):
```json
// android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

2. **Remove unused resources**:
```bash
npx expo-optimize
```

3. **Use APK splits** (separate APKs per architecture):
```json
// In eas.json
"android": {
  "buildType": "apk",
  "enableProguardInReleaseBuilds": true,
  "enableSeparateBuildPerCPUArchitecture": true
}
```

---

## 🌐 Connecting APK to Production Backend

### Step 1: Update Environment Variables
Before building, set production backend URL:

```bash
# FullStackMobile/.env
EXPO_PUBLIC_API_URL=https://your-backend-domain.com
```

### Step 2: Rebuild App
```bash
eas build --platform android --profile production
```

### Step 3: Test Connection
After installing APK:
1. Open app
2. Try to login
3. Check if data loads
4. Monitor backend logs for incoming requests

---

## 📱 Distribution Options

### Option 1: Direct APK Distribution
- Share APK file directly
- Users install manually
- Good for internal testing
- No app store approval needed

### Option 2: Google Play Store (Internal Testing)
```bash
eas submit --platform android
```
- Upload to Play Store Console
- Create internal testing track
- Invite testers via email
- Automatic updates

### Option 3: Google Play Store (Production)
- Full Play Store release
- Requires app review
- Reaches millions of users
- Automatic updates for all users

---

## 🔄 Updating Your APK

### For Direct Distribution
1. Increment version in `app.json`:
```json
"version": "1.0.1"
```

2. Rebuild:
```bash
eas build --platform android --profile production
```

3. Distribute new APK

### For Play Store
1. Increment `versionCode` in `app.json`:
```json
"android": {
  "versionCode": 2
}
```

2. Build and submit:
```bash
eas build --platform android --profile production
eas submit --platform android
```

---

## 📋 Pre-Build Checklist

Before building your production APK:

- [ ] Update `EXPO_PUBLIC_API_URL` to production backend
- [ ] Test backend is accessible from internet
- [ ] Update app version in `app.json`
- [ ] Add app icon and splash screen
- [ ] Test on development build first
- [ ] Remove console.log statements (optional)
- [ ] Update app name and package identifier
- [ ] Configure proper permissions in `app.json`
- [ ] Test login with production credentials
- [ ] Verify all API endpoints work
- [ ] Check maps and location services
- [ ] Test on multiple Android versions if possible

---

## 🎯 Quick Start Commands

```bash
# 1. Navigate to mobile app
cd FullStackMobile

# 2. Update backend URL in .env
# EXPO_PUBLIC_API_URL=https://your-backend.com

# 3. Install EAS CLI (if not installed)
npm install -g eas-cli

# 4. Login to Expo
eas login

# 5. Configure EAS (first time only)
eas build:configure

# 6. Build APK
eas build --platform android --profile production

# 7. Wait for build to complete (10-20 minutes)
# 8. Download APK from the provided link
# 9. Install on Android device and test
```

---

## 📞 Support Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Android Developer Guide**: https://developer.android.com/
- **React Native Docs**: https://reactnative.dev/

---

## ✅ Success Indicators

Your APK is ready when:
- ✅ Build completes without errors
- ✅ APK installs on Android device
- ✅ App launches successfully
- ✅ Login works with production backend
- ✅ All features function correctly
- ✅ No crashes or freezes
- ✅ Maps and location work
- ✅ Data loads from backend

**Next Step**: See `BACKEND_HOSTING_GUIDE.md` for hosting your backend!
