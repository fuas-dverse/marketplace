import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv(dotenv_path="./.env")


class Config:
    # NATS server configuration
    NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://0.0.0.0:4222")

    # FastAPI application configuration
    FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:5001")

    # Device configuration (0 for GPU, -1 for CPU)
    CUDA_DEVICE = int(os.getenv("CUDA_DEVICE", 0))
