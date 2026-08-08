import sys
import os

# Add parent directory to python path so app module can be found
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.main import app

# Export FastAPI app for Vercel Serverless Function
app = app
