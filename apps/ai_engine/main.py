"""
FastAPI AI Engine Service
Main application file for the AI processing microservice
"""
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.api.v1.router import api_router
from app.core.logging import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
setup_logging()

# Security
security = HTTPBearer()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    print("🚀 AI Engine Service starting up...")
    yield
    # Shutdown
    print("🛑 AI Engine Service shutting down...")


app = FastAPI(
    title="AI Engine Service",
    description="Microservice for AI processing operations including document categorization, extraction, OCR, and more",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "AI Engine Service",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "ai_engine"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )

