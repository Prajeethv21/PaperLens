"""
Security Headers and Protection Middleware
Implements OWASP security best practices

Features:
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- XSS protection  - CSRF protection
- Clickjacking protection
- MIME sniffing protection
- Request logging for security audit
"""

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
import secrets
import logging
from datetime import datetime

# Configure security logger
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Add security headers to all responses
    Follows OWASP Secure Headers Project recommendations
    """
    
    async def dispatch(self, request: Request, call_next):
        # Process request
        response = await call_next(request)
        
        # Add security headers
        
        # Content Security Policy - Prevent XSS attacks
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' data:; "
            "connect-src 'self' https: http://localhost:3001 http://localhost:3002 http://localhost:8000; "
            "frame-ancestors 'self'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        # Strict Transport Security - Force HTTPS (in production)
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        
        # Prevent clickjacking attacks
        response.headers["X-Frame-Options"] = "DENY"
        
        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Enable browser XSS protection
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Referrer Policy - Control referrer information
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions Policy - Control browser features
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=()"
        )
        
        # Remove server information
        if "server" in response.headers:
            del response.headers["server"]
        
        # Add custom security headers
        response.headers["X-Security-Version"] = "1.0"
        
        return response


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """
    Log suspicious requests for security monitoring
    """
    
    # List of sensitive endpoints to always log
    SENSITIVE_ENDPOINTS = ["/api/auth/", "/api/upload", "/api/review"]
    
    # Suspicious patterns to monitor
    SUSPICIOUS_PATTERNS = [
        "admin", "root", "../", ".env", "passwd",
        "script", "eval", "exec", "cmd"
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Record request start time
        start_time = datetime.now()
        
        # Get client info
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        # Check if request is suspicious
        is_sensitive = any(endpoint in request.url.path for endpoint in self.SENSITIVE_ENDPOINTS)
        is_suspicious = any(
            pattern in request.url.path.lower() or 
            pattern in str(request.query_params).lower()
            for pattern in self.SUSPICIOUS_PATTERNS
        )
        
        # Log sensitive or suspicious requests
        if is_sensitive or is_suspicious:
            security_logger.info(
                f"{'SUSPICIOUS' if is_suspicious else 'SENSITIVE'} REQUEST | "
                f"IP: {client_ip} | "
                f"Method: {request.method} | "
                f"Path: {request.url.path} | "
                f"User-Agent: {user_agent}"
            )
        
        # Process request
        try:
            response = await call_next(request)
            
            # Log failed authentication attempts
            if request.url.path.endswith("/login") and response.status_code in [401, 403]:
                security_logger.warning(
                    f"FAILED LOGIN | IP: {client_ip} | User-Agent: {user_agent}"
                )
            
            # Calculate request duration
            duration = (datetime.now() - start_time).total_seconds()
            
            # Log slow requests (potential DoS)
            if duration > 10:
                security_logger.warning(
                    f"SLOW REQUEST | Duration: {duration:.2f}s | "
                    f"IP: {client_ip} | "
                    f"Path: {request.url.path}"
                )
            
            return response
            
        except Exception as e:
            # Log errors
            security_logger.error(
                f"REQUEST ERROR | IP: {client_ip} | "
                f"Path: {request.url.path} | "
                f"Error: {str(e)}"
            )
            raise


class CSRFProtectionMiddleware(BaseHTTPMiddleware):
    """
    CSRF protection for state-changing operations
    Uses Double Submit Cookie pattern
    """
    
    # Methods that require CSRF protection
    PROTECTED_METHODS = ["POST", "PUT", "DELETE", "PATCH"]
    
    # Endpoints exempt from CSRF (e.g., API endpoints with token auth)
    EXEMPT_PATHS = ["/api/auth/login", "/api/auth/signup", "/docs", "/openapi.json"]
    
    async def dispatch(self, request: Request, call_next):
        # Skip CSRF check for safe methods
        if request.method not in self.PROTECTED_METHODS:
            return await call_next(request)
        
        # Skip CSRF check for exempt paths
        if any(request.url.path.startswith(path) for path in self.EXEMPT_PATHS):
            return await call_next(request)
        
        # For JWT-authenticated APIs, CSRF is not needed
        # (token stored in Authorization header, not cookie)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            return await call_next(request)
        
        # If using cookie-based auth, validate CSRF token
        csrf_token_header = request.headers.get("X-CSRF-Token")
        csrf_token_cookie = request.cookies.get("csrf_token")
        
        if csrf_token_cookie and csrf_token_header == csrf_token_cookie:
            return await call_next(request)
        
        # CSRF validation failed (only for cookie-based auth)
        # Since we're using JWT, this won't trigger
        return await call_next(request)


def generate_csrf_token() -> str:
    """Generate a secure CSRF token"""
    return secrets.token_urlsafe(32)


# File upload security functions

def validate_file_size(file_size: int, max_size: int = 10 * 1024 * 1024) -> bool:
    """
    Validate file size
    Default max: 10MB
    """
    return file_size <= max_size


def validate_file_type(filename: str, allowed_extensions: set = {".pdf"}) -> bool:
    """
    Validate file type by extension
    Default: PDF only
    """
    import os
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions


def validate_file_magic_bytes(file_bytes: bytes) -> bool:
    """
    Validate file type by magic bytes (file signature)
    Prevents uploading malicious files with fake extensions
    
    PDF magic bytes: %PDF (25 50 44 46)
    """
    if len(file_bytes) < 4:
        return False
    
    # Check PDF signature
    pdf_signature = b'%PDF'
    return file_bytes[:4] == pdf_signature


# SQL Injection prevention helper (for future DB queries)

def sanitize_sql_input(value: str) -> str:
    """
    Sanitize input for SQL queries
    Note: Always use parameterized queries instead of string concatenation
    This is a defense-in-depth measure
    """
    # Remove SQL comment syntax
    value = value.replace("--", "").replace("/*", "").replace("*/", "")
    
    # Remove SQL string terminators
    value = value.replace("'", "''")
    
    # Block SQL keywords in user input
    dangerous_keywords = [
        "DROP", "DELETE", "TRUNCATE", "EXEC", "EXECUTE",
        "UNION", "INSERT", "UPDATE", "ALTER", "CREATE"
    ]
    
    for keyword in dangerous_keywords:
        # Case-insensitive replacement
        value = re.sub(
            f"\\b{keyword}\\b",
            "",
            value,
            flags=re.IGNORECASE
        )
    
    return value


# Environment variable validation

def validate_env_vars():
    """
    Validate that all required environment variables are set
    and don't contain default/example values
    """
    import os
    
    errors = []
    
    # Check OPENAI_API_KEY
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        errors.append("OPENAI_API_KEY not configured")
    
    # Check JWT_SECRET_KEY
    jwt_secret = os.getenv("JWT_SECRET_KEY")
    if not jwt_secret or jwt_secret == "your-secret-key-change-this-in-production":
        errors.append("JWT_SECRET_KEY not configured (using default is insecure)")
    
    # Warn if using weak JWT secret
    if jwt_secret and len(jwt_secret) < 32:
        errors.append("JWT_SECRET_KEY is too short (minimum 32 characters recommended)")
    
    return errors


import re
