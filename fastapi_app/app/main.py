from fastapi import FastAPI
from app.api.products import router as products_router
from app.api.users import router as users_router
from app.api.transactions import router as transactions_router
from app.api.reviews import router as reviews_router
from app.database import engine
from app.models import Base
from sqlalchemy.orm import Session
from app.database import insert_user_if_empty, get_db
from dverse_nats_helper import connect_nats, nc

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
    db: Session = next(get_db())
    insert_user_if_empty(db=db)
    await connect_nats()


@app.on_event("shutdown")
async def shutdown_event():
    if nc.is_connected:
        await nc.close()


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the API.

    Returns a welcome message.
    """
    return {"message": "Welcome to the API"}
