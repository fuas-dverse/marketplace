"""
This module defines the main entry point for the FastAPI application
serving as the backend for the marketplace use case.

The application includes the following functionalities:
- Product management
- User management
- Transaction management
- Review management

The application also handles startup and shutdown events to manage
database initialization and NATS server connections.

Modules and packages imported:
- dverse_nats_helper.nats_connection: For connecting to the NATS server.
- fastapi: For creating the FastAPI application.
- sqlalchemy.orm: For database session management.
- app.api.products: Product-related API routes.
- app.api.reviews: Review-related API routes.
- app.api.transactions: Transaction-related API routes.
- app.api.users: User-related API routes.
- app.config: Configuration settings for the application.
- app.database: Database engine and session management.
- app.models: Database models.

Routes included:
- /api/products: Product-related endpoints.
- /api/users: User-related endpoints.
- /api/transactions: Transaction-related endpoints.
- /api/reviews: Review-related endpoints.
- /: Root endpoint returning a welcome message.

Startup and shutdown events:
- startup_event: Initializes the database and connects to the NATS server.
- shutdown_event: Closes the connection to the NATS server.
"""

from dverse_nats_helper.nats_connection import connect_nats, nc
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from apitally.fastapi import ApitallyMiddleware
from sqlalchemy.orm import Session

from app.api.products import router as products_router
from app.api.reviews import router as reviews_router
from app.api.transactions import router as transactions_router
from app.api.users import router as users_router
from app.config import Config
from app.database import engine, get_db, insert_user_if_empty
from app.models import Base

app = FastAPI(
    title="The Marketplace API",
    description=(
        "This is a FastAPI application serving as the backend for the "
        "marketplace use case."
    ),
)

Instrumentator().instrument(app).expose(app)
app.add_middleware(
    ApitallyMiddleware,
    client_id="3fd3190f-26c3-4eff-b7a1-66307cd50078",
    env="dev",
)

Base.metadata.create_all(bind=engine)

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(users_router, prefix="/api", tags=["Users"])
app.include_router(transactions_router, prefix="/api", tags=["Transactions"])
app.include_router(reviews_router, prefix="/api", tags=["Reviews"])


@app.on_event("startup")
async def startup_event(get_db=get_db):
    """
    Handles startup events for the FastAPI application.

    This function performs the following tasks during the startup of the application:
    1. Initializes a database session and inserts a user if the database is empty.
    2. Establishes a connection to a NATS server using the provided server URL.

    Raises:
    Exception: If there is an error connecting to the NATS server."""

    db: Session = next(get_db())
    insert_user_if_empty(db=db)
    await connect_nats(server_url=Config.NATS_SERVER_URL)


@app.on_event("shutdown")
async def shutdown_event():
    """
    Handles shutdown events for the FastAPI application.

    This function closes the connection to the NATS server."""
    if nc.is_connected:
        await nc.close()


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the API.

    Returns a welcome message.
    """
    return {"message": "Welcome to the API"}
