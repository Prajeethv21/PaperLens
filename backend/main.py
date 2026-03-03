# CRITICAL: Load environment variables FIRST before any other imports
from dotenv import load_dotenv
from pathlib import Path
import os

# Load environment variables with explicit path
env_path = Path(__file__).parent / '.env'
load_dotenv(dotenv_path=env_path)

# Verify API key is loaded and valid
api_key = os.getenv('OPENAI_API_KEY')
if not api_key or api_key == 'your_openai_api_key_here':
    print("\n" + "="*80)
    print("ERROR: OpenAI API Key not configured!")
    print("="*80)
    print("\nPlease follow these steps:")
    print("1. Get your API key from: https://platform.openai.com/api-keys")
    print("2. Open the file: backend\\.env")
    print("3. Replace 'your_openai_api_key_here' with your actual OpenAI API key")
    print("4. Save the file and restart the server")
    print("\n" + "="*80 + "\n")
    exit(1)
else:
    print(f"[OK] OpenAI API Key loaded successfully (starts with: {api_key[:10]}...)")

# Validate environment variables for security
from middleware.security import validate_env_vars
env_errors = validate_env_vars()
if env_errors:
    print("\n" + "="*80)
    print("WARNING: Security configuration issues detected!")
    print("="*80)
    for error in env_errors:
        print(f"  - {error}")
    print("\nFor production deployment, ensure all environment variables are properly configured.")
    print("="*80 + "\n")

# Now import FastAPI and routes (after env vars are loaded)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.security import SecurityHeadersMiddleware, RequestLoggingMiddleware, CSRFProtectionMiddleware
from routes import upload, review, advanced, auth

# Create FastAPI app
app = FastAPI(
    title="AI Research Paper Reviewer",
    description="Advanced AI-powered research paper analysis using RAG and LLM",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============================================
# SECURITY MIDDLEWARE (OWASP Best Practices)
# ============================================

# 1. Security Headers Middleware (XSS, Clickjacking, MIME sniffing protection)
app.add_middleware(SecurityHeadersMiddleware)

# 2. Request Logging Middleware (Security monitoring)
app.add_middleware(RequestLoggingMiddleware)

# 3. CSRF Protection Middleware (For cookie-based auth)
app.add_middleware(CSRFProtectionMiddleware)

# 4. CORS Middleware (Cross-Origin Resource Sharing)
# In production, replace with your actual frontend domain
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Explicit methods only
    allow_headers=["*"],
    max_age=3600  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(upload.router, prefix="/api", tags=["Upload"])
app.include_router(review.router, prefix="/api", tags=["Review"])
app.include_router(advanced.router, prefix="/api", tags=["Advanced"])

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI Research Paper Reviewer API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "services": {
            "api": "running",
            "rag_engine": "available",
            "llm_evaluator": "available"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
