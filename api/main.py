from fastapi import FastAPI
from products import router as products_router
from users import router as users_router
from transactions import router as transactions_router
from reviews import router as reviews_router

app = FastAPI()


app.include_router(products_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(transactions_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to the API"}
