from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_review
from app.models import Review, User, Product
from pydantic import BaseModel

router = APIRouter()


class ReviewCreateRequest(BaseModel):
    user_id: int
    product_id: int
    rating: int
    content: str


# Add a new review
@router.post("/reviews/", status_code=status.HTTP_201_CREATED)
def add_review(review_data: ReviewCreateRequest, db: Session = Depends(get_db)):
    # Check if user exists
    user = db.query(User).filter(User.id == review_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {review_data.user_id} not found",
        )

    # Check if product exists
    product = db.query(Product).filter(Product.id == review_data.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {review_data.product_id} not found",
        )

    # Create the review
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
@router.get("/reviews/", status_code=status.HTTP_200_OK)
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()

    if not reviews:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reviews found",
        )

    return reviews
