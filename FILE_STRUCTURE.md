# 📁 Project Structure

```
research-reviewer/
│
├── 🎯 SETUP_AND_RUN.ps1          ← **RUN THIS TO START!**
├── 📖 START_HERE.md               ← Complete guide
├── 📖 HOW_TO_RUN.md              ← Detailed instructions
│
├── backend/                       ← Python/FastAPI server
│   ├── venv/                     ← Virtual environment (auto-created)
│   ├── .env                      ← Configuration (Grok API key) ✅
│   ├── main.py                   ← Server entry point
│   ├── requirements.txt          ← Python dependencies
│   ├── models/                   ← Data schemas
│   ├── routes/                   ← API endpoints
│   ├── services/                 ← Core logic (RAG, LLM, bias detection)
│   ├── uploads/                  ← Uploaded PDFs
│   ├── reports/                  ← Generated reports
│   └── vector_store/             ← ChromaDB data
│
├── frontend/                      ← React/Vite application
│   ├── node_modules/             ← Dependencies (auto-installed)
│   ├── src/                      ← Source code
│   │   ├── components/          ← Reusable UI components
│   │   ├── pages/               ← Page components
│   │   └── three/               ← 3D animations (removed)
│   ├── public/                   ← Static assets
│   ├── package.json              ← Node dependencies
│   └── vite.config.js           ← Build configuration
│
├── docs/                          ← Documentation
│   ├── PROJECT_DOCUMENTATION.md  ← Technical documentation
│   └── QUICKSTART.md             ← Quick setup guide
│
├── .gitignore                     ← Git ignore rules
└── README.md                      ← This file
```

## 🎯 Key Files Explained

### Root Level Scripts

| File | Purpose | When to Use |
|------|---------|-------------|
| **SETUP_AND_RUN.ps1** | 🚀 **Main startup script** | Every time you want to run the app |
| check_config.ps1 | Verify configuration | If you have setup issues |
| start.ps1 | Alternative startup | Backup option |

### Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| **.env** | `backend/.env` | API keys and settings (Grok API) |
| package.json | `frontend/package.json` | Frontend dependencies |
| requirements.txt | `backend/requirements.txt` | Python dependencies |

### Important Directories

| Directory | Purpose | Auto-Created |
|-----------|---------|--------------|
| `backend/venv/` | Python virtual environment | ✅ Yes |
| `backend/uploads/` | Stores uploaded PDFs | ✅ Yes |
| `backend/reports/` | Generated analysis reports | ✅ Yes |
| `backend/vector_store/` | ChromaDB vector database | ✅ Yes |
| `frontend/node_modules/` | Node.js packages | ✅ Yes |

## 🔧 What Gets Created Automatically

When you run `SETUP_AND_RUN.ps1`, it automatically:

1. ✅ Creates `backend/venv/` (if missing)
2. ✅ Installs Python packages
3. ✅ Creates necessary folders (uploads, reports, vector_store)
4. ✅ Installs Node packages
5. ✅ Starts both servers

## ⚠️ What Should NOT Be in Root

The following should **NOT** exist in the project root:
- ❌ `venv/` folder (should only be in `backend/`)
- ❌ `node_modules/` (should only be in `frontend/`)

If you see these, the cleanup script will remove them!

## 📊 File Sizes (Approximate)

| Directory | Size | Contents |
|-----------|------|----------|
| `backend/venv/` | ~500 MB | Python packages |
| `frontend/node_modules/` | ~300 MB | Node packages |
| `backend/vector_store/` | Varies | Embedded research papers |
| `backend/uploads/` | Varies | User-uploaded PDFs |

## 🎓 Why This Structure?

### Separated Concerns
- **Backend** = Python API server (handles AI and data processing)
- **Frontend** = React UI (what users see and interact with)
- **Docs** = All documentation in one place

### Virtual Environment in Backend Only
- Each project should have ONE virtual environment
- Located in `backend/venv/` where Python code lives
- Root-level `venv/` causes confusion (automatically removed)

### Self-Contained Services
- Backend can run independently: `cd backend && python main.py`
- Frontend can run independently: `cd frontend && npm run dev`
- Both together = Full application

## 🚀 Common Commands

### Start Everything (Recommended)
```powershell
.\SETUP_AND_RUN.ps1
```

### Start Backend Only
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python main.py
```

### Start Frontend Only
```powershell
cd frontend
npm run dev
```

### Clean Install (Fix Issues)
```powershell
.\SETUP_AND_RUN.ps1 -CleanInstall
```

### Check Configuration
```powershell
.\check_config.ps1
```

## 📝 Configuration Checklist

Before running, ensure:

- [x] Python 3.9+ installed
- [x] Node.js 18+ installed
- [x] Grok API key in `backend/.env` ✅ **Already configured!**
- [ ] Port 8000 available (backend)
- [ ] Port 5173 available (frontend)

## 🌐 URLs After Starting

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend App** | http://localhost:5173 | User interface |
| **Backend API** | http://localhost:8000 | API server |
| **API Documentation** | http://localhost:8000/docs | Interactive API docs |

## 🎉 You're Ready!

Just run:
```powershell
.\SETUP_AND_RUN.ps1
```

Then open **http://localhost:5173** and start analyzing research papers with Grok AI! 🚀
