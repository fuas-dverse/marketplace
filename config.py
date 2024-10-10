import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# NATS server configuration
NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://127.0.0.1:4222")

# Device configuration (0 for GPU, -1 for CPU)
CUDA_DEVICE = int(os.getenv("CUDA_DEVICE", 0))

# File paths for storing data
USERS_FILE = os.getenv("USERS_FILE", "users.json")
PRODUCTS_FILE = os.getenv("PRODUCTS_FILE", "products.json")
TRANSACTIONS_FILE = os.getenv("TRANSACTIONS_FILE", "transactions.json")
REVIEWS_FILE = os.getenv("REVIEWS_FILE", "reviews.json")
