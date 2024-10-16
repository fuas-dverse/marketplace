from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_user,
    create_product,
    create_transaction,
    create_review,
    update_product,
)
from models import User, Product, Transaction, Review
from pydantic import BaseModel

app = FastAPI()


class UserCreateRequest(BaseModel):
    username: str


class ProductCreateRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_id: int
    average_rating: float
    rating_count: int


class ReviewCreateRequest(BaseModel):
    user_id: int
    product_id: int
    rating: int
    content: str


class TransactionCreateRequest(BaseModel):
    buyer_id: int
    product_id: int
    status: str


@app.post("/users/")
def add_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    user = create_user(db, username=user_data.username)
    return {
        "message": "User created successfully",
        "user": {"id": user.id, "username": user.username},
    }


@app.post("/products/")
def add_product(product_data: ProductCreateRequest, db: Session = Depends(get_db)):
    product = create_product(
        db,
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        seller_id=product_data.seller_id,
        average_rating=0.0,
        rating_count=0,
    )
    return {
        "message": "Product created successfully",
        "product": {"id": product.id, "title": product.title},
    }


@app.post("/products/{product_id}/review/")
def update_product_rating(
    product_id: int,
    average_rating: float,
    rating_count: int,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        return {"message": "Product not found"}, 404

    product = update_product(db, product, average_rating, rating_count)

    return {
        "message": "Review added successfully",
        "new_average_rating": product.average_rating,
        "rating_count": product.rating_count,
    }


@app.post("/transactions/")
def add_transaction(
    transaction_data: TransactionCreateRequest, db: Session = Depends(get_db)
):
    transaction = create_transaction(
        db,
        buyer_id=transaction_data.buyer_id,
        product_id=transaction_data.product_id,
        status=transaction_data.status,
    )
    return {
        "message": "Transaction created successfully",
        "transaction": {"id": transaction.id, "status": transaction.status},
    }


@app.post("/reviews/")
def add_review(review_data: ReviewCreateRequest, db: Session = Depends(get_db)):
    review = create_review(
        db,
        user_id=review_data.user_id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        content=review_data.content,
    )

    return {
        "message": "Review created successfully",
        "review": {
            "id": review.id,
            "rating": review.rating,
            "content": review.content,
            "user_id": review.user_id,
            "product_id": review.product_id,
        },
    }


@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()  # Fetch all products
    if products:
        return {
            "message": "Products found",
            "products": [
                {
                    "id": product.id,
                    "title": product.title,
                    "price": product.price,
                    "seller_id": product.seller_id,
                    "average_rating": product.average_rating,
                    "rating_count": product.rating_count,
                }
                for product in products
            ],
        }
    else:
        return {"message": "No products found"}, 404


@app.get("/products/{product_id}")
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        return {
            "message": "Product found",
            "product": {
                "id": product.id,
                "title": product.title,
                "price": product.price,
                "seller_id": product.seller_id,
                "average_rating": product.average_rating,
                "rating_count": product.rating_count,
            },
        }
    else:
        return {"message": "Product not found"}, 404


@app.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()  # Fetch all users
    return users


@app.get("/users/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user:
        return {
            "message": "User found",
            "user": {"id": user.id, "username": user.username},
        }
    else:
        return {"message": "User not found"}, 404


@app.get("/transactions/")
def get_all_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()  # Fetch all transactions
    return transactions


@app.get("/transactions/{user_id}")
def get_user_transactions(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.buyer_id == user_id).all()
    return transactions


@app.get("/reviews/")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()  # Fetch all reviews
    return reviews
