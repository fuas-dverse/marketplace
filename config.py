import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# NATS server configuration
NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://127.0.0.1:4222")

# FastAPI application configuration
FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:8000")

# Device configuration (0 for GPU, -1 for CPU)
CUDA_DEVICE = int(os.getenv("CUDA_DEVICE", 0))

# File paths for storing data
USERS_FILE = os.getenv("USERS_FILE", "users.json")
PRODUCTS_FILE = os.getenv("PRODUCTS_FILE", "products.json")
TRANSACTIONS_FILE = os.getenv("TRANSACTIONS_FILE", "transactions.json")
REVIEWS_FILE = os.getenv("REVIEWS_FILE", "reviews.json")

# PostgreSQL connection details
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "password")
POSTGRES_DB = os.getenv("POSTGRES_DB", "marketplace_db")
POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
