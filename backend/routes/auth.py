from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from models.auth_schemas import UserCreate, UserLogin, Token, UserResponse
from middleware.rate_limiter import rate_limit_dependency
from middleware.validator import InputValidator
import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
import json
import os
from pathlib import Path
import secrets

router = APIRouter()

# ============================================
# SECURITY CONFIGURATION
# ============================================

# Load JWT secret from environment (CRITICAL: Use strong secret in production)
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-change-this-in-production":
    # Generate a secure random key for development
    SECRET_KEY = secrets.token_urlsafe(32)
    print("\nWARNING: Using auto-generated JWT secret. Set JWT_SECRET_KEY in .env for production!")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200  # 30 days

# Password hashing
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Simple file-based storage (replace with database in production)
USERS_FILE = Path("./users.json")

# ============================================
# USER DATABASE OPERATIONS
# ============================================

def get_users_db():
    """Load users from JSON file (Thread-safe read)"""
    if not USERS_FILE.exists():
        return {}
    try:
        with open(USERS_FILE, 'r') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return {}

def save_users_db(users):
    """Save users to JSON file (Atomic write)"""
    # Write to temporary file first, then rename (atomic operation)
    temp_file = USERS_FILE.with_suffix('.tmp')
    try:
        with open(temp_file, 'w') as f:
            json.dump(users, f, indent=2)
        temp_file.replace(USERS_FILE)
    except IOError as e:
        if temp_file.exists():
            temp_file.unlink()
        raise HTTPException(status_code=500, detail="Failed to save user data")

def verify_password(plain_password, hashed_password):
    """
    Verify password using bcrypt (timing-attack resistant)
    """
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        # Return False instead of raising exception (prevents user enumeration)
        return False

def get_password_hash(password):
    """
    Hash password using bcrypt with strong cost factor
    """
    # Use cost factor 12 (good balance between security and performance)
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def create_access_token(data: dict):
    """
    Create JWT access token with expiration
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({
        "exp": expire,
        "iat": datetime.now(timezone.utc),  # Issued at
        "type": "access"  # Token type
    })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

@router.post("/signup", response_model=Token, dependencies=[Depends(rate_limit_dependency)])
async def signup(user: UserCreate, request: Request):
    """
    Register a new user
    
    Security features:
    - Email validation and sanitization
    - Password strength validation
    - Rate limiting (prevents signup spam)
    - Secure password hashing (bcrypt)
    - Input validation and sanitization
    """
    # Validate and sanitize email
    email = InputValidator.validate_email(user.email)
    
    # Validate password strength
    InputValidator.validate_password(user.password)
    
    # Sanitize name
    name = InputValidator.sanitize_string(user.name, max_length=100)
    
    users = get_users_db()
    
    # Check if user already exists (case-insensitive)
    if email.lower() in [e.lower() for e in users.keys()]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate secure user ID
    user_id = f"user_{secrets.token_urlsafe(16)}"
    
    # Hash password (bcrypt with cost factor 12)
    hashed_password = get_password_hash(user.password)
    
    # Create user record
    users[email] = {
        "id": user_id,
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Save to file (atomic operation)
    save_users_db(users)
    
    # Create access token
    access_token = create_access_token(data={"sub": email, "uid": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=name,
            email=email
        )
    )


@router.post("/login", response_model=Token, dependencies=[Depends(rate_limit_dependency)])
async def login(user: UserLogin, request: Request):
    """
    Login user
    
    Security features:
    - Rate limiting (prevents brute force attacks)
    - Timing-attack resistant password comparison
    - Generic error messages (prevents user enumeration)
    - Secure JWT token generation
    """
    # Validate email format
    email = InputValidator.validate_email(user.email)
    
    users = get_users_db()
    
    # Generic error message (prevents user enumeration)
    invalid_credentials_error = HTTPException(
        status_code=401, 
        detail="Invalid email or password"
    )
    
    # Check if user exists (case-insensitive)
    user_data = None
    for stored_email, data in users.items():
        if stored_email.lower() == email.lower():
            user_data = data
            break
    
    if not user_data:
        # Still hash a password to prevent timing attacks
        get_password_hash("dummy_password_to_prevent_timing_attack")
        raise invalid_credentials_error
    
    # Verify password (timing-attack resistant)
    if not verify_password(user.password, user_data["password"]):
        raise invalid_credentials_error
    
    # Create access token
    access_token = create_access_token(data={"sub": email, "uid": user_data["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_data["id"],
            name=user_data["name"],
            email=user_data["email"]
        )
    )



@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Get current user from JWT token
    
    Security features:
    - JWT validation
    - Token expiration check
    - User existence verification
    """
    credentials_exception = HTTPException(
        status_code=401,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode and validate JWT
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        if email is None:
            raise credentials_exception
            
        # Check token type
        token_type = payload.get("type")
        if token_type != "access":
            raise credentials_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.JWTError:
        raise credentials_exception
    
    # Get user from database
    users = get_users_db()
    
    # Find user (case-insensitive)
    user_data = None
    for stored_email, data in users.items():
        if stored_email.lower() == email.lower():
            user_data = data
            break
    
    if not user_data:
        raise credentials_exception
    
    return UserResponse(
        id=user_data["id"],
        name=user_data["name"],
        email=user_data["email"]
    )

