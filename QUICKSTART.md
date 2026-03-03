# 🚀 Quick Start Guide

## Run the App

### 1. Start Backend (Terminal 1)
```powershell
cd backend
.\venv\Scripts\python.exe main.py
```

Wait for: `✓ Grok API Key loaded successfully`

### 2. Start Frontend (Terminal 2)
```powershell
cd frontend
npm run dev
```

### 3. Open Browser
Go to the URL shown in the frontend terminal (usually `http://localhost:3000`)

---

## First Time Setup

If `venv` doesn't exist:
```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip.exe install -r requirements.txt
```

If `node_modules` doesn't exist:
```powershell
cd frontend
npm install
```

---

## That's It!

Your app uses:
- ✅ Grok API (configured in `backend/.env`)
- ✅ Backend on port 8000
- ✅ Frontend on port 3000 or 3001

Upload a research paper PDF and get AI analysis! 🎉

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## First Time Usage

1. Navigate to http://localhost:3000
2. Click "Start Analysis" or go to Analyze page
3. Upload a research paper PDF (max 10MB)
4. Watch the beautiful animations as AI analyzes the paper
5. View the comprehensive report with scores and explanations
6. Download the PDF report if needed

## Features to Explore

### 3D Animations
- **Hero Section**: Neural network with mouse-reactive particles
- **Upload Page**: Rotating DNA helix
- **Loading Screen**: Pulsing brain with step-by-step progress
- **Report Page**: 3D flip animations on score cards

### AI Analysis
- **Novelty Score**: Compares with existing literature using RAG
- **Methodology Score**: Evaluates research soundness
- **Clarity Score**: Assesses writing quality
- **Citation Quality**: Analyzes references
- **Bias Detection**: Identifies potential biases

## Troubleshooting

### Backend Issues
**Error: "Grok API key not found"**
- Solution: Add `OPENAI_API_KEY=gsk-...` to `backend\.env` (using Grok API key)

**Error: "Module not found"**
- Solution: Make sure virtual environment is activated and dependencies installed

### Frontend Issues
**Blank screen or animations not working**
- Solution: Ensure WebGL is enabled in your browser
- Try Chrome or Firefox for best 3D performance

**Upload fails**
- Check file is PDF format
- Ensure file is under 10MB
- Check backend is running on port 8000

## Tips for Best Experience

1. **Use a modern browser** (Chrome, Firefox, Edge)
2. **Enable GPU acceleration** for smooth 3D animations
3. **Close unnecessary tabs** if animations are slow
4. **Upload smaller PDFs first** to test the system

## Demo Mode

If you don't have a Grok API key yet, the frontend has demo data built-in:
- Go directly to the Report page
- You'll see sample analysis results

## Need Help?

Check the full README.md for detailed documentation.

---

**Enjoy analyzing research papers with AI! 🎓✨**
