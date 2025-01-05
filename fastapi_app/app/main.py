from dverse_nats_helper.nats_connection import connect_nats, nc
from fastapi import FastAPI
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

Base.metadata.create_all(bind=engine)

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(users_router, prefix="/api", tags=["Users"])
app.include_router(transactions_router, prefix="/api", tags=["Transactions"])
app.include_router(reviews_router, prefix="/api", tags=["Reviews"])


@app.on_event("startup")
async def startup_event():
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
