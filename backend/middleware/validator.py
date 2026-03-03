"""
Input Validation and Sanitization Middleware
Implements strict validation following OWASP best practices

Security Features:
- Type validation
- Length limits
- Pattern matching
- HTML/SQL injection prevention
- Schema validation
- Reject unexpected fields
"""

from fastapi import HTTPException, status
from pydantic import BaseModel, validator, Field
from typing import Any, Dict, Optional
import re
import html

class InputValidator:
    """
    Centralized input validation and sanitization
    Follows OWASP Input Validation Cheat Sheet
    """
    
    # Maximum lengths for different field types
    MAX_LENGTHS = {
        "email": 254,          # RFC 5321
        "name": 100,
        "password": 128,
        "filename": 255,
        "text": 5000,
        "query": 1000,
        "url": 2048
    }
    
    # Allowed patterns
    PATTERNS = {
        "email": r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
        "alphanumeric": r'^[a-zA-Z0-9\s\-_]+$',
        "filename": r'^[a-zA-Z0-9\s\-_.()]+\.(pdf|PDF)$',
        "uuid": r'^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$'
    }
    
    # Dangerous patterns to block (SQL injection, XSS, etc.)
    BLOCKED_PATTERNS = [
        r'<script[^>]*>.*?</script>',  # Script tags
        r'javascript:',                 # JavaScript protocol
        r'on\w+\s*=',                  # Event handlers
        r'(?i)(select|insert|update|delete|drop|union|exec|execute)\s+',  # SQL keywords
        r'--',                          # SQL comment
        r'/\*.*?\*/',                   # Multi-line comment
        r'<iframe',                     # Iframe tags
        r'<embed',                      # Embed tags
        r'<object',                     # Object tags
    ]
    
    @staticmethod
    def sanitize_string(value: str, max_length: Optional[int] = None) -> str:
        """
        Sanitize string input
        - Trim whitespace
        - HTML encode
        - Check length
        - Block malicious patterns
        """
        if not isinstance(value, str):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input type: expected string"
            )
        
        # Trim whitespace
        value = value.strip()
        
        # Check length
        if max_length and len(value) > max_length:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Input too long: maximum {max_length} characters allowed"
            )
        
        # Check for malicious patterns
        for pattern in InputValidator.BLOCKED_PATTERNS:
            if re.search(pattern, value, re.IGNORECASE):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid input: potentially malicious content detected"
                )
        
        # HTML encode to prevent XSS
        value = html.escape(value)
        
        return value
    
    @staticmethod
    def validate_email(email: str) -> str:
        """Validate and sanitize email address"""
        email = email.strip().lower()
        
        # Check length
        if len(email) > InputValidator.MAX_LENGTHS["email"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email too long: maximum {InputValidator.MAX_LENGTHS['email']} characters"
            )
        
        # Check pattern
        if not re.match(InputValidator.PATTERNS["email"], email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        return email
    
    @staticmethod
    def validate_password(password: str) -> None:
        """
        Validate password strength
        Requirements:
        - Minimum 8 characters
        - Maximum 128 characters
        - At least one uppercase letter
        - At least one lowercase letter
        - At least one number
        """
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters long"
            )
        
        if len(password) > InputValidator.MAX_LENGTHS["password"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password too long: maximum {InputValidator.MAX_LENGTHS['password']} characters"
            )
        
        if not re.search(r'[A-Z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
        
        if not re.search(r'[a-z]', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one lowercase letter"
            )
        
        if not re.search(r'\d', password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number"
            )
    
    @staticmethod
    def validate_filename(filename: str) -> str:
        """Validate uploaded filename"""
        filename = filename.strip()
        
        # Check length
        if len(filename) > InputValidator.MAX_LENGTHS["filename"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Filename too long: maximum {InputValidator.MAX_LENGTHS['filename']} characters"
            )
        
        # Check pattern (alphanumeric + common chars, must end with .pdf)
        if not re.match(InputValidator.PATTERNS["filename"], filename):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename: only PDF files with alphanumeric names allowed"
            )
        
        # Block path traversal attempts
        if '..' in filename or '/' in filename or '\\' in filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid filename: path traversal detected"
            )
        
        return filename
    
    @staticmethod
    def validate_uuid(value: str) -> str:
        """Validate UUID format"""
        value = value.strip().lower()
        
        if not re.match(InputValidator.PATTERNS["uuid"], value):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid ID format"
            )
        
        return value
    
    @staticmethod
    def validate_dict(data: Dict[str, Any], allowed_keys: set, required_keys: set = None) -> Dict[str, Any]:
        """
        Validate dictionary contains only allowed keys
        Rejects unexpected fields to prevent mass assignment vulnerabilities
        """
        if not isinstance(data, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid input: expected JSON object"
            )
        
        # Check for unexpected keys
        unexpected_keys = set(data.keys()) - allowed_keys
        if unexpected_keys:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unexpected fields: {', '.join(unexpected_keys)}"
            )
        
        # Check for required keys
        if required_keys:
            missing_keys = required_keys - set(data.keys())
            if missing_keys:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required fields: {', '.join(missing_keys)}"
                )
        
        return data


# Pydantic models with built-in validation

class SafeUserCreate(BaseModel):
    """Validated user creation model"""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=3, max_length=254)
    password: str = Field(..., min_length=8, max_length=128)
    
    @validator('name')
    def validate_name(cls, v):
        return InputValidator.sanitize_string(v, max_length=100)
    
    @validator('email')
    def validate_email(cls, v):
        return InputValidator.validate_email(v)
    
    @validator('password')
    def validate_password(cls, v):
        InputValidator.validate_password(v)
        return v


class SafeUserLogin(BaseModel):
    """Validated user login model"""
    email: str = Field(..., max_length=254)
    password: str = Field(..., max_length=128)
    
    @validator('email')
    def validate_email(cls, v):
        return InputValidator.validate_email(v)


class SafeReviewRequest(BaseModel):
    """Validated review request model"""
    paper_id: str = Field(..., min_length=36, max_length=36)
    review_type: str = Field(..., min_length=1, max_length=50)
    
    @validator('paper_id')
    def validate_paper_id(cls, v):
        return InputValidator.validate_uuid(v)
    
    @validator('review_type')
    def validate_review_type(cls, v):
        allowed_types = {'quick', 'detailed', 'comprehensive'}
        if v not in allowed_types:
            raise ValueError(f"Invalid review type. Allowed: {', '.join(allowed_types)}")
        return v


class SafeQueryRequest(BaseModel):
    """Validated query request model"""
    paper_id: str = Field(..., min_length=36, max_length=36)
    query: str = Field(..., min_length=1, max_length=1000)
    
    @validator('paper_id')
    def validate_paper_id(cls, v):
        return InputValidator.validate_uuid(v)
    
    @validator('query')
    def validate_query(cls, v):
        return InputValidator.sanitize_string(v, max_length=1000)
