from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_review,
)
from models import Review
from pydantic import BaseModel

app = FastAPI()


class ReviewCreateRequest(BaseModel):
    user_id: int
    product_id: int
    rating: int
    content: str


# Add a new review
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


# Get all reviews
@app.get("/reviews/")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()
    return reviews
