"""
Centralized configuration management for Stash API.
Validates environment variables and provides type-safe settings.
"""

import logging
import os
from typing import List

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


def _load_env_str(key: str, default: str = "") -> str:
    return os.getenv(key, default)


def _load_env_int(key: str, default: int = 0) -> int:
    return int(os.getenv(key, str(default)))


def _load_env_bool(key: str, default: bool = False) -> bool:
    return os.getenv(key, str(default)).lower() == "true"


def _load_numbered_cookies(base_name: str, extra_names: List[str] | None = None) -> List[str]:
    """Load cookie values from env vars: BASE_NAME, then BASE_NAME_1, BASE_NAME_2, etc."""
    cookies: List[str] = []
    seen: set[str] = set()

    # Load from extra/legacy names first
    for var_name in extra_names or []:
        val = os.getenv(var_name, "").strip()
        if val and val not in seen:
            cookies.append(val)
            seen.add(val)

    # Load base name
    base_val = os.getenv(base_name, "").strip()
    if base_val and base_val not in seen:
        cookies.append(base_val)
        seen.add(base_val)

    # Load numbered variants: BASE_NAME_1, BASE_NAME_2, ...
    i = 1
    while True:
        val = os.getenv(f"{base_name}_{i}", "").strip()
        if not val:
            break
        if val not in seen:
            cookies.append(val)
            seen.add(val)
        i += 1

    return cookies


class Settings:
    """Application settings loaded from environment variables."""

    def __init__(self) -> None:
        # CORS Configuration
        self.ALLOWED_ORIGINS: List[str] = [
            origin.strip()
            for origin in _load_env_str("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
            if origin.strip()
        ]

        # Rate Limiting
        self.RATE_LIMIT_PER_DAY: int = _load_env_int("RATE_LIMIT_PER_DAY", 10)

        # API Keys
        self.GEMINI_API_KEY: str = _load_env_str("GEMINI_API_KEY")
        self.SPOTIFY_CLIENT_ID: str = _load_env_str("SPOTIFY_CLIENT_ID")
        self.SPOTIFY_CLIENT_SECRET: str = _load_env_str("SPOTIFY_CLIENT_SECRET")

        # Feature Flags
        self.ENABLE_GENRE_DETECTION: bool = _load_env_bool("ENABLE_GENRE_DETECTION", True)
        self.ENABLE_DEBUG_LOGS: bool = _load_env_bool("ENABLE_DEBUG_LOGS", False)

        # Environment
        self.ENVIRONMENT: str = _load_env_str("ENVIRONMENT", "production")

        # Cookie Rotation — instance-level lists (no shared mutable state)
        self.YTDLP_COOKIES_INSTAGRAM: List[str] = _load_numbered_cookies(
            "YTDLP_COOKIES_INSTAGRAM",
            extra_names=["YTDLP_COOKIES"],
        )
        self.YTDLP_COOKIES_YOUTUBE: List[str] = _load_numbered_cookies(
            "YTDLP_COOKIES_YOUTUBE",
        )

        logger.debug(
            "Loaded %d Instagram cookie account(s), %d YouTube cookie account(s)",
            len(self.YTDLP_COOKIES_INSTAGRAM),
            len(self.YTDLP_COOKIES_YOUTUBE),
        )

    def validate(self) -> bool:
        """Validate that all required environment variables are set."""
        required_vars = {
            "GEMINI_API_KEY": self.GEMINI_API_KEY,
            "SPOTIFY_CLIENT_ID": self.SPOTIFY_CLIENT_ID,
            "SPOTIFY_CLIENT_SECRET": self.SPOTIFY_CLIENT_SECRET,
        }

        missing = [key for key, value in required_vars.items() if not value]

        if missing:
            logger.warning("Missing required environment variables: %s", ", ".join(missing))
            logger.warning("Some features (Recognition, Spotify Save) will be disabled.")
            return False

        logger.debug("All required environment variables are set")
        logger.debug("Environment: %s", self.ENVIRONMENT)
        logger.debug("CORS Origins: %s", ", ".join(self.ALLOWED_ORIGINS))
        logger.debug("Rate Limit: %d requests/day", self.RATE_LIMIT_PER_DAY)
        return True


# Global settings instance
settings = Settings()

# Validate on import (Don't crash, just log)
settings.validate()
