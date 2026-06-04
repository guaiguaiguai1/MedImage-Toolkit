"""Application configuration."""

import os
import secrets
from pathlib import Path


class Settings:
    PROJECT_NAME: str = "MedImage Toolkit API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Medical Image Synthesis Toolkit"
    API_V1_PREFIX: str = "/api/v1"

    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/medimage.db")

    # Security: Read SECRET_KEY from environment variable, generate random key if not set
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    if not SECRET_KEY:
        SECRET_KEY = secrets.token_urlsafe(32)
        print("WARNING: SECRET_KEY not set in environment. Using random key (tokens will be invalid on restart).")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

    CORS_ORIGINS: list[str] = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173"
    ).split(",")

    OUTPUT_DIR: Path = BASE_DIR / "outputs"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
