# Deployment Guide

## Table of Contents
1. [Overview](#overview)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment Options](#backend-deployment-options)
4. [Environment Configuration](#environment-configuration)
5. [Database Migration](#database-migration)
6. [CI/CD Setup](#cicd-setup)
7. [Domain Configuration](#domain-configuration)
8. [Monitoring & Logging](#monitoring--logging)
9. [Scaling Guide](#scaling-guide)
10. [Troubleshooting](#troubleshooting)

---

## Overview

PaperLens AI uses a **decoupled architecture** with separate frontend and backend deployments:

- **Frontend:** Static React app deployed on Vercel
- **Backend:** FastAPI application deployed on Railway/Render/AWS/Heroku
- **Database:** ChromaDB vector store (persistent volumes required)

### Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    USERS                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              VERCEL CDN (Frontend)                  │
│  https://paperlens.vercel.app                       │
│  - React static files                               │
│  - Global CDN distribution                          │
│  - Automatic HTTPS                                  │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS API calls
                   ▼
┌─────────────────────────────────────────────────────┐
│         RAILWAY/RENDER (Backend)                    │
│  https://api.paperlens.com                          │
│  - FastAPI application                              │
│  - ChromaDB vector store                            │
│  - PDF storage                                      │
│  - OpenAI API integration                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           EXTERNAL SERVICES                         │
│  - OpenAI API                                       │
│  - (Future: PostgreSQL for user DB)                 │
└─────────────────────────────────────────────────────┘
```

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier works)
- Git repository with code

### Step-by-Step Deployment

#### 1. Prepare Frontend
```bash
cd frontend

# Install dependencies
npm install

# Test build locally
npm run build

# Verify dist/ folder created
ls dist/
```

#### 2. Configure Environment Variables
Create `frontend/.env.production`:
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

**Important:** Do NOT include sensitive keys in frontend `.env` (they're exposed to browser)

#### 3. Deploy to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod

# Follow prompts:
# - Set project name: paperlens-frontend
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

**Option B: Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your Git repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. Add environment variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend-url.railway.app`
6. Click "Deploy"

#### 4. Verify Deployment
- Visit the provided URL (e.g., `https://paperlens-frontend.vercel.app`)
- Check browser console for errors
- Test API connectivity (upload a paper)

#### 5. Custom Domain (Optional)
1. Go to Project Settings → Domains
2. Add your domain (e.g., `www.paperlens.ai`)
3. Configure DNS:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Vercel automatically provisions SSL certificate

### Vercel Configuration File

The project includes `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/assets/(.*)",
      "dest": "/assets/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://api.yourdomain.com"
  }
}
```

### Automatic Deployments
- **Push to main:** Triggers production deployment
- **Pull requests:** Creates preview deployments
- **Rollback:** Instant rollback to previous deployments

---

## Backend Deployment Options

### Option 1: Railway (Recommended)

#### Why Railway?
- ✅ Free tier with generous resources
- ✅ PostgreSQL database included
- ✅ Persistent volumes for ChromaDB
- ✅ Automatic HTTPS
- ✅ Environment variable management
- ✅ Easy GitHub integration

#### Deployment Steps

1. **Sign Up:** Go to [railway.app](https://railway.app)

2. **Create New Project:**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure Service:**
   ```yaml
   # railway.toml (create in root directory)
   [build]
   builder = "NIXPACKS"
   buildCommand = "pip install -r backend/requirements.txt"

   [deploy]
   startCommand = "cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT"
   healthcheckPath = "/health"
   healthcheckTimeout = 100
   restartPolicyType = "ON_FAILURE"
   restartPolicyMaxRetries = 10
   ```

4. **Environment Variables:**
   ```bash
   OPENAI_API_KEY=sk-proj-...
   JWT_SECRET_KEY=<generated-secret>
   PORT=8000
   PYTHONPATH=/app/backend
   ```

5. **Add Persistent Volume:**
   - Go to Service → Variables → Volumes
   - Mount path: `/app/backend/vector_store`
   - Size: 5GB

6. **Deploy:**
   - Railway auto-deploys on Git push
   - Get public URL: `https://your-app.railway.app`

7. **Health Check Endpoint:**
   Add to `backend/main.py`:
   ```python
   @app.get("/health")
   async def health_check():
       return {"status": "healthy", "timestamp": time.time()}
   ```

### Option 2: Render

#### Deployment Steps

1. **Create Web Service:**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repo

2. **Configuration:**
   - **Name:** paperlens-backend
   - **Environment:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** Free tier

3. **Environment Variables:**
   Same as Railway

4. **Persistent Disk:**
   - Add disk at `/app/backend/vector_store`
   - Size: 5GB

### Option 3: AWS EC2

#### Launch EC2 Instance

1. **Create Instance:**
   ```bash
   # AMI: Ubuntu 22.04 LTS
   # Instance Type: t2.small (2GB RAM minimum)
   # Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
   ```

2. **SSH into Instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install Dependencies:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y

   # Install Python 3.9+
   sudo apt install python3.9 python3.9-venv python3-pip -y

   # Install Nginx
   sudo apt install nginx -y

   # Install Certbot (SSL)
   sudo apt install certbot python3-certbot-nginx -y
   ```

4. **Clone Repository:**
   ```bash
   git clone https://github.com/yourusername/research-reviewer.git
   cd research-reviewer/backend
   ```

5. **Setup Virtual Environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

6. **Configure Environment:**
   ```bash
   nano .env
   # Add variables:
   OPENAI_API_KEY=sk-...
   JWT_SECRET_KEY=...
   ```

7. **Create Systemd Service:**
   ```bash
   sudo nano /etc/systemd/system/paperlens.service
   ```

   ```ini
   [Unit]
   Description=PaperLens FastAPI
   After=network.target

   [Service]
   User=ubuntu
   WorkingDirectory=/home/ubuntu/research-reviewer/backend
   Environment="PATH=/home/ubuntu/research-reviewer/backend/venv/bin"
   ExecStart=/home/ubuntu/research-reviewer/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl start paperlens
   sudo systemctl enable paperlens
   ```

8. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/sites-available/paperlens
   ```

   ```nginx
   server {
       listen 80;
       server_name api.yourdomain.com;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/paperlens /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Setup SSL:**
   ```bash
   sudo certbot --nginx -d api.yourdomain.com
   ```

### Option 4: Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create paperlens-backend

# Set buildpack
heroku buildpacks:set heroku/python

# Configure app
echo "web: cd backend && uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Deploy
git push heroku main

# Set environment variables
heroku config:set OPENAI_API_KEY=sk-...
heroku config:set JWT_SECRET_KEY=...
```

---

## Environment Configuration

### Backend Environment Variables

#### Required
```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-your-key-here

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-here  # Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"

# Server (Railway/Render set this automatically)
PORT=8000
```

#### Optional
```bash
# CORS Origins (comma-separated)
ALLOWED_ORIGINS=https://paperlens.vercel.app,https://www.paperlens.ai

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW=3600

# Logging
LOG_LEVEL=INFO
```

### Frontend Environment Variables

```bash
# API URL (production backend)
VITE_API_URL=https://your-backend.railway.app

# Alternative for custom domain
VITE_API_URL=https://api.paperlens.ai
```

### Environment File Structure
```
backend/
  .env                  # Local development (gitignored)
  .env.example          # Template (committed to Git)
  .env.production       # Production values (deploy platform)

frontend/
  .env.development      # Local API URL
  .env.production       # Production API URL
```

---

## Database Migration

### Current Architecture
```
users.json           → File-based user storage
vector_store/        → ChromaDB (file-based)
uploads/             → PDF files
reports/             → Generated reports
```

### Migration to PostgreSQL (Recommended for Production)

#### Why PostgreSQL?
- Transactional integrity
- Better concurrency
- Backups and replication
- Scalability

#### Migration Steps

1. **Add PostgreSQL Dependency:**
   ```bash
   pip install psycopg2-binary sqlalchemy
   ```

2. **Create Database Schema:**
   ```sql
   CREATE TABLE users (
       id SERIAL PRIMARY KEY,
       email VARCHAR(254) UNIQUE NOT NULL,
       hashed_password VARCHAR(255) NOT NULL,
       name VARCHAR(100) NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   CREATE TABLE papers (
       id UUID PRIMARY KEY,
       user_id INTEGER REFERENCES users(id),
       filename VARCHAR(255) NOT NULL,
       upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       file_path VARCHAR(500) NOT NULL
   );

   CREATE TABLE reviews (
       id UUID PRIMARY KEY,
       paper_id UUID REFERENCES papers(id),
       review_type VARCHAR(50) NOT NULL,
       content JSONB NOT NULL,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

3. **Update Backend Code:**
   ```python
   # backend/database.py
   from sqlalchemy import create_engine
   from sqlalchemy.orm import sessionmaker

   DATABASE_URL = os.getenv("DATABASE_URL")
   engine = create_engine(DATABASE_URL)
   SessionLocal = sessionmaker(bind=engine)
   ```

4. **Migrate Data:**
   ```python
   import json
   from sqlalchemy.orm import Session

   def migrate_users():
       with open("users.json") as f:
           users_data = json.load(f)
       
       db = SessionLocal()
       for user in users_data:
           db_user = User(
               email=user["email"],
               hashed_password=user["hashed_password"],
               name=user["name"]
           )
           db.add(db_user)
       db.commit()
   ```

5. **Deploy with PostgreSQL:**
   ```bash
   # Railway: Add PostgreSQL plugin (automatic DATABASE_URL)
   # Render: Add PostgreSQL database (copy connection string)
   # AWS: Use RDS PostgreSQL
   ```

### Vector Store Migration
ChromaDB supports persistent storage:
```python
# Ensure persistent directory
client = chromadb.PersistentClient(path="./vector_store")

# Railway/Render: Mount volume at /app/backend/vector_store
```

---

## CI/CD Setup

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      
      - name: Run tests
        run: |
          cd backend
          pytest --cov=. --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      
      - name: Run tests
        run: |
          cd frontend
          npm test
      
      - name: Build
        run: |
          cd frontend
          npm run build

  deploy-frontend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./frontend

  deploy-backend:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

### Pre-commit Hooks
```bash
# Install pre-commit
pip install pre-commit

# Create .pre-commit-config.yaml
cat > .pre-commit-config.yaml << 'EOF'
repos:
  - repo: https://github.com/psf/black
    rev: 23.1.0
    hooks:
      - id: black
        language_version: python3.9

  - repo: https://github.com/pycqa/flake8
    rev: 6.0.0
    hooks:
      - id: flake8

  - repo: https://github.com/pre-commit/mirrors-eslint
    rev: v8.35.0
    hooks:
      - id: eslint
        files: \.[jt]sx?$
        types: [file]
EOF

# Install hooks
pre-commit install
```

---

## Domain Configuration

### Frontend Domain
1. **Vercel Dashboard:**
   - Settings → Domains
   - Add domain: `www.paperlens.ai`

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 3600
   ```

### Backend Domain
1. **Railway Dashboard:**
   - Settings → Networking → Custom Domain
   - Add: `api.paperlens.ai`

2. **DNS Configuration:**
   ```
   Type: CNAME
   Name: api
   Value: your-project.railway.app
   TTL: 3600
   ```

3. **Update Frontend .env:**
   ```bash
   VITE_API_URL=https://api.paperlens.ai
   ```

### SSL Certificates
- **Vercel:** Automatic (Let's Encrypt)
- **Railway:** Automatic (Let's Encrypt)
- **AWS/Custom:** Use Certbot or AWS Certificate Manager

---

## Monitoring & Logging

### Application Monitoring

#### Sentry (Error Tracking)
```bash
pip install sentry-sdk[fastapi]
```

```python
# backend/main.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN"),
    traces_sample_rate=1.0,
)
```

#### LogDNA / Papertrail (Log Management)
```bash
# Railway: Add LogDNA integration
# Sends all stdout/stderr to LogDNA dashboard
```

### Performance Monitoring

#### New Relic
```bash
pip install newrelic
newrelic-admin run-program uvicorn main:app
```

#### Datadog
```bash
pip install ddtrace
ddtrace-run uvicorn main:app
```

### Uptime Monitoring

#### UptimeRobot (Free)
- Monitor: `https://api.paperlens.ai/health`
- Interval: 5 minutes
- Alerts: Email/SMS on downtime

#### Pingdom
- Advanced monitoring
- Global checks
- Performance insights

---

## Scaling Guide

### Horizontal Scaling

#### Railway
```bash
# CLI scaling
railway scale --copies 3

# Dashboard: Settings → Replicas → 3
```

#### Load Balancer Setup (AWS)
```
┌──────────────────┐
│  Application     │
│  Load Balancer   │
└────────┬─────────┘
         │
    ┌────┴─────────┬────────────┐
    ▼              ▼            ▼
┌────────┐    ┌────────┐   ┌────────┐
│ EC2-1  │    │ EC2-2  │   │ EC2-3  │
└────────┘    └────────┘   └────────┘
```

### Vertical Scaling
```yaml
# Railway: Upgrade plan
# Free: 512MB RAM, 1 vCPU
# Hobby: 8GB RAM, 8 vCPU
# Pro: 32GB RAM, 32 vCPU
```

### Caching Layer

#### Redis (Response Caching)
```python
import redis
from functools import lru_cache

redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)

@router.get("/review/{paper_id}")
async def get_review(paper_id: str):
    # Check cache
    cached = redis_client.get(f"review:{paper_id}")
    if cached:
        return json.loads(cached)
    
    # Generate review
    review = generate_review(paper_id)
    
    # Cache for 1 hour
    redis_client.setex(f"review:{paper_id}", 3600, json.dumps(review))
    
    return review
```

### Database Optimization

#### Read Replicas
```python
# Master (write operations)
master_engine = create_engine(MASTER_DB_URL)

# Replica (read operations)
replica_engine = create_engine(REPLICA_DB_URL)

def get_user(email: str):
    # Use replica for reads
    with replica_engine.connect() as conn:
        return conn.execute(f"SELECT * FROM users WHERE email = '{email}'").fetchone()
```

### CDN for Assets
- Store PDFs in S3 + CloudFront
- Reduce backend load
- Global distribution

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors
**Symptom:** Frontend can't connect to backend
```
Access to fetch at 'https://api.paperlens.ai' from origin 'https://paperlens.vercel.app' has been blocked by CORS policy
```

**Solution:**
```python
# backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://paperlens.vercel.app"],  # Add your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 2. 502 Bad Gateway
**Symptom:** Backend not responding

**Checks:**
```bash
# Verify service is running
curl https://api.paperlens.ai/health

# Check logs
railway logs

# Verify environment variables
railway variables
```

#### 3. Rate Limit Issues
**Symptom:** 429 Too Many Requests

**Solution:**
```python
# Increase limits for authenticated users
RATE_LIMITS["default"]["authenticated_limit"] = 200

# Or exempt certain IPs
if get_client_ip(request) in WHITELIST_IPS:
    return  # Skip rate limiting
```

#### 4. File Upload Failures
**Symptom:** PDF upload returns 400/500

**Debug:**
```python
# Add detailed logging
logger.info(f"File size: {len(content)} bytes")
logger.info(f"Content type: {file.content_type}")
logger.info(f"Magic bytes: {content[:4]}")

# Check disk space
import shutil
free_space = shutil.disk_usage("/").free
logger.info(f"Free disk space: {free_space / (1024**3):.2f} GB")
```

#### 5. OpenAI API Errors
**Symptom:** Review generation fails

**Solution:**
```python
# Add retry logic
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_openai_api(prompt: str):
    return openai.ChatCompletion.create(...)
```

### Health Check Debugging
```bash
# Test endpoints
curl -X GET https://api.paperlens.ai/health
curl -X POST https://api.paperlens.ai/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","name":"Test"}'

# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://api.paperlens.ai/health

# curl-format.txt:
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_starttransfer:  %{time_starttransfer}\n
time_total:  %{time_total}\n
```

---

## Post-Deployment Checklist

### Immediate (Day 1)
- [ ] Frontend accessible and loads correctly
- [ ] Backend health check returns 200
- [ ] User signup/login works
- [ ] PDF upload succeeds
- [ ] Review generation completes
- [ ] No console errors
- [ ] HTTPS enabled
- [ ] Custom domains configured

### First Week
- [ ] Monitor error rates (<1%)
- [ ] Check average response times (<2s)
- [ ] Verify rate limiting works
- [ ] Test from different locations/devices
- [ ] Review security headers (SecurityHeaders.com)
- [ ] Set up monitoring alerts
- [ ] Configure backups

### First Month
- [ ] Review logs for anomalies
- [ ] Analyze usage patterns
- [ ] Optimize slow endpoints
- [ ] Update documentation
- [ ] Security audit
- [ ] Performance testing
- [ ] User feedback collection

---

## Cost Estimation

### Free Tier (MVP)
- **Frontend:** Vercel (Free: Unlimited bandwidth)
- **Backend:** Railway (Free: $5 credit, ~500 hours)
- **Database:** Railway PostgreSQL (Free tier)
- **Total:** $0/month (with limitations)

### Production Tier
- **Frontend:** Vercel Pro ($20/month)
- **Backend:** Railway Hobby ($5/month + usage)
- **OpenAI API:** Pay-as-you-go (~$0.03/paper)
- **Monitoring:** Sentry ($26/month)
- **Total:** ~$60/month + API costs

### Enterprise Tier
- **Frontend:** Vercel Enterprise ($Custom)
- **Backend:** AWS EC2 c5.xlarge ($140/month)
- **Database:** AWS RDS PostgreSQL ($30/month)
- **Redis:** AWS ElastiCache ($15/month)
- **S3 + CloudFront:** $10/month
- **Monitoring:** Datadog ($31/month)
- **Total:** ~$250/month + API costs

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Deployment Platforms:** Vercel, Railway, Render, AWS, Heroku
