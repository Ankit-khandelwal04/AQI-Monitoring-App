# AQI Monitoring Full Stack Application

A comprehensive Air Quality Index (AQI) monitoring system built with React Native (Expo) for mobile/web frontend and FastAPI for backend.

## 🚀 Features

### User Features
- Real-time AQI monitoring for multiple zones
- Interactive dashboard with AQI data visualization
- Historical data analysis with graphs
- Date and time-based data filtering
- Zone-wise AQI comparison
- Color-coded AQI levels (Good, Satisfactory, Moderate, Poor, Very Poor, Severe)

### Admin Features
- Comprehensive admin dashboard
- Interactive Google Maps with AQI zones (mobile only)
- Zone management (create, delete)
- Alert system for high AQI zones
- Report generation (Daily, Weekly, Monthly)
- Historical data analysis
- **🤖 ML-powered AQI prediction and forecasting**
- Settings management

## 🛠️ Tech Stack

### Frontend
- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Maps**: react-native-maps (Google Maps)
- **Charts**: react-native-svg
- **State Management**: React Hooks
- **API Client**: Fetch API with AsyncStorage

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Authentication**: JWT (JSON Web Tokens)
- **Migrations**: Alembic
- **CORS**: FastAPI CORS Middleware
- **ML Models**: Scikit-learn (Random Forest)
- **Data Processing**: Pandas, NumPy
- **Visualization**: Matplotlib, Seaborn

## 📁 Complete Folder Structure

```
Full Stack/
│
├── FullStackBackend/                    # Backend (FastAPI + PostgreSQL)
│   ├── alembic/                         # Database migrations
│   │   ├── versions/                    # Migration scripts
│   │   │   ├── 835cbadf6d2e_initial_schema.py
│   │   │   └── .gitkeep
│   │   ├── env.py                       # Alembic environment config
│   │   └── script.py.mako               # Migration template
│   │
│   ├── app/                             # Main application code
│   │   ├── database/                    # Database configuration
│   │   │   ├── database.py              # SQLAlchemy setup
│   │   │   └── __init__.py
│   │   │
│   │   ├── models/                      # SQLAlchemy models (database tables)
│   │   │   ├── user.py                  # User model
│   │   │   ├── city.py                  # City model
│   │   │   ├── zone.py                  # Zone model
│   │   │   ├── aqi_reading.py           # AQI reading model
│   │   │   ├── alert.py                 # Alert model
│   │   │   └── __init__.py
│   │   │
│   │   ├── routers/                     # API route handlers
│   │   │   ├── auth_routes.py           # Authentication endpoints
│   │   │   ├── aqi_routes.py            # AQI data endpoints
│   │   │   ├── zone_routes.py           # Zone management endpoints
│   │   │   ├── alert_routes.py          # Alert endpoints
│   │   │   ├── map_routes.py            # Map/GeoJSON endpoints
│   │   │   ├── ml_routes.py             # ML prediction endpoints
│   │   │   ├── report_routes.py         # Report generation endpoints
│   │   │   └── setup_routes.py          # Setup/seeding endpoints
│   │   │
│   │   ├── schemas/                     # Pydantic schemas (validation)
│   │   │   ├── user_schema.py           # User request/response schemas
│   │   │   ├── aqi_schema.py            # AQI schemas
│   │   │   ├── zone_schema.py           # Zone schemas
│   │   │   ├── alert_schema.py          # Alert schemas
│   │   │   └── __init__.py
│   │   │
│   │   ├── services/                    # Business logic layer
│   │   │   ├── auth_service.py          # Authentication logic
│   │   │   ├── aqi_service.py           # AQI data processing
│   │   │   ├── zone_service.py          # Zone management logic
│   │   │   ├── alert_service.py         # Alert logic
│   │   │   ├── maps_service.py          # GeoJSON processing
│   │   │   └── __init__.py
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │   ├── security.py              # JWT, password hashing
│   │   │   ├── response.py              # Standard API responses
│   │   │   ├── geojson_utils.py         # GeoJSON helpers
│   │   │   └── __init__.py
│   │   │
│   │   ├── config.py                    # App configuration
│   │   ├── main.py                      # FastAPI app entry point
│   │   └── __init__.py
│   │
│   ├── ml/                              # Machine Learning pipeline
│   │   ├── data/                        # Training data
│   │   │   └── nashik_aqi_cleaned.csv   # 157,680 records (2 years, 9 zones)
│   │   │
│   │   ├── models/                      # Trained ML models (not in git)
│   │   │   ├── aqi_regressor.pkl        # Random Forest Regressor
│   │   │   ├── aqi_classifier.pkl       # Random Forest Classifier
│   │   │   ├── label_encoder.pkl        # Station name encoder
│   │   │   └── model_metadata.json      # Model metrics and info
│   │   │
│   │   ├── plots/                       # Visualizations
│   │   │   ├── aqi_trend_over_time.png
│   │   │   ├── aqi_hourly_pattern.png
│   │   │   ├── regression_pred_vs_actual.png
│   │   │   ├── regression_feature_importance.png
│   │   │   └── classification_confusion_matrix.png
│   │   │
│   │   ├── aqi_ml_pipeline.py           # Complete ML pipeline
│   │   ├── setup_ml.py                  # Automated ML setup
│   │   ├── train_models.ps1             # PowerShell training script
│   │   └── README.md                    # ML documentation
│   │
│   ├── scripts/                         # Utility scripts
│   │   ├── seed.py                      # Database seeding script
│   │   ├── seed_db.py                   # Alternative seeding
│   │   ├── health_check.py              # API health check
│   │   ├── verify_api.py                # API verification
│   │   └── debug_ml.py                  # ML debugging
│   │
│   ├── venv/                            # Python virtual environment (not in git)
│   ├── .env                             # Environment variables (not in git)
│   ├── .env.example                     # Environment template
│   ├── .gitignore                       # Git ignore rules
│   ├── alembic.ini                      # Alembic configuration
│   ├── docker-compose.yml               # Docker setup
│   ├── Dockerfile                       # Docker image
│   ├── requirements.txt                 # Python dependencies
│   ├── pyrightconfig.json               # Python type checking config
│   ├── seed_on_startup.py               # Auto-seed on app start
│   ├── test_login.py                    # Login testing script
│   ├── recreate_venv.ps1                # Virtual env recreation script
│   ├── fix_backend.ps1                  # Backend fix script
│   ├── fix_all_dependencies.py          # Dependency fix script
│   ├── fix_pydantic.py                  # Pydantic fix script
│   ├── fix_pydantic.ps1                 # Pydantic fix PowerShell
│   ├── fix_now.bat                      # Quick fix batch script
│   ├── get_credentials.py               # Credential helper
│   └── README.md                        # Backend documentation
│
├── FullStackMobile/                     # Frontend (React Native + Expo)
│   ├── .expo/                           # Expo build cache (not in git)
│   │   ├── web/cache/                   # Web build cache
│   │   ├── devices.json                 # Connected devices
│   │   └── README.md
│   │
│   ├── assets/                          # Static assets
│   │   ├── images/                      # Image files
│   │   ├── fonts/                       # Custom fonts
│   │   └── icon.png                     # App icon
│   │
│   ├── src/                             # Source code
│   │   ├── components/                  # Reusable components
│   │   │   ├── AQICard.tsx              # AQI display card
│   │   │   ├── ZoneCard.tsx             # Zone display card
│   │   │   ├── BottomNav.tsx            # Bottom navigation
│   │   │   ├── ErrorBoundary.tsx        # Error handling wrapper
│   │   │   └── LoadingSpinner.tsx       # Loading indicator
│   │   │
│   │   ├── screens/                     # Screen components
│   │   │   ├── admin/                   # Admin screens
│   │   │   │   ├── AdminDashboard.tsx   # Admin main dashboard
│   │   │   │   ├── AdminMapPage.tsx     # Admin map view
│   │   │   │   ├── AdminAlertsPage.tsx  # Alert management
│   │   │   │   ├── AdminReportsPage.tsx # Report generation
│   │   │   │   ├── AdminPredictionPage.tsx # ML predictions
│   │   │   │   ├── AdminSettingsPage.tsx # Settings
│   │   │   │   └── AdminHistoryPage.tsx # Historical data
│   │   │   │
│   │   │   ├── user/                    # User screens
│   │   │   │   ├── HomeScreen.tsx       # User home screen
│   │   │   │   ├── MapScreen.tsx        # User map view
│   │   │   │   ├── HistoryScreen.tsx    # Historical data
│   │   │   │   └── ProfileScreen.tsx    # User profile
│   │   │   │
│   │   │   ├── LoginScreen.tsx          # Login screen
│   │   │   └── RegisterScreen.tsx       # Registration screen
│   │   │
│   │   ├── services/                    # API services
│   │   │   ├── api.ts                   # API client configuration
│   │   │   ├── authService.ts           # Authentication API calls
│   │   │   ├── aqiService.ts            # AQI data API calls
│   │   │   ├── zoneService.ts           # Zone API calls
│   │   │   ├── alertService.ts          # Alert API calls
│   │   │   ├── mlService.ts             # ML prediction API calls
│   │   │   └── reportService.ts         # Report API calls
│   │   │
│   │   ├── types/                       # TypeScript type definitions
│   │   │   ├── auth.types.ts            # Authentication types
│   │   │   ├── aqi.types.ts             # AQI data types
│   │   │   ├── zone.types.ts            # Zone types
│   │   │   ├── alert.types.ts           # Alert types
│   │   │   └── ml.types.ts              # ML prediction types
│   │   │
│   │   └── utils/                       # Utility functions
│   │       ├── storage.ts               # AsyncStorage helpers
│   │       ├── dateUtils.ts             # Date formatting
│   │       └── aqiUtils.ts              # AQI calculation helpers
│   │
│   ├── node_modules/                    # NPM dependencies (not in git)
│   ├── .env                             # Environment variables (not in git)
│   ├── .env.example                     # Environment template
│   ├── .gitignore                       # Git ignore rules
│   ├── app.json                         # Expo app configuration
│   ├── eas.json                         # EAS Build configuration
│   ├── App.tsx                          # Root component
│   ├── index.ts                         # Entry point
│   ├── package.json                     # NPM dependencies
│   ├── package-lock.json                # Dependency lock file
│   ├── tsconfig.json                    # TypeScript configuration
│   ├── tailwind.config.js               # Tailwind CSS config
│   ├── metro.config.js                  # Metro bundler config
│   ├── webpack.config.js                # Webpack config (web)
│   ├── babel.config.js                  # Babel configuration
│   ├── build-apk.ps1                    # APK build script
│   ├── fix-web-bundle.ps1               # Web bundle fix script
│   └── README.md                        # Frontend documentation
│
├── .git/                                # Git repository (not in git)
├── .gitignore                           # Root git ignore
├── .vscode/                             # VS Code settings
│   └── settings.json                    # Editor configuration
│
├── render.yaml                          # Render deployment config
├── switch-to-local.ps1                  # Switch to local backend
├── switch-to-production.ps1             # Switch to production backend
├── LOCAL_DEVELOPMENT_FIX.md             # Local dev guide
├── ML_MODEL_EXPLANATION.md              # Complete ML documentation
├── README.md                            # This file
└── SETUP_GUIDE.md                       # Setup instructions
```

### Key Directories Explained

#### Backend (`FullStackBackend/`)
- **`app/`**: Core application code organized by layers (models, routers, services, schemas)
- **`ml/`**: Complete ML pipeline with data, models, and visualizations
- **`scripts/`**: Utility scripts for database seeding, testing, debugging
- **`alembic/`**: Database migration management

#### Frontend (`FullStackMobile/`)
- **`src/screens/`**: All screen components (admin and user views)
- **`src/components/`**: Reusable UI components
- **`src/services/`**: API integration layer
- **`src/types/`**: TypeScript type definitions
- **`.expo/`**: Expo build artifacts and cache

#### ML System (`FullStackBackend/ml/`)
- **`data/`**: Training datasets (157,680 records)
- **`models/`**: Trained models (99.98% accuracy)
- **`plots/`**: Visualizations and analysis charts

## 📋 Prerequisites

- Node.js (v18 or higher)
- Python (v3.10 or higher)
- PostgreSQL (v14 or higher)
- Expo CLI
- Git

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Full Stack"
```

### 2. Backend Setup

```bash
cd FullStackBackend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\Activate.ps1
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Setup database
# Create PostgreSQL database named 'aqi_db'
# Update .env file with your database credentials

# Run migrations
alembic upgrade head

# Seed database with sample data
python scripts/seed.py

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
cd FullStackMobile

# Install dependencies
npm install

# Update API URL in .env file
# For web: http://localhost:8000
# For mobile: http://YOUR_IP:8000

# Start development server
npx expo start

# Run on specific platform
npx expo start --web      # Web
npx expo start --android  # Android
npx expo start --ios      # iOS
```

## 🔐 Default Credentials

**⚠️ IMPORTANT: Passwords are case-sensitive and all lowercase!**

For complete credential information, see **[CREDENTIALS.md](CREDENTIALS.md)**

### Quick Reference

**Admin Account**
- Email: `admin@nashikaqi.in`
- Password: `admin@123` *(all lowercase!)*

**User Account**
- Email: `ankit@nashikaqi.in`
- Password: `user@1234` *(all lowercase!)*

**Common Mistake**: Using `Admin@123` or `User@1234` (capital letters) - these will NOT work!

## 📱 Platform Support

### Web
- ✅ Full dashboard functionality
- ✅ Data visualization
- ✅ Report generation
- ⚠️ Maps show placeholder (use mobile for maps)
- ✅ HTML5 date/time pickers

### Mobile (Android/iOS)
- ✅ All features fully supported
- ✅ Google Maps integration
- ✅ Native date/time pickers
- ✅ Optimized mobile UI

## 🌐 API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user

### AQI Data
- `GET /aqi/current` - Get current AQI for zone
- `GET /aqi/history` - Get historical AQI data
- `POST /aqi/predict` - Predict future AQI

### Machine Learning
- `POST /ml/predict` - Predict AQI from pollutant data
- `GET /ml/forecast/{station}?hours=24` - Get AQI forecast
- `GET /ml/model-info` - Get model metadata and metrics
- `GET /ml/feature-importance` - Get pollutant contributions
- `GET /ml/stations` - Get available monitoring stations
- `GET /ml/health` - Check ML service health

### Admin
- `GET /admin/dashboard` - Get dashboard statistics
- `POST /admin/create-zone` - Create new zone
- `DELETE /admin/delete-zone/:id` - Delete zone

### Reports
- `GET /reports/generate` - Generate AQI report

### Maps
- `GET /map/zones` - Get all zones with GeoJSON

### Alerts
- `POST /alerts/send` - Send alert (admin only)
- `GET /alerts/history` - Get alert history

## 🤖 ML Prediction System

### Quick Start

Train the ML models for AQI prediction:

```bash
cd FullStackBackend/ml

# Option 1: Automated setup (recommended)
python setup_ml.py

# Option 2: PowerShell script (Windows)
.\train_models.ps1

# Option 3: Manual training
python aqi_ml_pipeline.py
```

### What It Does

- ✅ Generates 2 years of synthetic AQI data for 9 Nashik zones
- ✅ Trains Random Forest Regressor (predicts AQI value)
- ✅ Trains Random Forest Classifier (predicts AQI category)
- ✅ Creates visualizations (trends, feature importance, confusion matrix)
- ✅ Saves models for API use
- ✅ Achieves 89%+ accuracy

### Models Generated

```
ml/
├── data/
│   └── nashik_aqi_cleaned.csv          # 157,680 records
├── models/
│   ├── aqi_regressor.pkl               # Regression model
│   ├── aqi_classifier.pkl              # Classification model
│   ├── label_encoder.pkl               # Station encoder
│   └── model_metadata.json             # Metrics & info
└── plots/
    ├── regression_pred_vs_actual.png
    ├── regression_feature_importance.png
    ├── classification_confusion_matrix.png
    ├── aqi_trend_over_time.png
    └── aqi_hourly_pattern.png
```

### Using ML Predictions

Once models are trained, the Admin Prediction Page in the mobile app will:
- Display real-time forecasts (6/12/24 hours)
- Show interactive charts with predicted vs actual AQI
- Display feature importance (which pollutants matter most)
- Provide health advisories based on predictions
- Show model accuracy and performance metrics

### API Example

```bash
# Predict AQI
curl -X POST "http://localhost:8000/ml/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "pm2_5": 85.5,
    "pm10": 120.3,
    "no2": 45.2,
    "so2": 18.5,
    "co": 1.2,
    "o3": 35.0,
    "hour": 9,
    "month": 12,
    "station": "Satpur"
  }'

# Get 24-hour forecast
curl "http://localhost:8000/ml/forecast/Satpur?hours=24"
```

For complete ML documentation, see [ML_MODEL_EXPLANATION.md](ML_MODEL_EXPLANATION.md)

## 🐛 Troubleshooting

### ML Models Not Found

If you see "ML models not found" error:

```bash
cd FullStackBackend/ml
python setup_ml.py
```

### Web Bundle Issues

If you encounter blank screen or compilation errors:

```bash
cd FullStackMobile

# Clear all caches
Remove-Item -Recurse -Force .expo
Remove-Item -Recurse -Force node_modules/.cache

# Restart with cleared cache
npx expo start --web --clear
```

### Network Connection Issues

If mobile app can't connect to backend:

```bash
# Find your IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# Update .env file
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000

# Restart frontend
npx expo start --clear
```

### Backend Issues

```bash
# Check if PostgreSQL is running
# Verify .env file has correct credentials

# Restart backend
cd FullStackBackend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 📚 Documentation

- [Setup Guide](SETUP_GUIDE.md) - Detailed setup instructions
- [Fixes Summary](FIXES_SUMMARY.md) - All implemented fixes
- [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md) - Common issues and solutions
- [Code Snippets](CODE_SNIPPETS.md) - Quick code reference
- [Web Bundle Fix](WEB_BUNDLE_FIX_COMPLETE.md) - Web compilation fixes
- [Blank Screen Fix](BLANK_SCREEN_FIX.md) - Blank screen solutions

## 📚 Documentation

- **[Complete Documentation Index](DOCUMENTATION_INDEX.md)** - Guide to all documentation
- **[Technical Architecture](TECHNICAL_ARCHITECTURE.md)** - Tech stack, API calls, JWT, Bcrypt, error codes
- **[ML Model Explanation](ML_MODEL_EXPLANATION.md)** - Complete ML system guide from scratch
- **[Setup Guide](SETUP_GUIDE.md)** - Detailed setup instructions
- **[Credentials](CREDENTIALS.md)** - Login credentials and troubleshooting
- **[Fixes Summary](FIXES_SUMMARY.md)** - All implemented fixes
- **[Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)** - Common issues and solutions
- **[Code Snippets](CODE_SNIPPETS.md)** - Quick code reference
- **[Web Bundle Fix](WEB_BUNDLE_FIX_COMPLETE.md)** - Web compilation fixes
- **[Blank Screen Fix](BLANK_SCREEN_FIX.md)** - Blank screen solutions
- **[Local Development Fix](LOCAL_DEVELOPMENT_FIX.md)** - Local dev guide

## 🎯 Key Features Implemented

### Issue Fixes
1. ✅ Dashboard state persistence (no more resets)
2. ✅ Admin AQI map with Google Maps integration
3. ✅ Report download with proper state management
4. ✅ Web bundle compilation fixes
5. ✅ Platform-specific component handling
6. ✅ Environment variable configuration
7. ✅ Error boundary for graceful error handling

### Best Practices
- ✅ TypeScript for type safety
- ✅ Modular component architecture
- ✅ Centralized API client
- ✅ AsyncStorage for state persistence
- ✅ Platform-specific code handling
- ✅ Comprehensive error handling
- ✅ Environment-based configuration

## 🔄 Recent Updates

### Latest Changes (April 7, 2026)
- Fixed web bundle compilation errors
- Implemented platform-specific map components
- Added web-compatible DateTimePicker
- Fixed blank screen issues
- Added comprehensive error handling
- Improved environment variable management
- Created automated fix scripts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Ankit** - Initial work and development

## 🙏 Acknowledgments

- Expo team for the amazing React Native framework
- FastAPI team for the excellent Python framework
- React Native Maps for map integration
- All contributors and testers

## 📞 Support

For issues and questions:
- Check the [Troubleshooting Guide](TROUBLESHOOTING_GUIDE.md)
- Review [Documentation](SETUP_GUIDE.md)
- Open an issue on GitHub

---

**Status**: Production Ready ✅  
**Last Updated**: April 7, 2026  
**Version**: 1.0.0
