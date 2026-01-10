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
    
    def validate(self) -> None:
        """Validate that all required environment variables are set"""
        required_vars = {
            "GEMINI_API_KEY": self.GEMINI_API_KEY,
            "SPOTIFY_CLIENT_ID": self.SPOTIFY_CLIENT_ID,
            "SPOTIFY_CLIENT_SECRET": self.SPOTIFY_CLIENT_SECRET,
        }
        
        missing = [key for key, value in required_vars.items() if not value]
        
        if missing:
            raise ValueError(
                f"❌ Missing required environment variables: {', '.join(missing)}\n"
                f"Please set these in your .env file or environment."
            )
        
        print("✅ All required environment variables are set")
        print(f"🌍 Environment: {self.ENVIRONMENT}")
        print(f"🔒 CORS Origins: {', '.join(self.ALLOWED_ORIGINS)}")
        print(f"⏱️  Rate Limit: {self.RATE_LIMIT_PER_DAY} requests/day")


# Global settings instance
settings = Settings()

# Validate on import
try:
    settings.validate()
except ValueError as e:
    print(str(e))
    raise
