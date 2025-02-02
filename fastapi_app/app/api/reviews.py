"""
This module defines the API endpoints for managing product reviews using FastAPI.

Endpoints:
- POST /reviews/: Add a new review for a product.
- GET /reviews/: Retrieve all reviews across all products.
- GET /reviews/{product_id}: Retrieve all reviews for a specific product.

Classes:
- ReviewCreateRequest: Represents a request to create a new review.
- ReviewResponse: Represents the response of a review,
    including updated product ratings.
- ErrorResponse: Represents an error response.

Functions:
- add_review: Endpoint to create a new review for a product.
- get_reviews: Endpoint to retrieve all reviews.
- get_reviews_per_product: Endpoint to retrieve all reviews for a specific product.
"""

from dverse_nats_helper.event_builder import build_event
from dverse_nats_helper.nats_connection import publish_event
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import create_review, get_db, update_product
from app.models import Product, Review, User

router = APIRouter()


class ReviewCreateRequest(BaseModel):
    """
    Represents a request to create a new review for a product.

    Attributes:
        user_id (str): The ID of the user creating the review.
        product_id (str): The ID of the product being reviewed.
        rating (int): The rating given to the product (e.g., 1-5).
        content (str): The content of the review.
    """

    user_id: str
    product_id: str
    rating: int
    content: str

    class Config:
        """
        Configuration for the schema example.
        """

        json_schema_extra = {
            "example": {
                "user_id": 1,
                "product_id": "101",
                "rating": 5,
                "content": "Great product! Highly recommend.",
            }
        }


class ReviewResponse(BaseModel):
    """
    Represents the response of a review, including details about the review
    and updated product ratings.

    Attributes:
        id (int): The unique identifier of the review.
        rating (int): The rating given to the product.
        content (str): The content of the review.
        user_id (str): The ID of the user who created the review.
        product_id (str): The ID of the product being reviewed.
        new_average_rating (float): The updated average rating of the product.
        rating_count (int): The updated count of ratings for the product.
    """

    id: int
    rating: int
    content: str
    user_id: str
    product_id: str
    new_average_rating: float
    rating_count: int

    class Config:
        """
        Configuration for the schema example.
        """

        json_schema_extra = {
            "example": {
                "id": 1,
                "rating": 5,
                "content": "Great product! Highly recommend.",
                "user_id": 1,
                "product_id": "101",
                "new_average_rating": 4.5,
                "rating_count": 100,
            }
        }


class ErrorResponse(BaseModel):
    """
    Represents an error response.

    Attributes:
        detail (str): The detailed message describing the error.
    """

    detail: str

    class Config:
        """
        Configuration for the schema example.
        """

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
async def add_review(review_data: ReviewCreateRequest, db: Session = Depends(get_db)):
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

    new_event = build_event(
        review,
        actor={"actor_id": str(user.id), "username": user.username},
        system={
            "platform": "marketplace",
            "service": "reviews",
            "event_type": "posted",
        },
    )

    await publish_event("review.created", new_event)

    return {
        "message": "Review created successfully",
        "review": {
            "id": str(review.id),
            "rating": review.rating,
            "content": review.content,
            "user_id": str(review.user_id),
            "product_id": str(review.product_id),
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
                                "product_id": "101",
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
                    "id": str(review.id),
                    "rating": review.rating,
                    "content": review.content,
                    "user_id": str(review.user_id),
                    "product_id": str(review.product_id),
                }
                for review in reviews
            ],
        }

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
                                "product_id": "101",
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
def get_reviews_per_product(product_id: str, db: Session = Depends(get_db)):
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
                    "id": str(review.id),
                    "rating": review.rating,
                    "content": review.content,
                    "user_id": str(review.user_id),
                    "product_id": str(review.product_id),
                }
                for review in reviews
            ],
        }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Reviews for product with id {product_id} not found",
    )
