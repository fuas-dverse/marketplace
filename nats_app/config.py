import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

# NATS server configuration
NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://127.0.0.1:4222")
