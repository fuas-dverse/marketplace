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

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "product_id": 101,
                "rating": 5,
                "content": "Great product! Highly recommend.",
            }
        }


class ReviewResponse(BaseModel):
    id: int
    rating: int
    content: str
    user_id: int
    product_id: int
    new_average_rating: float
    rating_count: int

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "rating": 5,
                "content": "Great product! Highly recommend.",
                "user_id": 1,
                "product_id": 101,
                "new_average_rating": 4.5,
                "rating_count": 100,
            }
        }


class ErrorResponse(BaseModel):
    detail: str

    class Config:
        json_schema_extra = {"example": {"detail": "User with id 1 not found"}}


# Add a new review
@router.post(
    "/reviews/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new review",
    description=(
        "Add a new review for a product by a user. "
        "The product's average rating and rating count will be updated accordingly."
    ),
    response_description="The details of the created review.",
    responses={
        201: {"model": ReviewResponse, "description": "Review created successfully."},
        404: {"model": ErrorResponse, "description": "User or product not found."},
        500: {"description": "Internal server error."},
    },
)
def add_review(review_data: ReviewCreateRequest, db: Session = Depends(get_db)):
    """
    Create a review for a product.

    - **user_id**: ID of the user leaving the review.
    - **product_id**: ID of the product being reviewed.
    - **rating**: Rating given to the product (e.g., 1-5).
    - **content**: Written feedback about the product.
    """
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

    average_rating = product.average_rating or 0
    rating_count = product.rating_count or 0

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
@router.get(
    "/reviews/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all reviews",
    description="Fetch a list of all reviews across all products.",
    response_description="A list of reviews with details.",
    responses={
        200: {
            "description": "List of reviews retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Reviews found",
                        "reviews": [
                            {
                                "id": 1,
                                "rating": 5,
                                "content": "Great product!",
                                "user_id": 1,
                                "product_id": 101,
                            }
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "No reviews found."},
        500: {"description": "Internal server error."},
    },
)
def get_reviews(db: Session = Depends(get_db)):
    """
    Retrieve all reviews.

    Returns a list of all reviews with details such as:
    - **id**: Review ID
    - **rating**: Product rating
    - **content**: Review content
    - **user_id**: User ID of the reviewer
    - **product_id**: Product ID of the reviewed product
    """
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
@router.get(
    "/reviews/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve reviews for a specific product",
    description="Fetch a list of all reviews for a given product ID.",
    response_description="A list of reviews for the specified product.",
    responses={
        200: {
            "description": "List of reviews for the product retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Reviews found",
                        "reviews": [
                            {
                                "id": 1,
                                "rating": 5,
                                "content": "Great product!",
                                "buyer_id": 1,
                                "product_id": 101,
                            }
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Product reviews not found."},
        500: {"description": "Internal server error."},
    },
)
def get_reviews_per_product(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all reviews for a specific product.

    - **product_id**: ID of the product for which reviews are requested.
    """
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
