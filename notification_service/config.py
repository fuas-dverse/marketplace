import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv(dotenv_path="./.env")


class Config:
    NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://nats:4222")
    NOTIFICATION_TYPE = os.getenv("NOTIFICATION_TYPE", "in_app")
