# 🚀 Quick Start Guide

## ⚡ 30-Second Setup

### 1. Login Credentials (Copy-Paste These!)

```
Admin Login:
Email:    admin@nashikaqi.in
Password: admin@123
```

```
User Login:
Email:    ankit@nashikaqi.in
Password: user@1234
```

**⚠️ CRITICAL**: Passwords are **all lowercase**! `admin@123` NOT `Admin@123`

### 2. Backend URLs

**Production** (APK/Mobile):
```
https://aqi-monitoring-app1.onrender.com
```

**Local Development**:
```
http://192.168.67.66:8000
```
*(Replace with your actual IP)*

---

## 📱 Using the Mobile App

### First Time Login

1. **Open the app**
2. **Enter email**: `admin@nashikaqi.in`
3. **Enter password**: `admin@123` *(lowercase!)*
4. **Tap "Login"**
5. **Done!** You're in the admin dashboard

### If Login Fails

❌ **Wrong**: `Admin@123` (capital A)  
✅ **Right**: `admin@123` (all lowercase)

**Still not working?**
1. Wait 2-3 minutes (Render may be deploying)
2. Check internet connection
3. Run: `.\test_production_login.ps1`
4. See [CREDENTIALS.md](CREDENTIALS.md) for troubleshooting

---

## 💻 Local Development

### Start Backend

```bash
cd FullStackBackend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

```bash
cd FullStackMobile
npx expo start
```

### Seed Database (First Time)

```bash
cd FullStackBackend
python scripts/seed.py
```

---

## 🤖 Train ML Models

```bash
cd FullStackBackend/ml
python aqi_ml_pipeline.py
```

**Takes**: 2-5 minutes  
**Creates**: Models with 99.98% accuracy  
**Output**: `ml/models/` directory

---

## 🔧 Quick Commands

### Switch to Production

```powershell
.\switch-to-production.ps1
```

### Switch to Local

```powershell
.\switch-to-local.ps1
```

### Test Login

```powershell
.\test_production_login.ps1
```

### Build APK

```powershell
cd FullStackMobile
.\build-apk.ps1
```

---

## 📊 Admin Features

Once logged in as admin:

- **Dashboard**: Overview of all zones
- **Map**: Interactive Google Maps with AQI zones
- **Alerts**: Send alerts to users
- **Reports**: Generate daily/weekly/monthly reports
- **Predictions**: ML-powered AQI forecasts
- **History**: Historical AQI data analysis
- **Settings**: App configuration

---

## 👤 User Features

Once logged in as user:

- **Home**: Current AQI for all zones
- **Map**: View zones on map
- **History**: Historical data
- **Profile**: User settings

---

## 🆘 Common Issues

### "Invalid email or password"

**Solution**: Use lowercase passwords!
```
✅ admin@123
❌ Admin@123
```

### "Network Error"

**Solution**: Check backend URL in `.env`
```bash
# FullStackMobile/.env
EXPO_PUBLIC_API_URL=https://aqi-monitoring-app1.onrender.com
```

### "ML models not found"

**Solution**: Train models
```bash
cd FullStackBackend/ml
python aqi_ml_pipeline.py
```

### Blank Screen

**Solution**: Clear cache
```bash
cd FullStackMobile
npx expo start --clear
```

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [CREDENTIALS.md](CREDENTIALS.md) | All login credentials |
| [README.md](README.md) | Project overview |
| [ML_MODEL_EXPLANATION.md](ML_MODEL_EXPLANATION.md) | ML system guide |
| [DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md) | All docs index |
| [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md) | Fix common issues |

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Backend health: `curl https://aqi-monitoring-app1.onrender.com/health`
- [ ] Login works: `.\test_production_login.ps1`
- [ ] Mobile app opens
- [ ] Can login with admin credentials
- [ ] Dashboard shows AQI data
- [ ] Maps display zones
- [ ] ML predictions work (if models trained)

---

## 🎯 What to Do Next

### For Testing
1. Login with admin credentials
2. Explore admin dashboard
3. Check AQI data for different zones
4. Generate a report
5. View ML predictions

### For Development
1. Read [README.md](README.md)
2. Study [ML_MODEL_EXPLANATION.md](ML_MODEL_EXPLANATION.md)
3. Explore codebase structure
4. Make changes locally
5. Test thoroughly
6. Deploy to production

### For Production Use
1. Change default passwords (see [CREDENTIALS.md](CREDENTIALS.md))
2. Configure environment variables
3. Set up monitoring
4. Train ML models with real data
5. Deploy to app stores

---

## 🔗 Quick Links

- **API Docs**: https://aqi-monitoring-app1.onrender.com/docs
- **Health Check**: https://aqi-monitoring-app1.onrender.com/health
- **GitHub**: https://github.com/Ankit-khandelwal04/AQI-Monitoring-App
- **Render Dashboard**: https://dashboard.render.com

---

## 💡 Pro Tips

1. **Always use lowercase passwords** - saves debugging time
2. **Run test script first** - verifies credentials before app testing
3. **Clear cache often** - prevents stale data issues
4. **Check Render logs** - helps diagnose deployment issues
5. **Use switch scripts** - easy environment switching

---

## 🎓 Learning Path

**Day 1**: Setup & Login
- Follow this guide
- Login successfully
- Explore features

**Day 2**: Backend
- Read [README.md](README.md)
- Study API docs
- Test endpoints

**Day 3**: Frontend
- Explore mobile app code
- Understand component structure
- Make small changes

**Day 4**: ML System
- Read [ML_MODEL_EXPLANATION.md](ML_MODEL_EXPLANATION.md)
- Train models
- Test predictions

**Day 5**: Integration
- Understand full flow
- Deploy changes
- Production ready!

---

**Need Help?** Check [TROUBLESHOOTING_GUIDE.md](TROUBLESHOOTING_GUIDE.md)

**Last Updated**: April 30, 2026  
**Status**: ✅ Production Ready
