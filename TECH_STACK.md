# AQI Monitoring App - Technology Stack

## 📱 Frontend / Mobile Application

### Core Framework
- **React Native** `0.81.5` - Cross-platform mobile app framework
- **Expo** `~54.0.6` - Development platform for React Native
- **React** `19.1.0` - UI library
- **TypeScript** `~5.9.2` - Type-safe JavaScript

### Navigation
- **React Navigation** `^7.1.6` - Navigation library
  - Native Stack Navigator `^7.3.10` - Stack-based navigation
  - Drawer Navigator `^7.3.10` - Side drawer menu

### UI & Styling
- **NativeWind** `^4.2.1` - Tailwind CSS for React Native
- **Tailwind CSS** `^3.4.17` - Utility-first CSS framework
- **Expo Vector Icons** `^15.0.3` - Icon library (Ionicons)
- **React Native SVG** `15.12.1` - SVG rendering for custom charts

### Maps & Visualization
- **React Native Maps** `^1.14.0` - Interactive maps with zone overlays
- **Custom SVG Charts** - Built with react-native-svg for AQI visualization

### State & Storage
- **AsyncStorage** `2.2.0` - Local data persistence (tokens, user data)
- **React Hooks** - State management (useState, useEffect, useMemo)

### Utilities
- **React Native Gesture Handler** `~2.28.0` - Touch gesture handling
- **React Native Reanimated** `~4.1.1` - Smooth animations
- **React Native Safe Area Context** `~5.6.0` - Safe area handling
- **React Native Screens** `~4.16.0` - Native screen optimization
- **DateTime Picker** `8.4.4` - Date/time selection for reports

### Web Support
- **React Native Web** `^0.21.0` - Web compatibility
- **React DOM** `19.1.0` - Web rendering
- **Expo Webpack Config** `^19.0.1` - Web bundling

---

## 🔧 Backend / API Server

### Core Framework
- **FastAPI** `0.115.5` - Modern Python web framework
- **Uvicorn** `0.32.1` - ASGI server with WebSocket support
- **Python** `3.11+` - Programming language

### Database
- **PostgreSQL** `16-alpine` - Relational database
- **SQLAlchemy** `2.0.36` - ORM (Object-Relational Mapping)
- **Alembic** `1.14.0` - Database migrations
- **psycopg2-binary** `2.9.10` - PostgreSQL adapter

### Authentication & Security
- **Python-JOSE** `3.3.0` - JWT token generation/validation
- **Passlib** `1.7.4` - Password hashing (bcrypt)
- **Pydantic** `2.10.3` - Data validation & settings management
- **Pydantic Settings** `2.6.1` - Environment configuration
- **Pydantic Email** `2.10.3` - Email validation

### HTTP & API
- **HTTPX** `0.28.1` - Async HTTP client
- **Requests** `2.32.3` - HTTP library
- **Python Multipart** `0.0.20` - File upload support
- **Python Dotenv** `1.0.1` - Environment variable management

### Machine Learning
- **Scikit-learn** `1.5.2` - ML models (Random Forest)
  - Regression model for AQI prediction
  - Classification model for AQI categories
- **Pandas** `2.2.3` - Data manipulation & analysis
- **NumPy** `1.26.4` - Numerical computing
- **Matplotlib** `3.9.2` - Data visualization & plots
- **Seaborn** `0.13.2` - Statistical data visualization

---

## 🗄️ Database & Infrastructure

### Database
- **PostgreSQL** `16-alpine` - Primary database
  - Tables: users, cities, zones, aqi_readings, alerts
  - PostGIS-ready for geospatial data

### Containerization
- **Docker** - Container platform
- **Docker Compose** `3.9` - Multi-container orchestration
  - `db` service: PostgreSQL database
  - `api` service: FastAPI backend

### Database Migrations
- **Alembic** - Version control for database schema
  - Migration scripts in `alembic/versions/`
  - Initial schema: `835cbadf6d2e_initial_schema.py`

---

## 🤖 Machine Learning Pipeline

### Models
- **Random Forest Regressor** - AQI value prediction
  - Features: PM2.5, PM10, NO₂, SO₂, CO, O₃, hour, month, day_of_week, is_weekend, station
  - Accuracy: 99.98%
  - R² Score: 0.9999981631

- **Random Forest Classifier** - AQI category classification
  - Categories: Good, Satisfactory, Moderate, Poor, Very Poor, Severe
  - Multi-class classification

### Training Data
- **Dataset**: `nashik_aqi_cleaned.csv`
  - 157,680 records
  - 9 monitoring stations in Nashik
  - Date range: Historical AQI data

### Model Artifacts
- `aqi_regressor.pkl` - Trained regression model
- `aqi_classifier.pkl` - Trained classification model
- `label_encoder.pkl` - Station name encoder
- `model_metadata.json` - Model performance metrics

### Visualization
- Feature importance plots
- Confusion matrix
- Prediction vs Actual scatter plots
- Time series trends
- Hourly patterns

---

## 🗺️ External APIs & Services

### Google Maps API
- **Geocoding** - Convert addresses to coordinates
- **Places API** - City/zone location data
- Used in: Zone creation, map visualization

### GeoJSON
- **Custom GeoJSON** - Zone boundaries with AQI data
- **Properties**: zone_id, zone_name, aqi_value, level, color_code
- Real-time AQI overlay on maps

---

## 🔐 Authentication & Authorization

### JWT (JSON Web Tokens)
- **Algorithm**: HS256
- **Token Expiry**: 60 minutes (configurable)
- **Storage**: AsyncStorage (mobile), HTTP-only cookies (web)

### Role-Based Access Control (RBAC)
- **Admin Role**: Full access to all endpoints
  - Dashboard analytics
  - Alert broadcasting
  - Zone management
  - ML predictions
  - Report generation

- **User Role**: Limited access
  - View AQI data
  - View zones
  - View alerts
  - Personal dashboard

### Password Security
- **Bcrypt hashing** - Secure password storage
- **Salt rounds**: Automatic via passlib

---

## 📊 API Architecture

### RESTful Endpoints
- `/auth` - Authentication (login, register)
- `/aqi` - AQI data (current, historical)
- `/zones` - Zone management
- `/cities` - City data
- `/admin` - Admin dashboard & analytics
- `/alerts` - Alert management
- `/maps` - GeoJSON & map data
- `/reports` - Report generation
- `/ml` - Machine learning predictions

### Response Format
```json
{
  "status": "success",
  "data": { ... },
  "message": "Optional message"
}
```

### Error Handling
- HTTP status codes (400, 401, 403, 404, 500)
- Structured error responses
- Logging with Python logging module

---

## 🎨 UI/UX Features

### Admin Dashboard
- **Real-time AQI monitoring** - Live zone data
- **Interactive maps** - Zone boundaries with color coding
- **Historical data analysis** - Time period selector (1M, 3M, 6M, 1Y)
- **ML predictions** - 24-72 hour forecasts
- **Alert management** - Broadcast to affected zones
- **Report generation** - PDF/CSV exports

### User Dashboard
- **Current AQI** - Real-time air quality
- **Zone selection** - View specific areas
- **Historical trends** - Past AQI data
- **Alerts** - Receive notifications
- **Health recommendations** - Based on AQI levels

### Design System
- **Color Coding**:
  - 🟢 Green (0-50): Good
  - 🟡 Yellow (51-100): Satisfactory
  - 🟠 Orange (101-200): Moderate
  - 🔴 Red (201-300): Poor
  - 🟣 Purple (301+): Very Poor

- **Typography**: System fonts with weight variations
- **Spacing**: Consistent padding/margins
- **Shadows**: Subtle elevation for cards
- **Animations**: Smooth transitions with Reanimated

---

## 🛠️ Development Tools

### Version Control
- **Git** - Source control
- **GitHub** - Repository hosting

### Code Quality
- **TypeScript** - Type checking (frontend)
- **Pydantic** - Data validation (backend)
- **ESLint** - JavaScript linting (optional)
- **Black** - Python code formatting (optional)

### Environment Management
- **Python venv** - Virtual environment
- **npm/yarn** - Node package management
- **.env files** - Environment variables

### Testing & Debugging
- **Health check scripts** - `health_check.py`
- **API verification** - `verify_api.py`
- **ML debugging** - `debug_ml.py`
- **Database seeding** - `seed_db.py`

---

## 🚀 Deployment

### Backend Deployment
- **Host**: 0.0.0.0 (network accessible)
- **Port**: 8000
- **Server**: Uvicorn with auto-reload (dev)
- **Production**: Uvicorn with multiple workers

### Database Deployment
- **Docker container** - PostgreSQL 16
- **Port**: 5432
- **Persistent storage** - Docker volumes

### Mobile Deployment
- **Development**: Expo Go app
- **Production**: 
  - Android: APK/AAB via Expo Build
  - iOS: IPA via Expo Build
  - Web: Static hosting (Vercel, Netlify)

### Environment Configuration
- **Backend**: `.env` file with DATABASE_URL, SECRET_KEY, etc.
- **Frontend**: `.env` with EXPO_PUBLIC_API_URL
- **Network**: Update IP when WiFi changes

---

## 📦 Project Structure

```
Full Stack/
├── FullStackBackend/          # Python FastAPI backend
│   ├── app/
│   │   ├── routers/           # API endpoints
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── utils/             # Helpers (security, response)
│   │   └── database/          # DB connection
│   ├── ml/                    # Machine learning
│   │   ├── models/            # Trained models (.pkl)
│   │   ├── data/              # Training data
│   │   └── plots/             # Visualizations
│   ├── alembic/               # Database migrations
│   ├── scripts/               # Utility scripts
│   └── requirements.txt       # Python dependencies
│
└── FullStackMobile/           # React Native frontend
    ├── src/
    │   ├── screens/           # App screens
    │   │   ├── admin/         # Admin dashboard
    │   │   └── user/          # User screens
    │   ├── components/        # Reusable components
    │   ├── utils/             # API client, helpers
    │   └── navigation/        # Navigation setup
    ├── assets/                # Images, fonts
    └── package.json           # Node dependencies
```

---

## 🔑 Key Features by Technology

### FastAPI Powers:
- ✅ Auto-generated API documentation (Swagger UI)
- ✅ Async request handling
- ✅ Data validation with Pydantic
- ✅ JWT authentication
- ✅ CORS middleware

### React Native Enables:
- ✅ Cross-platform mobile app (iOS, Android, Web)
- ✅ Native performance
- ✅ Hot reload for fast development
- ✅ Rich ecosystem of libraries

### PostgreSQL Provides:
- ✅ ACID compliance
- ✅ Complex queries with joins
- ✅ Geospatial support (PostGIS-ready)
- ✅ Scalability

### Scikit-learn Delivers:
- ✅ 99.98% accurate AQI predictions
- ✅ Multi-station forecasting
- ✅ Feature importance analysis
- ✅ Category classification

---

## 📈 Performance Optimizations

### Frontend
- **useMemo** - Cached data generation (historical page)
- **React.memo** - Component memoization
- **Lazy loading** - On-demand screen loading
- **AsyncStorage** - Fast local data access

### Backend
- **Module-level caching** - ML models loaded once
- **Database indexing** - Fast queries on zone_id, timestamp
- **Connection pooling** - SQLAlchemy session management
- **Async endpoints** - Non-blocking I/O

### Database
- **Indexes** - Primary keys, foreign keys
- **Migrations** - Version-controlled schema changes
- **Docker volumes** - Persistent data storage

---

## 🔒 Security Features

- ✅ JWT token authentication
- ✅ Bcrypt password hashing
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ Input validation (Pydantic)
- ✅ Environment variable secrets
- ✅ Role-based access control

---

## 📝 Summary

This is a **full-stack, production-ready AQI monitoring system** built with:
- **Modern Python backend** (FastAPI + PostgreSQL)
- **Cross-platform mobile app** (React Native + Expo)
- **Machine learning predictions** (Scikit-learn)
- **Real-time data visualization** (Maps + Charts)
- **Secure authentication** (JWT + RBAC)
- **Containerized deployment** (Docker)

**Total Technologies**: 40+ libraries and frameworks working together to create a comprehensive air quality monitoring solution for smart cities.
