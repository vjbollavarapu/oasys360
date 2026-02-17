"""
Logging configuration
"""
import logging
import sys
from pathlib import Path


def setup_logging():
    """Setup application logging"""
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    log_level = logging.DEBUG
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_dir / "ai_engine.log")
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("fastapi").setLevel(logging.INFO)

