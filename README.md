# PaperLens AI - Research Paper Reviewer
**AI-powered Academic Paper Analysis & Peer Review Assistant**

![Python](https://img.shields.io/badge/Python-3.9+-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green) ![React](https://img.shields.io/badge/React-18.2-blue) ![Security](https://img.shields.io/badge/Security-OWASP-red) ![License](https://img.shields.io/badge/License-MIT-yellow)

---

## Overview
PaperLens AI is a production-ready, AI-powered research paper analysis platform that leverages advanced natural language processing and Retrieval-Augmented Generation (RAG) to provide comprehensive peer review, bias detection, gap analysis, and acceptance prediction for academic papers. The system employs OpenAI GPT models, ChromaDB vector storage, and sophisticated PDF parsing to deliver PhD-level research insights.

## Architecture
The project comprises three primary layers:

### 1. Frontend Application
**React-based SPA with modern UI/UX and real-time analysis dashboards.**

**Key Features:**
- Secure flip-card authentication system
- Drag-and-drop PDF upload with real-time validation
- Interactive review dashboards with multiple analysis types
- Real-time streaming AI responses
- Comprehensive report generation and export (PDF)
- Multi-reviewer simulation interface
- Research gap visualization
- Acceptance probability predictions
- Transparent glassmorphism navbar
- Responsive design with gradient themes

**Technology Stack:**
- React 18.2.0
- Vite 5.4.21 (build tool)
- React Router DOM 6.22.0
- Framer Motion 11.0.5 (animations)
- Styled Components 6.3.11
- Axios 1.6.7 (HTTP client)
- Lucide React (icons)
- Recharts 2.12.0 (visualizations)
- React Dropzone 14.2.3

### 2. Backend API Server
**FastAPI-based REST API with advanced security hardening and AI integration.**

**Core Capabilities:**
- PDF parsing and text extraction (PyMuPDF)
- Vector-based semantic search (ChromaDB + Sentence Transformers)
- RAG-powered Q&A system
- Multi-criteria LLM evaluation (methodology, novelty, clarity, impact)
- Bias detection (gender, geographic, citation, methodology)
- Research gap identification
- Acceptance prediction modeling
- Multi-reviewer simulation (3 AI reviewers)
- Live research integration
- Statistical validity analysis
- Reproducibility checking
- Ethical risk assessment

**Architecture:**
- Service-oriented architecture
- RESTful API design
- Middleware-based security layers
- File-based user authentication (JWT)
- In-memory conversation management
- Lazy service initialization for fast startup

**Technology Stack:**
- Python 3.9+
- FastAPI 0.109.2
- Uvicorn 0.27.1 (ASGI server)
- OpenAI API (GPT-4, GPT-3.5-Turbo)
- ChromaDB 0.5.23 (vector database)
- Sentence Transformers 2.3.1 (embeddings)
- LangChain 0.1.6 (LLM orchestration)
- PyMuPDF 1.23.26 (PDF processing)
- ReportLab 4.0.9 (PDF generation)
- python-jose 3.3.0 (JWT auth)
- bcrypt (password hashing)

### 3. AI & Analysis Engine
**Intelligent multi-layered analysis system for comprehensive paper evaluation.**

**Features:**
- Automated PDF content extraction and chunking
- Vector embeddings for semantic search
- Context-aware question answering
- Multi-criteria scoring (1-10 scale)
- Bias pattern detection across 7 categories
- Citation graph analysis
- Methodology validation
- Statistical significance checking
- Reproducibility assessment
- Ethical compliance review
- Research trend analysis

---

## System Requirements

### Backend Server
- **Python** 3.9 or higher
- **pip** 21.0 or higher
- **RAM:** 4GB minimum (8GB recommended)
- **Storage:** 1GB free space
- **API Keys:** OpenAI API key (required)

### Frontend Application
- **Node.js** 16.0 or higher
- **npm** 8.0 or higher
- **Modern Browser:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Internet Connection:** Required for AI services

---

## Installation

### Backend Setup
**1. Navigate to backend directory and create virtual environment:**
```bash
cd backend
python -m venv venv
```

**2. Activate virtual environment:**
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

**3. Install dependencies:**
```bash
pip install -r requirements.txt
```

**4. Configure environment variables:**
Create `.env` file in `backend/` directory:
```env
# OpenAI API Key (REQUIRED)
OPENAI_API_KEY=sk-proj-your_actual_openai_key_here

# JWT Secret (REQUIRED for production)
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-characters

# Application Settings
APP_ENV=development
DEBUG=True
PORT=8000
HOST=0.0.0.0

# CORS Settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Settings
MAX_UPLOAD_SIZE=10485760
ALLOWED_FILE_TYPES=.pdf

# Vector Store
CHROMA_PERSIST_DIR=./vector_store/chroma_data

# LLM Settings
LLM_MODEL=gpt-4
LLM_TEMPERATURE=0.3
LLM_MAX_TOKENS=500
```

**5. Start backend server:**
```bash
python main.py
```
- **Server:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

### Frontend Setup
**1. Navigate to frontend directory and install dependencies:**
```bash
cd frontend
npm install
```

**2. Configure API endpoint (optional):**
Create `.env` file in `frontend/` directory:
```env
VITE_API_URL=http://localhost:8000
```

**3. Start development server:**
```bash
npm run dev
```
- **Application:** http://localhost:5173 (or http://localhost:3000)

### Full Stack Quick Start
From project root:
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Start backend (Terminal 1)
cd backend
python main.py

# Start frontend (Terminal 2)
cd frontend
npm run dev
```

---

## Configuration

### Backend (backend/main.py)
```python
PORT = 8000
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'.pdf'}
```

### Security Middleware (backend/middleware/rate_limiter.py)
```python
# Anonymous user limits
"upload": (5, 900),      # 5 requests per 15 minutes
"review": (10, 900),     # 10 requests per 15 minutes
"advanced": (3, 900),    # 3 requests per 15 minutes
"default": (30, 300),    # 30 requests per 5 minutes

# Authenticated user limits
"upload": (20, 3600),    # 20 requests per hour
"review": (50, 3600),    # 50 requests per hour
"advanced": (15, 3600),  # 15 requests per hour
"default": (100, 300),   # 100 requests per 5 minutes
```

### Frontend (frontend/src/services/api.js)
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

---

## API Documentation

### Authentication

#### POST /api/auth/signup
Register a new user.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### POST /api/auth/login
Login existing user.
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Paper Management

#### POST /api/upload
Upload a research paper PDF.
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (PDF, max 10MB)
- **Response:**
```json
{
  "paper_id": "uuid-v4",
  "filename": "research_paper.pdf",
  "message": "File uploaded successfully"
}
```

### Analysis Endpoints

#### POST /api/review/quick
Quick analysis (30 seconds).
```json
{
  "paper_id": "uuid-v4"
}
```

#### POST /api/review/comprehensive
Comprehensive review (2-3 minutes).
```json
{
  "paper_id": "uuid-v4"
}
```

#### POST /api/advanced/multi-review
Multi-reviewer simulation.
```json
{
  "paper_id": "uuid-v4"
}
```

#### POST /api/advanced/acceptance-prediction
Predict acceptance probability.
```json
{
  "paper_id": "uuid-v4"
}
```

#### POST /api/advanced/gap-analysis
Identify research gaps.
```json
{
  "paper_id": "uuid-v4"
}
```

### GET /api/health
Health check endpoint.
```json
{
  "status": "healthy",
  "services": {
    "api": "running",
    "rag_engine": "available",
    "llm_evaluator": "available"
  }
}
```

---

## Project Structure
```
research-reviewer/
├── frontend/                    # React Frontend ✅
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx      → Homepage
│   │   │   ├── LoginPage.jsx        → Flip-card auth
│   │   │   ├── AnalyzePage.jsx      → Main dashboard
│   │   │   ├── Dashboard.jsx        → Review display
│   │   │   ├── Navbar.jsx           → Transparent navbar
│   │   │   ├── CustomButton.jsx     → Styled buttons
│   │   │   └── LoadingScreen.jsx    → 3D loader
│   │   ├── services/
│   │   │   └── api.js               → API client
│   │   ├── App.jsx                  → Root component
│   │   └── main.jsx                 → Entry point
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                     # FastAPI Backend ✅
│   ├── middleware/
│   │   ├── rate_limiter.py          → Rate limiting
│   │   ├── security.py              → Security headers
│   │   └── validator.py             → Input validation
│   ├── models/
│   │   ├── schemas.py               → Pydantic models
│   │   ├── auth_schemas.py          → Auth models
│   │   └── advanced_schemas.py      → Advanced models
│   ├── routes/
│   │   ├── auth.py                  → Authentication
│   │   ├── upload.py                → File upload
│   │   ├── review.py                → Review endpoints
│   │   └── advanced.py              → Advanced analysis
│   ├── services/
│   │   ├── pdf_parser.py            → PDF extraction
│   │   ├── rag_engine.py            → RAG system
│   │   ├── llm_evaluator.py         → LLM scoring
│   │   ├── bias_detector.py         → Bias analysis
│   │   ├── gap_detector.py          → Research gaps
│   │   ├── multi_reviewer.py        → Multi-review
│   │   ├── acceptance_predictor.py  → Acceptance pred.
│   │   ├── advanced_analyzers.py    → Advanced tools
│   │   └── report_generator.py      → PDF reports
│   ├── uploads/                     → Uploaded PDFs
│   ├── reports/                     → Generated reports
│   ├── vector_store/                → ChromaDB data
│   ├── main.py                      → FastAPI app
│   ├── requirements.txt
│   └── .env.example
│
├── docs/                        # Documentation ✅
│   ├── HOW_TO_RUN.md
│   ├── QUICKSTART.md
│   ├── FILE_STRUCTURE.md
│   ├── PROJECT_DOCUMENTATION.md
│   └── START_HERE.md
│
├── README.md                    # This file
├── ARCHITECTURE.md              # System architecture
├── SECURITY.md                  # Security documentation
├── DEPLOYMENT.md                # Deployment guide
├── vercel.json                  # Vercel config
└── .gitignore
```

---

## Current Status

### ✅ Frontend (Complete)
- [x] Modern React SPA with Vite
- [x] Flip-card authentication UI
- [x] Transparent glassmorphism navbar
- [x] Protected route implementation
- [x] Drag-and-drop PDF upload
- [x] Real-time analysis dashboards
- [x] Multiple review types display
- [x] Streaming AI responses
- [x] PDF report generation
- [x] Responsive gradient design
- [x] Loading animations

### ✅ Backend (Complete)
- [x] FastAPI REST API server
- [x] OpenAI GPT-4 integration
- [x] RAG system with ChromaDB
- [x] PDF parsing and analysis
- [x] Multi-criteria LLM evaluation
- [x] Bias detection (7 types)
- [x] Research gap identification
- [x] Acceptance prediction
- [x] Multi-reviewer simulation
- [x] JWT authentication
- [x] File upload handling
- [x] Report generation

### ✅ Security (Complete - OWASP Compliant)
- [x] Rate limiting (IP + user-based)
- [x] Input validation & sanitization
- [x] Schema-based validation (Pydantic)
- [x] File type validation (extension + magic bytes)
- [x] SQL injection prevention
- [x] XSS protection
- [x] CSRF protection
- [x] Security headers (CSP, HSTS, X-Frame-Options)
- [x] Request logging for security audits
- [x] Password hashing (bcrypt)
- [x] JWT token security
- [x] Environment variable validation

### 🚀 Deployment Ready
- [x] Production build configuration
- [x] Environment variable setup
- [x] Vercel configuration
- [x] Health check endpoints
- [x] Error handling
- [x] Logging system
- [x] Documentation

---

## Security Features

### 1. Rate Limiting
- **IP-based limits** for anonymous users
- **User-based limits** for authenticated users
- **Per-endpoint configuration** (upload, review, advanced)
- **Sliding window algorithm** for accurate tracking
- **Graceful 429 responses** with Retry-After headers

### 2. Input Validation
- **Schema-based validation** (Pydantic models)
- **Type checking** for all inputs
- **Length limits** enforced (email: 254, name: 100, password: 128)
- **Pattern matching** (email, UUID, filename)
- **HTML/SQL injection prevention**
- **Reject unexpected fields** (mass assignment protection)

### 3. File Upload Security
- **File type validation** (extension + magic bytes)
- **File size limits** (10MB default)
- **Filename sanitization** (path traversal prevention)
- **Content validation** (ensures academic paper)
- **Secure storage** (UUID-based filenames)

### 4. Authentication Security
- **Password strength validation** (min 8 chars, uppercase, lowercase, number)
- **Bcrypt hashing** (cost factor 12)
- **JWT tokens** with expiration
- **Timing-attack resistant** password comparison
- **Generic error messages** (prevent user enumeration)
- **Secure token storage**

### 5. Security Headers
- **Content Security Policy (CSP)**
- **Strict Transport Security (HSTS)**
- **X-Frame-Options** (clickjacking protection)
- **X-Content-Type-Options** (MIME sniffing protection)
- **X-XSS-Protection**
- **Referrer-Policy**
- **Permissions-Policy**

---

## Quick Start

### Option 1: Full Stack Development
```bash
# Clone repository
git clone https://github.com/yourusername/research-reviewer.git
cd research-reviewer

# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate  # Windows
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your OpenAI API key
python main.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Option 2: Using Scripts
```bash
# Windows
.\RUN_ME.ps1

# Linux/Mac
./run.sh
```

---

## Design Theme

### Colors
- **Background:** Deep Dark (#0a0a0f, #000000)
- **Primary:** Yellow/Gold (#fbbf24, #f59e0b, #eab308)
- **Secondary:** Orange (#fb923c, #f97316)
- **Accent:** Blue (#3b82f6, #60a5fa)
- **Text:** White (#ffffff), Gray (#9ca3af, #6b7280)
- **Success:** Green (#10b981, #22c55e)
- **Error:** Red (#ef4444, #dc2626)

### Style
- **Theme:** Modern Academic / Professional
- **Mode:** Dark throughout
- **Effects:** Gradients, glassmorphism, subtle shadows
- **Animations:** Smooth, performant (Framer Motion)
- **Typography:** System fonts, clean sans-serif

### Components
- **Navbar:** Transparent with backdrop blur
- **Cards:** Gradient borders with hover effects
- **Buttons:** Gradient backgrounds with animations
- **Inputs:** Clean with focus states
- **Loader:** 3D rotating cube with text

---

## Tech Stack Summary

### Frontend
```
React 18.2.0              → UI library
Vite 5.4.21               → Build tool
React Router 6.22.0       → Client routing
Framer Motion 11.0.5      → Animations
Styled Components 6.3.11  → CSS-in-JS
Axios 1.6.7               → HTTP client
Lucide React              → Icons
Recharts 2.12.0           → Charts
React Dropzone 14.2.3     → File upload
```

### Backend
```
Python 3.9+               → Language
FastAPI 0.109.2           → Web framework
Uvicorn 0.27.1            → ASGI server
OpenAI 1.12.0             → LLM API
ChromaDB 0.5.23           → Vector DB
Sentence Transformers     → Embeddings
LangChain 0.1.6           → LLM orchestration
PyMuPDF 1.23.26           → PDF processing
ReportLab 4.0.9           → PDF generation
python-jose 3.3.0         → JWT
bcrypt                    → Password hashing
```

---

## Documentation

- **Architecture Details:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Security Guide:** [SECURITY.md](SECURITY.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **API Documentation:** http://localhost:8000/docs (when running)
- **Quick Start:** [docs/QUICKSTART.md](docs/QUICKSTART.md)
- **How to Run:** [docs/HOW_TO_RUN.md](docs/HOW_TO_RUN.md)

---

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

- **GitHub:** https://github.com/yourusername/research-reviewer
- **Email:** your.email@example.com
- **Documentation:** See [docs/](docs/) folder

---

## Acknowledgments

- OpenAI for GPT models
- ChromaDB for vector storage
- FastAPI for the excellent web framework
- React and Vite teams for modern tooling
- Academic research community for inspiration

---

**© 2026 PaperLens AI. All rights reserved.**
