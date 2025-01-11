"""
    This module provides configuration settings for the FastAPI application.

    The configuration settings are loaded from environment variables, with default
    values provided for each setting. The environment variables can be loaded from
    a .env file using the `load_dotenv` function from the `dotenv` package.

    Classes:
        Config: A class that encapsulates the configuration settings for the FastAPI
        application, including FastAPI URL, NATS server URL, and PostgreSQL connection
        details.

    Functions:
        load_dotenv: Loads environment variables from a .env file.

    Environment Variables:
        FASTAPI_URL: The URL for the FastAPI application.
        NATS_SERVER_URL: The URL for the NATS server.
        POSTGRES_USER: The username for the PostgreSQL database.
        POSTGRES_PASSWORD: The password for the PostgreSQL database.
        POSTGRES_DB: The name of the PostgreSQL database.
        POSTGRES_HOST: The host address for the PostgreSQL database.
        POSTGRES_PORT: The port number for the PostgreSQL database.
        DATABASE_URL: The full database URL for the PostgreSQL database.
"""

import os
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv(dotenv_path="./.env")


class Config:
    """
    Configuration settings for the FastAPI application.

    This class loads configuration settings from environment variables, with
    default values provided for each setting. The environment variables can be
    loaded from a .env file using the `load_dotenv` function from the `dotenv`
    package.

    """

    # FastAPI application configuration
    FASTAPI_URL = os.getenv("FASTAPI_URL", "http://localhost:5001")
    NATS_SERVER_URL = os.getenv("NATS_SERVER_URL", "nats://nats:4222")

    # PostgreSQL connection details
    POSTGRES_USER = os.getenv("POSTGRES_USER", "marketplace")
    POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "marketplace")
    POSTGRES_DB = os.getenv("POSTGRES_DB", "marketplace_db")
    POSTGRES_HOST = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5435")
    DATABASE_URL = os.getenv("DATABASE_URL")
    TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL")
