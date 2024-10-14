from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_user,
    create_product,
    create_transaction,
    create_review
)
from models import User, Product, Transaction, Review
from pydantic import BaseModel

app = FastAPI()


class UserCreateRequest(BaseModel):
    username: str


@app.post("/users/")
def add_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    user = create_user(db, username=user_data.username)
    return {
            "message": "User created successfully",
            "user": {"id": user.id, "username": user.username}
        }


@app.post("/products/")
def add_product(
    title: str,
    description: str,
    price: float,
    seller_id: int,
    db: Session = Depends(get_db)
):
    product = create_product(
        db, title=title, description=description, price=price, seller_id=seller_id
    )
    return {
        "message": "Product created successfully",
        "product": {"id": product.id, "title": product.title}
    }


@app.post("/transactions/")
def add_transaction(
    buyer_id: int,
    product_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    transaction = create_transaction(
        db, buyer_id=buyer_id, product_id=product_id, status=status
    )
    return {
        "message": "Transaction created successfully",
        "transaction": {
            "id": transaction.id,
            "status": transaction.status
        }
    }


@app.post("/reviews/")
def add_review(
    user_id: int,
    product_id: int,
    rating: int,
    content: str,
    db: Session = Depends(get_db)
):
    review = create_review(
        db, user_id=user_id, product_id=product_id, rating=rating, content=content
    )
    return {
        "message": "Review created successfully",
        "review": {
            "id": review.id,
            "rating": review.rating
        }
    }


@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()  # Fetch all products
    return products


@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()  # Fetch all users
    return users


@app.get("/users/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    return user


@app.get("/transactions/")
def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()  # Fetch all transactions
    return transactions


@app.get("/reviews/")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()  # Fetch all reviews
    return reviews
