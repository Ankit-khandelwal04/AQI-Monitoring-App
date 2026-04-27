# Backend Hosting Guide - AQI Monitoring API

## 🌐 Hosting Your FastAPI Backend

This guide covers multiple hosting options from free to production-grade solutions.

---

## 🎯 Quick Comparison of Hosting Options

| Platform | Cost | Difficulty | Best For |
|----------|------|------------|----------|
| **Render** | Free tier available | Easy | Quick deployment, testing |
| **Railway** | Free $5 credit/month | Easy | Development, small projects |
| **Heroku** | $5-7/month | Easy | Established platform |
| **DigitalOcean** | $4-6/month | Medium | Full control, scalability |
| **AWS EC2** | $3-10/month | Hard | Enterprise, full control |
| **Google Cloud Run** | Pay per use | Medium | Serverless, auto-scaling |
| **Azure App Service** | $13+/month | Medium | Microsoft ecosystem |

**Recommended for beginners**: Render (free tier) or Railway

---

## Option 1: Render (Recommended - Free Tier Available)

### Why Render?
- ✅ Free tier with 750 hours/month
- ✅ Automatic HTTPS
- ✅ Easy PostgreSQL database
- ✅ GitHub integration (auto-deploy)
- ✅ No credit card required for free tier

### Step 1: Prepare Your Backend

Create `render.yaml` in `FullStackBackend/`:

```yaml
services:
  - type: web
    name: aqi-monitoring-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
      - key: DATABASE_URL
        fromDatabase:
          name: aqi-postgres
          property: connectionString
      - key: SECRET_KEY
        generateValue: true
      - key: ALGORITHM
        value: HS256
      - key: ACCESS_TOKEN_EXPIRE_MINUTES
        value: 60
      - key: ALLOWED_ORIGINS
        value: "*"

databases:
  - name: aqi-postgres
    databaseName: aqi_db
    user: postgres
```

### Step 2: Update Requirements
Add to `requirements.txt`:
```
gunicorn==21.2.0
```

### Step 3: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub
3. Authorize Render to access your repositories

### Step 4: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `FullStackBackend` directory
4. Configure:
   - **Name**: aqi-monitoring-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 5: Create PostgreSQL Database
1. Click "New +" → "PostgreSQL"
2. Configure:
   - **Name**: aqi-postgres
   - **Database**: aqi_db
   - **Plan**: Free (1GB storage)
3. Copy the "Internal Database URL"

### Step 6: Set Environment Variables
In your web service settings, add:
```
DATABASE_URL=<your-postgres-internal-url>
SECRET_KEY=<generate-random-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=*
GOOGLE_MAPS_API_KEY=<your-api-key>
```

### Step 7: Deploy
1. Click "Manual Deploy" → "Deploy latest commit"
2. Wait 5-10 minutes for build
3. Your API will be live at: `https://aqi-monitoring-api.onrender.com`

### Step 8: Run Database Migrations
Use Render Shell:
1. Go to your web service
2. Click "Shell" tab
3. Run:
```bash
alembic upgrade head
python scripts/seed_db.py
```

### Step 9: Test Your API
```bash
curl https://aqi-monitoring-api.onrender.com/health
```

---

## Option 2: Railway (Easy with Free Credits)

### Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Get $5 free credit per month

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository
4. Select `FullStackBackend` as root directory

### Step 3: Add PostgreSQL
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically creates database
3. Connection string is auto-injected as `DATABASE_URL`

### Step 4: Configure Environment Variables
Add in Railway dashboard:
```
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=*
GOOGLE_MAPS_API_KEY=your-api-key
PORT=8000
```

### Step 5: Configure Start Command
In Railway settings:
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Step 6: Deploy
Railway auto-deploys on every git push!

Your API will be at: `https://your-app.railway.app`

---

## Option 3: DigitalOcean Droplet (Full Control)

### Step 1: Create Droplet
1. Sign up at https://www.digitalocean.com
2. Create Droplet:
   - **Image**: Ubuntu 22.04 LTS
   - **Plan**: Basic ($4-6/month)
   - **Size**: 1GB RAM minimum
   - **Region**: Closest to your users

### Step 2: SSH into Server
```bash
ssh root@your-droplet-ip
```

### Step 3: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Python 3.11
apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL
apt install postgresql postgresql-contrib -y

# Install Nginx (reverse proxy)
apt install nginx -y

# Install Certbot (for HTTPS)
apt install certbot python3-certbot-nginx -y
```

### Step 4: Setup PostgreSQL
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE aqi_db;
CREATE USER aqi_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE aqi_db TO aqi_user;
\q
```

### Step 5: Clone Your Repository
```bash
cd /var/www
git clone https://github.com/yourusername/your-repo.git
cd your-repo/FullStackBackend
```

### Step 6: Setup Python Environment
```bash
python3.11 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Step 7: Configure Environment
Create `.env` file:
```bash
nano .env
```

Add:
```
DATABASE_URL=postgresql://aqi_user:your-secure-password@localhost/aqi_db
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=*
GOOGLE_MAPS_API_KEY=your-api-key
```

### Step 8: Run Migrations
```bash
alembic upgrade head
python scripts/seed_db.py
python ml/aqi_ml_pipeline.py  # Train ML models
```

### Step 9: Setup Systemd Service
Create service file:
```bash
nano /etc/systemd/system/aqi-api.service
```

Add:
```ini
[Unit]
Description=AQI Monitoring API
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/your-repo/FullStackBackend
Environment="PATH=/var/www/your-repo/FullStackBackend/venv/bin"
ExecStart=/var/www/your-repo/FullStackBackend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
systemctl enable aqi-api
systemctl start aqi-api
systemctl status aqi-api
```

### Step 10: Configure Nginx
```bash
nano /etc/nginx/sites-available/aqi-api
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/aqi-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 11: Setup HTTPS with Let's Encrypt
```bash
certbot --nginx -d your-domain.com
```

Your API is now live at: `https://your-domain.com`

---

## Option 4: Docker Deployment (Any Platform)

### Step 1: Update Dockerfile
Ensure `FullStackBackend/Dockerfile` exists:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Run migrations and start server
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

### Step 2: Update docker-compose.yml
```yaml
version: "3.9"

services:
  db:
    image: postgres:16-alpine
    container_name: aqi_postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: aqi_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    container_name: aqi_api
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://postgres:${DB_PASSWORD}@db:5432/aqi_db
      SECRET_KEY: ${SECRET_KEY}
      ALGORITHM: HS256
      ACCESS_TOKEN_EXPIRE_MINUTES: 60
      ALLOWED_ORIGINS: "*"
      GOOGLE_MAPS_API_KEY: ${GOOGLE_MAPS_API_KEY}
    depends_on:
      - db
    volumes:
      - ./ml/models:/app/ml/models

volumes:
  postgres_data:
```

### Step 3: Deploy with Docker
```bash
docker-compose up -d
```

---

## 🔗 Connecting Mobile App to Hosted Backend

### Step 1: Get Your Backend URL
After hosting, you'll have a URL like:
- Render: `https://aqi-monitoring-api.onrender.com`
- Railway: `https://your-app.railway.app`
- DigitalOcean: `https://your-domain.com`
- Custom: `https://api.yourdomain.com`

### Step 2: Update Mobile App Environment
Edit `FullStackMobile/.env`:

```bash
# Production Backend URL
EXPO_PUBLIC_API_URL=https://aqi-monitoring-api.onrender.com
```

### Step 3: Update CORS in Backend
Edit `FullStackBackend/.env`:

```bash
# Allow your mobile app to access the API
ALLOWED_ORIGINS=*
# Or specific origins:
# ALLOWED_ORIGINS=https://yourdomain.com,exp://localhost:8081
```

### Step 4: Rebuild Mobile App
```bash
cd FullStackMobile
eas build --platform android --profile production
```

### Step 5: Test Connection
1. Install new APK on device
2. Try to login
3. Check if data loads
4. Monitor backend logs

---

## 🔒 Security Best Practices

### 1. Environment Variables
Never commit sensitive data. Use environment variables:
```bash
# Backend .env
SECRET_KEY=<generate-with-openssl-rand-hex-32>
DATABASE_URL=<your-database-url>
GOOGLE_MAPS_API_KEY=<your-api-key>
```

### 2. CORS Configuration
Restrict origins in production:
```python
# app/config.py
ALLOWED_ORIGINS = "https://yourdomain.com,https://app.yourdomain.com"
```

### 3. HTTPS Only
Always use HTTPS in production:
- Render: Automatic
- Railway: Automatic
- DigitalOcean: Use Certbot (Let's Encrypt)

### 4. Database Security
- Use strong passwords
- Enable SSL connections
- Regular backups
- Restrict access by IP (if possible)

### 5. API Rate Limiting
Add rate limiting to prevent abuse:
```bash
pip install slowapi
```

```python
# app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/data")
@limiter.limit("100/minute")
async def get_data(request: Request):
    return {"data": "..."}
```

---

## 📊 Monitoring & Logging

### Option 1: Built-in Logging
Your FastAPI app already logs to stdout. View logs:

**Render**:
```
Dashboard → Logs tab
```

**Railway**:
```
Dashboard → Deployments → View Logs
```

**DigitalOcean**:
```bash
journalctl -u aqi-api -f
```

### Option 2: External Monitoring
- **Sentry**: Error tracking (https://sentry.io)
- **Datadog**: Full monitoring (https://www.datadoghq.com)
- **New Relic**: Performance monitoring (https://newrelic.com)

---

## 🔄 Continuous Deployment

### GitHub Actions (Auto-deploy on push)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

Add `RENDER_DEPLOY_HOOK` to GitHub Secrets.

---

## 🧪 Testing Your Hosted Backend

### Test Health Endpoint
```bash
curl https://your-backend-url.com/health
```

Expected response:
```json
{
  "status": "success",
  "data": {
    "healthy": true
  }
}
```

### Test Login
```bash
curl -X POST https://your-backend-url.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@nashikaqi.in",
    "password": "Admin@123"
  }'
```

### Test API Documentation
Visit: `https://your-backend-url.com/docs`

---

## 💰 Cost Estimates

### Free Tier Options
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **Railway**: $5 credit/month (enough for small apps)
- **Heroku**: No longer has free tier

### Paid Options (Monthly)
- **Render**: $7/month (always on)
- **Railway**: ~$5-10/month (pay per use)
- **DigitalOcean**: $4-6/month (1GB RAM droplet)
- **AWS EC2**: $3-10/month (t2.micro to t2.small)
- **Google Cloud Run**: $0-5/month (pay per request)

### Database Costs
- **Render PostgreSQL**: Free (1GB) or $7/month (10GB)
- **Railway PostgreSQL**: Included in usage
- **DigitalOcean Managed DB**: $15/month
- **AWS RDS**: $15-30/month

---

## 🚀 Quick Start: Render Deployment

```bash
# 1. Push your code to GitHub
git add .
git commit -m "Prepare for deployment"
git push origin main

# 2. Go to render.com and sign up

# 3. Create Web Service
# - Connect GitHub repo
# - Select FullStackBackend directory
# - Build: pip install -r requirements.txt
# - Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT

# 4. Create PostgreSQL database
# - Copy internal database URL

# 5. Add environment variables
# - DATABASE_URL: <from step 4>
# - SECRET_KEY: <generate random string>
# - ALGORITHM: HS256
# - ACCESS_TOKEN_EXPIRE_MINUTES: 60
# - ALLOWED_ORIGINS: *

# 6. Deploy and wait 5-10 minutes

# 7. Run migrations via Render Shell
alembic upgrade head
python scripts/seed_db.py

# 8. Test your API
curl https://your-app.onrender.com/health

# 9. Update mobile app .env
# EXPO_PUBLIC_API_URL=https://your-app.onrender.com

# 10. Rebuild APK
cd FullStackMobile
eas build --platform android --profile production
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Database connection failed"
**Solution**:
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database is running
- Check firewall rules

### Issue 2: "CORS error in mobile app"
**Solution**:
- Add `*` to `ALLOWED_ORIGINS` for testing
- Or add specific origin: `https://yourdomain.com`
- Restart backend after changing CORS

### Issue 3: "App sleeps on free tier"
**Solution**:
- Upgrade to paid plan ($7/month on Render)
- Or use a cron job to ping your API every 10 minutes
- Or accept 15-30 second cold start delay

### Issue 4: "ML models not found"
**Solution**:
- Train models after deployment:
```bash
python ml/aqi_ml_pipeline.py
```
- Or upload pre-trained models to server

### Issue 5: "Port already in use"
**Solution**:
- Use `$PORT` environment variable (provided by host)
- Update start command: `--port $PORT`

---

## ✅ Deployment Checklist

Before going live:

- [ ] Backend code pushed to GitHub
- [ ] `.env` file configured (not committed!)
- [ ] Database created and accessible
- [ ] Environment variables set on hosting platform
- [ ] Migrations run successfully
- [ ] Database seeded with initial data
- [ ] ML models trained (if using predictions)
- [ ] API health endpoint returns 200
- [ ] Login endpoint works
- [ ] CORS configured correctly
- [ ] HTTPS enabled (automatic on most platforms)
- [ ] Mobile app `.env` updated with backend URL
- [ ] APK rebuilt with production backend URL
- [ ] Tested login from mobile app
- [ ] Tested data loading from mobile app
- [ ] Monitoring/logging setup (optional)

---

## 📞 Support Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **DigitalOcean Tutorials**: https://www.digitalocean.com/community/tutorials
- **FastAPI Deployment**: https://fastapi.tiangolo.com/deployment/
- **PostgreSQL Docs**: https://www.postgresql.org/docs/

---

## 🎉 Success!

Your backend is now hosted and accessible from anywhere! Your mobile app can connect to it using the production URL.

**Next Steps**:
1. Build your APK with production backend URL
2. Test thoroughly
3. Distribute to users
4. Monitor logs and performance
5. Set up automatic backups
6. Plan for scaling as users grow

Good luck with your AQI Monitoring App! 🚀
