"""Application configuration."""

from pathlib import Path


class Settings:
    PROJECT_NAME: str = "MedImage Toolkit API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Backend API for Medical Image Synthesis Toolkit"
    API_V1_PREFIX: str = "/api/v1"

    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    DATABASE_URL: str = f"sqlite:///{BASE_DIR}/medimage.db"

    SECRET_KEY: str = "medimage-toolkit-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ]

    OUTPUT_DIR: Path = BASE_DIR / "outputs"
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


settings = Settings()
