"""
Rate Limiting Middleware
Implements IP-based and user-based rate limiting to prevent abuse
Follows OWASP recommendations for API rate limiting
"""

from fastapi import Request, HTTPException, status
from datetime import datetime, timedelta
from typing import Dict, Tuple
import time

class RateLimiter:
    """
    Advanced rate limiter with both IP and user-based tracking
    
    Features:
    - Sliding window algorithm for accurate rate limiting
    - Separate limits for authenticated vs anonymous users
    - Graceful 429 responses with Retry-After header
    - Per-endpoint rate limit configuration
    """
    
    def __init__(self):
        # Storage format: {key: [(timestamp1, timestamp2, ...)]}
        self.ip_requests: Dict[str, list] = {}
        self.user_requests: Dict[str, list] = {}
        
        # Rate limit configurations (requests per time window)
        self.configs = {
            # Anonymous users (IP-based) - more restrictive
            "anonymous": {
                "upload": (5, 900),      # 5 requests per 15 minutes
                "review": (10, 900),     # 10 requests per 15 minutes
                "advanced": (3, 900),    # 3 requests per 15 minutes
                "default": (30, 300),    # 30 requests per 5 minutes
            },
            # Authenticated users - more permissive
            "authenticated": {
                "upload": (20, 3600),    # 20 requests per hour
                "review": (50, 3600),    # 50 requests per hour
                "advanced": (15, 3600),  # 15 requests per hour
                "default": (100, 300),   # 100 requests per 5 minutes
            }
        }
    
    def _clean_old_requests(self, requests: list, window_seconds: int) -> list:
        """Remove requests older than the time window"""
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        return [req_time for req_time in requests if req_time > cutoff_time]
    
    def _get_client_ip(self, request: Request) -> str:
        """Extract client IP address from request, handling proxies"""
        # Check X-Forwarded-For header (for proxies/load balancers)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Take the first IP in the chain
            return forwarded.split(",")[0].strip()
        
        # Check X-Real-IP header (nginx proxy)
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to direct connection IP
        return request.client.host if request.client else "unknown"
    
    def _get_user_id(self, request: Request) -> str | None:
        """Extract user ID from JWT token if present"""
        try:
            auth_header = request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                # In production, decode JWT to get user ID
                # For now, use the token as identifier
                return auth_header[7:]  # Remove "Bearer "
            return None
        except:
            return None
    
    def _get_endpoint_category(self, path: str) -> str:
        """Determine endpoint category for rate limiting"""
        if "/upload" in path:
            return "upload"
        elif "/review" in path or "/analyze" in path:
            return "review"
        elif "/advanced" in path:
            return "advanced"
        else:
            return "default"
    
    async def check_rate_limit(self, request: Request) -> None:
        """
        Check if request should be rate limited
        
        Raises:
            HTTPException: 429 Too Many Requests if limit exceeded
        """
        # Get client identifiers
        client_ip = self._get_client_ip(request)
        user_id = self._get_user_id(request)
        endpoint_category = self._get_endpoint_category(request.url.path)
        
        # Determine which config to use
        is_authenticated = user_id is not None
        config_type = "authenticated" if is_authenticated else "anonymous"
        max_requests, window_seconds = self.configs[config_type][endpoint_category]
        
        # Choose tracking store (user-based if authenticated, IP-based otherwise)
        if is_authenticated:
            tracking_key = f"user:{user_id}"
            storage = self.user_requests
        else:
            tracking_key = f"ip:{client_ip}"
            storage = self.ip_requests
        
        # Initialize tracking for new clients
        if tracking_key not in storage:
            storage[tracking_key] = []
        
        # Clean old requests
        storage[tracking_key] = self._clean_old_requests(
            storage[tracking_key], 
            window_seconds
        )
        
        # Check if limit exceeded
        current_count = len(storage[tracking_key])
        
        if current_count >= max_requests:
            # Calculate retry-after time
            oldest_request = min(storage[tracking_key])
            retry_after = int(window_seconds - (time.time() - oldest_request)) + 1
            
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "Rate limit exceeded",
                    "message": f"Too many requests. Please try again in {retry_after} seconds.",
                    "retry_after": retry_after,
                    "limit": max_requests,
                    "window": f"{window_seconds // 60} minutes"
                },
                headers={"Retry-After": str(retry_after)}
            )
        
        # Record this request
        storage[tracking_key].append(time.time())


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_dependency(request: Request):
    """
    FastAPI dependency for rate limiting
    Usage: @router.post("/endpoint", dependencies=[Depends(rate_limit_dependency)])
    """
    await rate_limiter.check_rate_limit(request)
