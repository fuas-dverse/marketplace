import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# FastAPI application configuration
FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")

# PostgreSQL connection details
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "marketplace_db")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
