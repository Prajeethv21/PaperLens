# Security Documentation

## Table of Contents
1. [Security Overview](#security-overview)
2. [OWASP Top 10 Compliance](#owasp-top-10-compliance)
3. [Rate Limiting](#rate-limiting)
4. [Input Validation & Sanitization](#input-validation--sanitization)
5. [Authentication & Authorization](#authentication--authorization)
6. [File Upload Security](#file-upload-security)
7. [Security Headers](#security-headers)
8. [Environment Variables](#environment-variables)
9. [Logging & Monitoring](#logging--monitoring)
10. [Production Security Checklist](#production-security-checklist)

---

## Security Overview

PaperLens AI implements a **defense-in-depth** security strategy with multiple layers of protection. The application follows OWASP best practices and industry-standard security measures to protect against common web vulnerabilities.

### Security Principles
1. **Least Privilege:** Users and services have minimum necessary permissions
2. **Defense in Depth:** Multiple security layers prevent single-point failures
3. **Fail Secure:** Errors default to secure state (deny access)
4. **Complete Mediation:** Every request is validated
5. **Open Design:** Security through implementation, not obscurity

### Threat Model
**Assets:**
- User credentials (passwords, JWT tokens)
- Uploaded research papers (potentially unpublished work)
- Review data and analytics
- API keys (OpenAI)

**Threats:**
- Brute force attacks on authentication
- API abuse and DoS attacks
- SQL injection and XSS attacks
- Unauthorized access to papers
- API key theft
- CSRF attacks
- File upload attacks (malware, path traversal)

**Mitigations:**
- Rate limiting
- Input validation and sanitization
- JWT-based authentication
- Secure password hashing
- File type validation
- Security headers
- Environment variable protection

---

## OWASP Top 10 Compliance

### 1. Broken Access Control (A01:2021)
**Vulnerability:** Users accessing resources they shouldn't.

**Mitigation:**
```python
# JWT-based authentication
async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        # Verify token type
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    # Fetch user from database
    user = get_user(username)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Protected endpoint example
@router.post("/advanced/multi-review")
async def multi_review(
    request: SafeReviewRequest,
    current_user: dict = Depends(get_current_user),  # Requires authentication
    _rate_limit: None = Depends(rate_limit_dependency)
):
    # User-specific logic
    pass
```

**Implementation:**
- Every protected endpoint uses `Depends(get_current_user)`
- Token expiration enforced (30 days)
- User verification on every request
- No direct file access without ownership validation

### 2. Cryptographic Failures (A02:2021)
**Vulnerability:** Weak encryption, plaintext storage.

**Mitigation:**
```python
# Password hashing with bcrypt (cost factor 12)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)  # bcrypt with 12 rounds

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# JWT secret key generation
import secrets

SECRET_KEY = os.getenv("JWT_SECRET_KEY") or secrets.token_urlsafe(32)
# Recommended: Use 256-bit random key in production
```

**Implementation:**
- Bcrypt hashing with cost factor 12 (2^12 iterations)
- JWT tokens signed with HS256
- HTTPS enforced in production
- Secrets stored in environment variables

### 3. Injection (A03:2021)
**Vulnerability:** SQL, NoSQL, OS command injection.

**Mitigation:**
```python
# SQL Injection prevention
SQL_INJECTION_PATTERNS = [
    r"(\bUNION\b.+\bSELECT\b)",
    r"(\bSELECT\b.+\bFROM\b)",
    r"(\bINSERT\b.+\bINTO\b)",
    r"(\bDELETE\b.+\bFROM\b)",
    r"(\bDROP\b.+\bTABLE\b)",
    r"(--[^\n]*)",
    r"(;.*--)",
    r"(\bOR\b\s+['\"]?\d+['\"]?\s*=\s*['\"]?\d+)",
]

def detect_sql_injection(text: str) -> bool:
    for pattern in SQL_INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

# XSS prevention
XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:",
    r"on\w+\s*=",
    r"<iframe",
    r"<embed",
    r"<object",
]

def detect_xss(text: str) -> bool:
    for pattern in XSS_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

# Input sanitization
def sanitize_input(value: str) -> str:
    # Remove NULL bytes
    value = value.replace('\0', '')
    # Strip control characters
    value = ''.join(char for char in value if unicodedata.category(char)[0] != "C" or char in '\n\t\r')
    return value.strip()
```

**Implementation:**
- Pattern-based detection for SQL/XSS
- Pydantic models with strict type validation
- No direct database queries with user input
- Sanitization of all text inputs

### 4. Insecure Design (A04:2021)
**Vulnerability:** Missing security controls in design.

**Mitigation:**
- **Threat Modeling:** Documented threat model with mitigations
- **Secure Defaults:** Rate limiting enabled by default, strict CORS
- **Validation:** Input validation at every layer (client, middleware, service)
- **Separation of Concerns:** Middleware handles security, routes handle business logic

### 5. Security Misconfiguration (A05:2021)
**Vulnerability:** Default configs, verbose errors, missing headers.

**Mitigation:**
```python
# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https://api.openai.com"
        )
        
        # HSTS - Force HTTPS for 1 year
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Remove server header (info disclosure)
        response.headers.pop("Server", None)
        
        return response

# Environment validation at startup
def validate_env_vars():
    required_vars = ["OPENAI_API_KEY", "JWT_SECRET_KEY"]
    missing = [var for var in required_vars if not os.getenv(var)]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {missing}")

validate_env_vars()
```

**Implementation:**
- Comprehensive security headers
- Environment variable validation on startup
- Production-specific error messages (no stack traces)
- Server header removed

### 6. Vulnerable and Outdated Components (A06:2021)
**Mitigation:**
- Dependencies pinned to specific versions
- Regular `pip-audit` and `npm audit` runs
- Security advisories monitoring
- Automated dependency updates (Dependabot)

### 7. Identification and Authentication Failures (A07:2021)
**Mitigation:**
```python
# Strong password requirements
def validate_password(password: str) -> None:
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters")
    
    has_upper = any(c.isupper() for c in password)
    has_lower = any(c.islower() for c in password)
    has_digit = any(c.isdigit() for c in password)
    has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password)
    
    if not (has_upper and has_lower and has_digit and has_special):
        raise ValueError("Password must contain uppercase, lowercase, digit, and special character")

# Timing-attack resistant password verification
def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Constant-time comparison even on error
        pwd_context.hash("dummy")  # Same time as verify
        return False

# Generic error messages (prevent user enumeration)
@router.post("/login")
async def login(user: SafeUserLogin):
    db_user = get_user_by_email(user.email)
    
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        # Generic message - don't reveal if user exists
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    # Session timeout
    access_token = create_access_token(
        data={"sub": db_user["email"], "iat": time.time(), "type": "access"},
        expires_delta=timedelta(days=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}
```

**Implementation:**
- Password complexity requirements
- Bcrypt hashing (resistant to brute force)
- Timing-attack resistant verification
- Generic error messages
- JWT expiration (30 days)
- Rate limiting on login endpoint

### 8. Software and Data Integrity Failures (A08:2021)
**Mitigation:**
- File magic byte validation (prevent file type spoofing)
- Checksum verification for uploaded files
- No deserialization of untrusted data
- Content-Type validation

### 9. Security Logging and Monitoring Failures (A09:2021)
**Mitigation:**
```python
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log request
        logger.info(f"Request: {request.method} {request.url.path}")
        
        # Detect suspicious patterns
        if request.url.path.startswith("/api/auth/login"):
            # Track failed logins
            pass
        
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response: {response.status_code} (took {process_time:.2f}s)")
        
        # Alert on slow requests
        if process_time > 5.0:
            logger.warning(f"Slow request: {request.url.path} took {process_time:.2f}s")
        
        return response
```

**Implementation:**
- Request/response logging
- Failed login tracking
- Slow request alerts
- Error logging with context

### 10. Server-Side Request Forgery (SSRF) (A10:2021)
**Mitigation:**
- No user-controlled URLs in backend requests
- OpenAI API endpoint hardcoded
- URL validation if user URLs required in future

---

## Rate Limiting

### Implementation: Sliding Window Algorithm

```python
class RateLimiter:
    def __init__(self):
        # Storage: {identifier: [timestamp1, timestamp2, ...]}
        self.requests: Dict[str, List[float]] = {}
        
        # Configurations per endpoint category
        self.limits = {
            "upload": RateLimitConfig(
                anonymous_limit=5,       # 5 uploads per 15 min
                authenticated_limit=30,  # 30 uploads per hour
                window_seconds=900       # 15 minutes
            ),
            "review": RateLimitConfig(
                anonymous_limit=10,
                authenticated_limit=50,
                window_seconds=3600      # 1 hour
            ),
            "advanced": RateLimitConfig(
                anonymous_limit=5,
                authenticated_limit=15,
                window_seconds=3600
            ),
            "default": RateLimitConfig(
                anonymous_limit=30,
                authenticated_limit=100,
                window_seconds=3600
            )
        }
    
    def is_rate_limited(self, identifier: str, category: str, is_authenticated: bool) -> Tuple[bool, Optional[int]]:
        config = self.limits.get(category, self.limits["default"])
        limit = config.authenticated_limit if is_authenticated else config.anonymous_limit
        window = config.window_seconds
        
        # Get request timestamps for this identifier
        now = time.time()
        requests = self.requests.get(identifier, [])
        
        # Remove old timestamps (outside window)
        requests = [ts for ts in requests if now - ts < window]
        
        # Check if limit exceeded
        if len(requests) >= limit:
            # Calculate retry-after
            oldest_request = min(requests)
            retry_after = int(window - (now - oldest_request))
            return True, retry_after
        
        # Add current request
        requests.append(now)
        self.requests[identifier] = requests
        
        return False, None
```

### Rate Limit Categories

| Category | Anonymous Limit | Authenticated Limit | Window |
|----------|----------------|---------------------|--------|
| Upload   | 5 requests     | 30 requests         | 15 min |
| Review   | 10 requests    | 50 requests         | 1 hour |
| Advanced | 5 requests     | 15 requests         | 1 hour |
| Default  | 30 requests    | 100 requests        | 1 hour |

### Identifier Strategy
```python
def get_client_identifier(request: Request, current_user: Optional[dict]) -> str:
    if current_user:
        # Authenticated: use user email
        return f"user:{current_user['email']}"
    else:
        # Anonymous: use IP address
        # Check proxy headers first
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return f"ip:{forwarded_for.split(',')[0].strip()}"
        
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return f"ip:{real_ip}"
        
        # Fallback to client host
        return f"ip:{request.client.host}"
```

### Response Format
```json
// 429 Too Many Requests
{
  "detail": "Rate limit exceeded. Please try again in 457 seconds.",
  "retry_after": 457
}
```

**Headers:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 457
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1648752300
```

---

## Input Validation & Sanitization

### Validation Layers

#### 1. Frontend Validation (Client-Side)
```javascript
// File upload validation
const validateFile = (file) => {
  // Type check
  if (!file.type === 'application/pdf') {
    throw new Error('Only PDF files allowed');
  }
  
  // Size check (10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large (max 10MB)');
  }
  
  return true;
};
```

#### 2. Middleware Validation (Server-Side)
```python
class InputValidator:
    MAX_LENGTHS = {
        "email": 254,
        "name": 100,
        "password": 128,
        "filename": 255,
        "query": 1000,
        "text": 10000
    }
    
    @staticmethod
    def validate_email(email: str) -> None:
        # Length check
        if len(email) > InputValidator.MAX_LENGTHS["email"]:
            raise ValueError("Email too long")
        
        # Format check
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, email):
            raise ValueError("Invalid email format")
        
        # Blocked patterns
        if InputValidator.detect_sql_injection(email) or InputValidator.detect_xss(email):
            raise ValueError("Invalid characters in email")
    
    @staticmethod
    def validate_filename(filename: str) -> None:
        # Path traversal prevention
        if ".." in filename or "/" in filename or "\\" in filename:
            raise ValueError("Invalid filename")
        
        # Length check
        if len(filename) > InputValidator.MAX_LENGTHS["filename"]:
            raise ValueError("Filename too long")
        
        # Allowed characters
        if not re.match(r'^[a-zA-Z0-9._-]+$', filename):
            raise ValueError("Filename contains invalid characters")
```

#### 3. Pydantic Models (Schema Validation)
```python
class SafeUserCreate(BaseModel):
    email: EmailStr  # Pydantic email validation
    password: str = Field(..., min_length=8, max_length=128)
    name: str = Field(..., min_length=1, max_length=100)
    
    @validator('password')
    def validate_password_complexity(cls, v):
        InputValidator.validate_password(v)
        return v
    
    @validator('email')
    def validate_email_safe(cls, v):
        InputValidator.validate_email(v)
        return v
    
    class Config:
        extra = "forbid"  # Reject unexpected fields
```

### Rejection of Unexpected Fields
```python
# Pydantic automatically rejects unexpected fields with extra="forbid"

# Example:
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "admin": true  # <- This field is unexpected
}

# Response:
{
  "detail": [
    {
      "loc": ["body", "admin"],
      "msg": "extra fields not permitted",
      "type": "value_error.extra"
    }
  ]
}
```

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "sub": "user@example.com",     // Subject (user identifier)
  "iat": 1648752300,              // Issued at (timestamp)
  "exp": 1651344300,              // Expiration (30 days)
  "type": "access"                // Token type (prevent type confusion)
}
```

### Token Generation
```python
def create_access_token(data: dict, expires_delta: timedelta = timedelta(days=30)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })
    
    # Sign with HS256
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

### Token Validation
```python
async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode and verify signature
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract subject
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        
        # Verify token type (prevent refresh token usage)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        
    except JWTError:
        raise credentials_exception
    
    # Fetch user
    user = get_user(username)
    if user is None:
        raise credentials_exception
    
    return user
```

### Password Security
```python
# Bcrypt with cost factor 12 (2^12 = 4096 iterations)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Hashing
hashed = pwd_context.hash("my_password")
# Output: $2b$12$KIXFcs3fPJUXHK./zoKPOeF3ZJKQ7L0z8K2y.SaK5PqyhPTqLBqsW

# Verification (constant-time)
is_valid = pwd_context.verify("my_password", hashed)
```

### Authorization Patterns
```python
# Public endpoint (no auth required)
@router.post("/upload")
async def upload_paper(file: UploadFile):
    pass

# Protected endpoint (auth required)
@router.post("/advanced/multi-review")
async def multi_review(
    request: SafeReviewRequest,
    current_user: dict = Depends(get_current_user)  # Requires JWT
):
    pass

# Role-based (if implemented)
async def get_current_admin_user(current_user: dict = Depends(get_current_user)):
    if not current_user.get("is_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
```

---

## File Upload Security

### Multi-Layer Validation

```python
async def upload_paper(file: UploadFile, _rate_limit: None = Depends(rate_limit_dependency)):
    # Layer 1: Filename validation
    InputValidator.validate_filename(file.filename)
    
    # Layer 2: Extension check
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # Layer 3: Content-Type header check
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid content type")
    
    # Layer 4: Magic byte verification
    content = await file.read()
    if not validate_file_magic_bytes(content, "application/pdf"):
        raise HTTPException(status_code=400, detail="File is not a valid PDF")
    
    # Layer 5: Size check
    if len(content) > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    # Layer 6: PDF structure validation
    pages = validate_research_paper(content)
    if pages > 500:
        raise HTTPException(status_code=400, detail="PDF has too many pages (max 500)")
    
    # Layer 7: Secure filename generation
    paper_id = str(uuid.uuid4())
    safe_filename = f"{paper_id}.pdf"
    
    # Layer 8: Path traversal prevention
    upload_dir = os.path.abspath("uploads")
    file_path = os.path.join(upload_dir, safe_filename)
    
    # Verify path is within upload directory
    if not file_path.startswith(upload_dir):
        raise HTTPException(status_code=400, detail="Invalid file path")
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(content)
    
    return {"paper_id": paper_id, "filename": file.filename}
```

### Magic Byte Validation
```python
def validate_file_magic_bytes(content: bytes, expected_type: str) -> bool:
    """
    Validate file type by checking magic bytes (file signature).
    Prevents file type spoofing via extension renaming.
    """
    magic_bytes = {
        "application/pdf": [b"%PDF"],  # PDF signature
        "image/jpeg": [b"\xFF\xD8\xFF"],  # JPEG signature
        "image/png": [b"\x89PNG\r\n\x1a\n"],  # PNG signature
    }
    
    signatures = magic_bytes.get(expected_type, [])
    for signature in signatures:
        if content.startswith(signature):
            return True
    return False
```

### Path Traversal Prevention
```python
# Dangerous (vulnerable to path traversal)
filename = request.filename  # Could be "../../../etc/passwd"
path = os.path.join("uploads", filename)  # Results in /etc/passwd

# Safe (UUID-based naming)
paper_id = str(uuid.uuid4())
filename = f"{paper_id}.pdf"
upload_dir = os.path.abspath("uploads")
path = os.path.join(upload_dir, filename)

# Double check path is within uploads/
if not path.startswith(upload_dir):
    raise ValueError("Path traversal detected")
```

---

## Security Headers

### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; 
                          script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
                          style-src 'self' 'unsafe-inline'; 
                          img-src 'self' data: https:; 
                          font-src 'self' data:; 
                          connect-src 'self' https://api.openai.com
```

**Purpose:** Prevents XSS by controlling resource loading.

**Directives:**
- `default-src 'self'`: Only load resources from same origin
- `script-src`: JavaScript sources (inline required for React)
- `connect-src`: AJAX/fetch destinations (includes OpenAI API)

### HTTP Strict Transport Security (HSTS)
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**Purpose:** Forces HTTPS for 1 year, including subdomains.

### X-Frame-Options
```
X-Frame-Options: DENY
```

**Purpose:** Prevents clickjacking by disallowing iframe embedding.

### X-Content-Type-Options
```
X-Content-Type-Options: nosniff
```

**Purpose:** Prevents MIME type sniffing (forces declared Content-Type).

### X-XSS-Protection
```
X-XSS-Protection: 1; mode=block
```

**Purpose:** Enables browser XSS filter (legacy, but still useful).

### Referrer-Policy
```
Referrer-Policy: strict-origin-when-cross-origin
```

**Purpose:** Controls Referer header (privacy and security).

### Permissions-Policy
```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Purpose:** Disables unnecessary browser features.

---

## Environment Variables

### Required Variables
```bash
# OpenAI API
OPENAI_API_KEY=sk-proj-...

# JWT Authentication
JWT_SECRET_KEY=<256-bit-random-string>

# Frontend (Production)
VITE_API_URL=https://api.yourdomain.com
```

### Generation
```bash
# Generate secure JWT secret (Python)
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Output: XrG8K9nZp4mQ7vT2wY5uH3jL6sD9fA1c
```

### Security Best Practices
1. **Never commit to Git:** Add `.env` to `.gitignore`
2. **Use .env.example:** Document variables without values
3. **Rotate regularly:** Change JWT_SECRET_KEY periodically
4. **Validate on startup:** Fail fast if missing
5. **No client-side API keys:** VITE_ prefix exposes to frontend

### Validation
```python
def validate_env_vars():
    required = ["OPENAI_API_KEY", "JWT_SECRET_KEY"]
    missing = [var for var in required if not os.getenv(var)]
    
    if missing:
        raise RuntimeError(f"Missing environment variables: {missing}")
    
    # Validate format
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key.startswith("sk-"):
        logger.warning("OpenAI API key format invalid")
    
    jwt_key = os.getenv("JWT_SECRET_KEY")
    if len(jwt_key) < 32:
        raise RuntimeError("JWT_SECRET_KEY too short (min 32 chars)")

# Run at startup
validate_env_vars()
```

---

## Logging & Monitoring

### Request Logging
```python
class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Log request
        logger.info(f"{request.method} {request.url.path} from {request.client.host}")
        
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        
        # Log response
        logger.info(f"Response {response.status_code} in {process_time:.2f}s")
        
        # Alert on anomalies
        if process_time > 5.0:
            logger.warning(f"Slow request: {request.url.path} took {process_time:.2f}s")
        
        if response.status_code >= 400:
            logger.warning(f"Error response: {response.status_code} for {request.url.path}")
        
        return response
```

### Security Event Logging
```python
# Failed login attempts
logger.warning(f"Failed login attempt for {email} from {ip}")

# Rate limit violations
logger.warning(f"Rate limit exceeded for {identifier} on {category}")

# Blocked malicious input
logger.error(f"Blocked malicious input: {detected_pattern} in {field}")

# File upload rejections
logger.warning(f"Rejected file upload: {reason} from {ip}")
```

### Monitoring Metrics
- **Request rate:** Requests per second
- **Error rate:** 4xx/5xx responses
- **Latency:** P50, P95, P99 response times
- **Rate limit hits:** Frequency of 429 responses
- **Failed logins:** Authentication failures
- **File uploads:** Success/failure ratio

---

## Production Security Checklist

### Pre-Deployment
- [ ] All dependencies updated (`pip-audit`, `npm audit`)
- [ ] Environment variables configured in Vercel/hosting platform
- [ ] HTTPS/TLS certificate configured
- [ ] CORS origins restricted to production domains
- [ ] Rate limiting enabled and tested
- [ ] Error messages sanitized (no stack traces)
- [ ] Debug mode disabled (`DEBUG=False`)
- [ ] Secret keys rotated (JWT_SECRET_KEY, OPENAI_API_KEY)
- [ ] File upload limits tested
- [ ] Security headers verified

### Post-Deployment
- [ ] Monitor logs for anomalies
- [ ] Test authentication flow
- [ ] Verify rate limiting works
- [ ] Check security headers with SecurityHeaders.com
- [ ] Run penetration tests (OWASP ZAP, Burp Suite)
- [ ] Set up alerting for:
  - High error rates
  - Rate limit violations
  - Failed login spikes
  - Slow requests
- [ ] Enable backup strategy for user data
- [ ] Document incident response procedures

### Ongoing Maintenance
- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Annual penetration testing
- [ ] Log review (weekly)
- [ ] Key rotation (every 90 days)
- [ ] Performance monitoring
- [ ] Vulnerability scanning

---

## Incident Response

### Security Incident Procedure
1. **Detect:** Monitor logs, alerts, user reports
2. **Contain:** Disable affected endpoints, revoke tokens
3. **Investigate:** Analyze logs, identify attack vector
4. **Remediate:** Patch vulnerability, update code
5. **Recover:** Restore service, verify security
6. **Document:** Write incident report, update procedures

### Contact
For security issues, email: **security@paperlens.ai** (placeholder)

---

**Document Version:** 1.0  
**Last Updated:** March 3, 2026  
**Security Standard:** OWASP Top 10 2021
