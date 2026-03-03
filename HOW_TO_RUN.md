# 🚀 How to Run the Application

## ⚡ Quick Start (Easiest Way)

### Option 1: Use the RUN_ME.ps1 Script

1. **Right-click** on `RUN_ME.ps1` in the project folder
2. Select **"Run with PowerShell"**
3. Wait for both servers to start in new windows
4. Open your browser to: **http://localhost:5173**

That's it! 🎉

---

## 📋 Manual Start (Step by Step)

### Backend Server

```powershell
# 1. Open PowerShell in the project folder
cd c:\Users\praje\Documents\research-reviewer\backend

# 2. Activate virtual environment
.\venv\Scripts\Activate.ps1

# 3. Run the server
python main.py
```

**Backend will run on:** http://localhost:8000

### Frontend Server (In a NEW PowerShell window)

```powershell
# 1. Open another PowerShell in the project folder
cd c:\Users\praje\Documents\research-reviewer\frontend

# 2. Start the development server
npm run dev
```

**Frontend will run on:** http://localhost:5173

---

## ❓ Why Do I Need to Run main.py Explicitly?

### The Reason:

Python applications don't auto-run like some other apps. Here's why you need to explicitly run `main.py`:

1. **Python is Interpreted, Not Compiled**
   - Python files (`.py`) are scripts, not executable programs (`.exe`)
   - You need the Python interpreter to run them
   - Command: `python main.py` tells Python to execute the file

2. **Virtual Environment Isolation**
   - The `venv` folder contains your project's specific Python packages
   - You must **activate** it first: `.\venv\Scripts\Activate.ps1`
   - This ensures you're using the right dependencies

3. **FastAPI/Uvicorn Server**
   - `main.py` starts a **web server** (Uvicorn)
   - The server keeps running and listening for requests
   - It doesn't exit; it waits for HTTP requests
   - Look at the bottom of `main.py`:
     ```python
     if __name__ == "__main__":
         import uvicorn
         uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
     ```

4. **Development vs Production**
   - In **development** (now): You run `python main.py` manually
   - In **production** (deployment): You'd use a process manager or systemd service
   - This gives you control and visibility during development

### Alternative: Make It "Auto-Run"

If you want a one-click solution, you have two options:

#### Option A: Use RUN_ME.ps1 (Recommended)
- Double-click `RUN_ME.ps1` → Servers start automatically

#### Option B: Create a Desktop Shortcut
1. Right-click Desktop → New → Shortcut
2. Location: `powershell.exe -ExecutionPolicy Bypass -File "c:\Users\praje\Documents\research-reviewer\RUN_ME.ps1"`
3. Name: "Research Reviewer"
4. Double-click to start!

---

## 🔍 Understanding the Startup Process

```
┌─────────────────────────────────────────┐
│  1. Activate Virtual Environment        │
│     .\venv\Scripts\Activate.ps1         │
│     → Loads project Python packages     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  2. Run main.py                         │
│     python main.py                      │
│     → Loads environment variables       │
│     → Checks Grok API key               │
│     → Initializes FastAPI app           │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│  3. Uvicorn Starts Web Server           │
│     → Listens on http://localhost:8000  │
│     → Loads routes (/api/upload, etc)   │
│     → Keeps running until Ctrl+C        │
└─────────────────────────────────────────┘
```

---

## 🛠️ Troubleshooting

### "Cannot run script... Execution Policy"
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### "venv\Scripts\Activate.ps1 not found"
The virtual environment wasn't created. Run:
```powershell
cd backend
python -m venv venv
```

### "Module not found" errors
Install dependencies:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Backend won't start
Check if port 8000 is already in use:
```powershell
netstat -ano | findstr :8000
```

### Frontend shows connection error
Make sure backend is running first at http://localhost:8000

---

## 📊 What's Running?

When both servers are started:

| Service | URL | Purpose |
|---------|-----|---------|
| **Backend API** | http://localhost:8000 | Handles file uploads, AI analysis |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Frontend** | http://localhost:5173 | User interface (React app) |

---

## 🎯 Next Steps

1. **Run the app**: Use `RUN_ME.ps1`
2. **Open browser**: http://localhost:5173
3. **Upload a PDF**: Click "Analyze" → Upload research paper
4. **Get results**: AI analyzes using Grok and shows report!

**Your Grok API is already configured!** ✅
