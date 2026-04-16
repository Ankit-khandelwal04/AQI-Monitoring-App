# 🌬️ AQI Monitoring App

A cross-platform **Air Quality Index (AQI) Monitoring** mobile application built with **React Native + Expo**. It provides real-time and historical air quality data for Nashik city, with separate interfaces for regular users and administrators.

---

## 📖 Project Abstract

Air pollution is a growing concern in rapidly urbanising cities. This app aims to empower Nashik residents with **real-time AQI data**, health advisories, and area-wise air quality insights — all accessible from their smartphones.

The app features:
- 🔐 **Role-based authentication** — separate login flows for users and admins
- 🏠 **User dashboard** — live AQI overview, area selector, and date filtering
- 📊 **Graph & Table views** — visualise historical AQI trends by area
- 🛠️ **Admin panel** — manage data, predictions, alerts, reports, and settings
- 📱 **Onboarding experience** — guided walkthrough for first-time users
- 💾 **Persistent sessions** — login state preserved across app restarts via AsyncStorage

---

## 🗂️ Project Structure

```
FullStackMobile/
├── App.tsx                         # Root component — auth routing & screen orchestration
├── index.ts                        # Expo entry point
├── app.json                        # Expo app configuration (name, icons, splash, etc.)
├── babel.config.js                 # Babel config with NativeWind/Reanimated presets
├── tailwind.config.js              # TailwindCSS config (for NativeWind)
├── global.css                      # Global CSS imports for NativeWind
├── tsconfig.json                   # TypeScript compiler configuration
├── package.json                    # Project dependencies and scripts
├── assets/                         # App icons, splash screen images
└── src/
    ├── components/
    │   └── BottomNav.tsx           # Bottom tab navigation bar (Home / Graph / Table)
    ├── screens/
    │   ├── OnboardingScreen.tsx    # 3-slide onboarding for new users
    │   ├── UserLoginScreen.tsx     # User login form
    │   ├── UserSignUpScreen.tsx    # User registration form
    │   ├── AdminLoginScreen.tsx    # Admin login form
    │   ├── AdminSignUpScreen.tsx   # Admin registration form
    │   ├── HomeScreen.tsx          # Main user dashboard — AQI overview, area/date selector
    │   ├── GraphViewScreen.tsx     # AQI trend chart for a selected area and date
    │   ├── TableViewScreen.tsx     # Tabular AQI data for a selected area
    │   └── admin/
    │       ├── AdminDashboard.tsx      # Admin shell with tab navigation
    │       ├── AdminHomePage.tsx       # Admin home — live AQI overview across all areas
    │       ├── AdminHistoricalPage.tsx # Historical AQI data explorer for admins
    │       ├── AdminPredictionPage.tsx # AQI prediction visualisation and model insights
    │       ├── AdminSendAlertPage.tsx  # Compose and send air quality public alerts
    │       ├── AdminReportDownload.tsx # Generate and download AQI reports
    │       └── AdminSettingsPage.tsx   # Admin profile and app settings
    └── utils/
        └── aqiUtils.ts             # AQI helper functions (category labels, colour coding, health advice)
```

---

## 📄 Role of Each File

| File | Purpose |
|---|---|
| `App.tsx` | App entry point. Manages global auth state, onboarding flow, and renders the correct screen based on role. |
| `index.ts` | Registers the root Expo component. |
| `app.json` | Expo configuration — app name, bundle ID, orientation, icons, splash screen. |
| `babel.config.js` | Babel preset for Expo, includes `react-native-reanimated` plugin. |
| `tailwind.config.js` | Configures TailwindCSS content paths for NativeWind. |
| `global.css` | Imports Tailwind base styles for NativeWind integration. |
| `tsconfig.json` | TypeScript strict mode config extending Expo's defaults. |
| `src/components/BottomNav.tsx` | Persistent bottom navigation bar with Home, Graph, and Table tabs for users. |
| `src/screens/OnboardingScreen.tsx` | 3-page onboarding carousel shown to first-time users explaining the app. |
| `src/screens/UserLoginScreen.tsx` | Email/password login for regular users. |
| `src/screens/UserSignUpScreen.tsx` | Registration form for new users. |
| `src/screens/AdminLoginScreen.tsx` | Separate login screen for admin users. |
| `src/screens/AdminSignUpScreen.tsx` | Admin registration form. |
| `src/screens/HomeScreen.tsx` | Core user-facing screen — shows live AQI, area picker, date selector, and quick actions. |
| `src/screens/GraphViewScreen.tsx` | Renders AQI trend chart (SVG-based) for a chosen area and date. |
| `src/screens/TableViewScreen.tsx` | Shows AQI readings in a scrollable table for the selected area. |
| `src/screens/admin/AdminDashboard.tsx` | Admin shell with horizontal tab navigation between admin sub-pages. |
| `src/screens/admin/AdminHomePage.tsx` | Admin view of live AQI readings across all monitored areas. |
| `src/screens/admin/AdminHistoricalPage.tsx` | Admin tool to explore and filter historical AQI data. |
| `src/screens/admin/AdminPredictionPage.tsx` | Displays AQI forecast/prediction data and model confidence metrics. |
| `src/screens/admin/AdminSendAlertPage.tsx` | Admin form to compose and push public health alerts. |
| `src/screens/admin/AdminReportDownload.tsx` | Generate downloadable AQI reports for selected date ranges. |
| `src/screens/admin/AdminSettingsPage.tsx` | Admin profile management and application settings. |
| `src/utils/aqiUtils.ts` | Utility functions: converts raw AQI numbers to categories, colour codes, and health advisory text. |

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Framework** | [React Native](https://reactnative.dev/) `0.81.5` |
| **Platform / Toolchain** | [Expo](https://expo.dev/) SDK `54` |
| **Language** | TypeScript `5.9` |
| **Navigation** | [React Navigation](https://reactnavigation.org/) v7 (Native Stack + Drawer) |
| **Styling** | [NativeWind](https://www.nativewind.dev/) v4 (TailwindCSS for React Native) + `StyleSheet` |
| **Icons** | [@expo/vector-icons](https://docs.expo.dev/guides/icons/) (Ionicons) |
| **Persistent Storage** | [@react-native-async-storage/async-storage](https://react-native-async-storage.github.io/async-storage/) |
| **Animations** | [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 |
| **Gestures** | [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| **Charts / SVG** | [react-native-svg](https://github.com/software-mansion/react-native-svg) |
| **Safe Area** | [react-native-safe-area-context](https://github.com/th3rdwave/react-native-safe-area-context) |
| **Web Support** | [react-native-web](https://necolas.github.io/react-native-web/) + `react-dom` |
| **Date Picker** | [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) |

---

## 🚀 Installation & Setup

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/more/expo-cli/) (installed globally)
- [Expo Go](https://expo.dev/go) app on your Android or iOS device **OR** an Android/iOS emulator

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli
```

---

### 1. Clone the Repository

```bash
git clone https://github.com/Ankit-khandelwal04/AQI-Monitoring-App.git
cd AQI-Monitoring-App
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Start the Development Server

```bash
npx expo start
```

This will open the **Expo Dev Tools** in your terminal and display a QR code.

---

### 4. Run the App

#### 📱 On a Physical Device (Expo Go)
1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779) or [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code shown in the terminal with:
   - **Android**: Use the Expo Go app's built-in QR scanner
   - **iOS**: Use the default Camera app

#### 🤖 On Android Emulator
```bash
npx expo start --android
# or press 'a' in the Expo terminal
```

#### 🍎 On iOS Simulator (macOS only)
```bash
npx expo start --ios
# or press 'i' in the Expo terminal
```

#### 🌐 On Web Browser
```bash
npx expo start --web
# or press 'w' in the Expo terminal
```

---

## 📦 Available Scripts

| Script | Command | Description |
|---|---|---|
| Start dev server | `npm start` | Starts the Expo development server |
| Android | `npm run android` | Launches on Android emulator/device |
| iOS | `npm run ios` | Launches on iOS simulator (macOS only) |
| Web | `npm run web` | Launches in web browser |

---

## 🗺️ App Navigation Flow

```
App Launch
    │
    ├─ First Time? ──► Onboarding (3 slides) ──► User Login
    │
    ├─ User Login  ──► Home Screen ──► Graph View / Table View
    │                        └─ Bottom Navigation (Home | Graph | Table)
    │
    └─ Admin Login ──► Admin Dashboard
                            ├─ Home (Live AQI)
                            ├─ Historical Data
                            ├─ AQI Predictions
                            ├─ Send Alerts
                            ├─ Download Reports
                            └─ Settings
```

---

## 🏙️ Monitored Areas (Nashik)

The app currently tracks AQI data for the following areas:

- Cidco
- Gangapur Road
- Satpur
- Nashik Road
- Panchavati
- Dwarka

---

## 📝 License

This project is for academic and demonstration purposes.
