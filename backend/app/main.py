"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db, SessionLocal
from app.api.v1.auth import router as auth_router
from app.api.v1.synthesis import router as synthesis_router
from app.api.v1.datasets import router as datasets_router
from app.api.v1.models_api import router as models_router
from app.api.v1.quality import router as quality_router
from app.api.v1.dashboard import router as dashboard_router
from app.seed.seed import seed_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(synthesis_router, prefix=settings.API_V1_PREFIX)
app.include_router(datasets_router, prefix=settings.API_V1_PREFIX)
app.include_router(models_router, prefix=settings.API_V1_PREFIX)
app.include_router(quality_router, prefix=settings.API_V1_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_V1_PREFIX)


@app.on_event("startup")
def on_startup():
    """Initialize database and seed data on startup."""
    init_db()
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
