
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import Base, engine
from app.database import models

from app.api.routes.auth import router as auth_router


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="StudyMate API",
    description="AI-powered education platform backend",
    version="1.0.0",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# ROUTES
# =========================================================

app.include_router(auth_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "Welcome to StudyMate API 🚀",
        "version": "1.0.0",
        "status": "running",
    }


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "StudyMate API",
    }
