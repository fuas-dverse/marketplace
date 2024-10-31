from fastapi import FastAPI
from app.api.products import router as products_router
from app.api.users import router as users_router
from app.api.transactions import router as transactions_router
from app.api.reviews import router as reviews_router
from app.database import engine
from app.models import Base
from sqlalchemy.orm import Session
from app.database import insert_user_if_empty, get_db

app = FastAPI()

Base.metadata.create_all(bind=engine)

app.include_router(products_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")


@app.on_event("startup")
def startup_event():
    db: Session = next(get_db())
    insert_user_if_empty(db=db)


@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
