from fastapi import FastAPI
from app.api.products import router as products_router
from app.api.users import router as users_router
from app.api.transactions import router as transactions_router
from app.api.reviews import router as reviews_router

app = FastAPI()


app.include_router(products_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
