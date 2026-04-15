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
- AQI prediction
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

### Admin Account
- Email: `admin@nashikaqi.in`
- Password: `admin@123`

### User Account
- Email: `ankit@nashikaqi.in`
- Password: `user@1234`

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

## 🐛 Troubleshooting

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
