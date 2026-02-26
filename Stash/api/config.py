"""
Centralized configuration management for Stash API
Validates environment variables and provides type-safe settings
"""

import os
from typing import List
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Application settings loaded from environment variables"""
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = [
        origin.strip() 
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
        if origin.strip()
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_DAY: int = int(os.getenv("RATE_LIMIT_PER_DAY", "10"))
    
    # API Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SPOTIFY_CLIENT_ID: str = os.getenv("SPOTIFY_CLIENT_ID", "")
    SPOTIFY_CLIENT_SECRET: str = os.getenv("SPOTIFY_CLIENT_SECRET", "")
    
    # Feature Flags
    ENABLE_GENRE_DETECTION: bool = os.getenv("ENABLE_GENRE_DETECTION", "true").lower() == "true"
    ENABLE_DEBUG_LOGS: bool = os.getenv("ENABLE_DEBUG_LOGS", "false").lower() == "true"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    
    # Instagram Cookies (Multiple Accounts for Rotation)
    YTDLP_COOKIES_INSTAGRAM: List[str] = []
    
    # YouTube Cookies (Multiple Accounts for Rotation)
    YTDLP_COOKIES_YOUTUBE: List[str] = []
    
    def __init__(self):
        """Load all YTDLP_COOKIES* environment variables"""
        # Load Instagram cookies (supporting both legacy and new names)
        for var_name in ["YTDLP_COOKIES", "YTDLP_COOKIES_INSTAGRAM"]:
            val = os.getenv(var_name, "")
            if val:
                self.YTDLP_COOKIES_INSTAGRAM.append(val)
        
        # Load YTDLP_COOKIES_INSTAGRAM_1, YTDLP_COOKIES_INSTAGRAM_2, etc. (and legacy numbered)
        for prefix in ["YTDLP_COOKIES_", "YTDLP_COOKIES_INSTAGRAM_"]:
            i = 1
            while True:
                val = os.getenv(f"{prefix}{i}", "")
                if not val: break
                if val not in self.YTDLP_COOKIES_INSTAGRAM:
                    self.YTDLP_COOKIES_INSTAGRAM.append(val)
                i += 1
        
        # Load YouTube cookies
        youtube_cookie = os.getenv("YTDLP_COOKIES_YOUTUBE", "")
        if youtube_cookie:
            self.YTDLP_COOKIES_YOUTUBE.append(youtube_cookie)
        
        # Load YTDLP_COOKIES_YOUTUBE_1, YTDLP_COOKIES_YOUTUBE_2, etc.
        youtube_num = 1
        while True:
            cookie_var = f"YTDLP_COOKIES_YOUTUBE_{youtube_num}"
            cookie_value = os.getenv(cookie_var, "")
            
            if not cookie_value:
                break
                
            self.YTDLP_COOKIES_YOUTUBE.append(cookie_value)
            youtube_num += 1
        
        if self.ENABLE_DEBUG_LOGS:
            print(f"🍪 Loaded {len(self.YTDLP_COOKIES_INSTAGRAM)} Instagram cookie account(s)")
            print(f"🍪 Loaded {len(self.YTDLP_COOKIES_YOUTUBE)} YouTube cookie account(s)")

    
    def validate(self) -> bool:
        """Validate that all required environment variables are set"""
        required_vars = {
            "GEMINI_API_KEY": self.GEMINI_API_KEY,
            "SPOTIFY_CLIENT_ID": self.SPOTIFY_CLIENT_ID,
            "SPOTIFY_CLIENT_SECRET": self.SPOTIFY_CLIENT_SECRET,
        }
        
        missing = [key for key, value in required_vars.items() if not value]
        
        if missing:
            print(f"⚠️ Warning: Missing required environment variables: {', '.join(missing)}")
            print("⚠️ Some features (Recognition, Spotify Save) will be disabled.")
            return False
        
        if self.ENABLE_DEBUG_LOGS:
            print("✅ All required environment variables are set")
            print(f"🌍 Environment: {self.ENVIRONMENT}")
            print(f"🔒 CORS Origins: {', '.join(self.ALLOWED_ORIGINS)}")
            print(f"⏱️  Rate Limit: {self.RATE_LIMIT_PER_DAY} requests/day")
        return True


# Global settings instance
settings = Settings()

# Validate on import (Don't crash, just log)
settings.validate()
