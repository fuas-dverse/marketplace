from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_review, update_product
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

    average_rating = product.average_rating
    rating_count = product.rating_count
    if average_rating is None:
        average_rating = 0
    if rating_count is None:
        rating_count = 0

    # Update the average rating and rating count
    average_rating = (average_rating * rating_count + review_data.rating) / (
        rating_count + 1
    )
    rating_count += 1

    # Create the review
    review = create_review(
        db,
        user_id=review_data.user_id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        content=review_data.content,
    )

    product = update_product(db, product, average_rating, rating_count)

    return {
        "message": "Review created successfully",
        "review": {
            "id": review.id,
            "rating": review.rating,
            "content": review.content,
            "user_id": review.user_id,
            "product_id": review.product_id,
            "new_average_rating": product.average_rating,
            "rating_count": product.rating_count,
        },
    }


# Get all reviews
@router.get("/reviews/", status_code=status.HTTP_200_OK)
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).all()
    if reviews:
        return {
            "message": "Reviews found",
            "reviews": [
                {
                    "id": review.id,
                    "rating": review.rating,
                    "content": review.content,
                    "user_id": review.user_id,
                    "product_id": review.product_id,
                }
                for review in reviews
            ],
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No reviews found",
        )


# Get all reviews per product
@router.get("/reviews/{product_id}", status_code=status.HTTP_200_OK)
def get_reviews_per_product(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).all()

    if reviews:
        return {
            "message": "Reviews found",
            "reviews": [
                {
                    "id": review.id,
                    "rating": review.rating,
                    "content": review.content,
                    "buyer_id": review.user_id,
                    "product_id": review.product_id,
                }
                for review in reviews
            ],
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Reviews for product with id {product_id} not found",
        )
