from dverse_nats_helper.event_builder import build_event
from dverse_nats_helper.nats_connection import publish_event
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import create_product, get_db, update_product
from app.models import Product, User

router = APIRouter()


class ProductCreateRequest(BaseModel):
    """
    ProductCreateRequest model for creating a new product.
    Attributes:
        title (str): The title of the product.
        description (str): A detailed description of the product.
        price (float): The price of the product.
        seller_id (str): The ID of the seller.
        average_rating (float, optional): The average rating of the product.
        Defaults to 0.0.
        rating_count (int, optional): The number of ratings the product has
        received. Defaults to 0.
    """

    title: str
    description: str
    price: float
    seller_id: str
    average_rating: float = 0.0
    rating_count: int = 0

    class Config:
        """
        Configuration class for the request product model."""

        json_schema_extra = {
            "example": {
                "title": "Wireless Mouse",
                "description": "A high-quality wireless mouse with ergonomic design.",
                "price": 29.99,
                "seller_id": 1,
                "average_rating": 0.0,
                "rating_count": 0,
            }
        }


class ProductResponse(BaseModel):
    """
    ProductResponse is a Pydantic model representing the response schema for a product.
    Attributes:
        id (str): The unique identifier of the product.
        title (str): The title of the product.
        description (str): A detailed description of the product.
        price (float): The price of the product.
        seller_id (int): The unique identifier of the seller.
        average_rating (float): The average rating of the product.
        rating_count (int): The number of ratings the product has received.
    """

    id: str
    title: str
    description: str
    price: float
    seller_id: int
    average_rating: float
    rating_count: int

    class Config:
        """
        Configuration class for the response product model."""

        json_schema_extra = {
            "example": {
                "id": "101",
                "title": "Wireless Mouse",
                "description": "A high-quality wireless mouse with ergonomic design.",
                "price": 29.99,
                "seller_id": 1,
                "average_rating": 4.5,
                "rating_count": 100,
            }
        }


class ErrorResponse(BaseModel):
    """ErrorResponse model used to represent error responses in the API.
    Attributes:
    detail (str): A detailed error message.
    Config:
    json_schema_extra (dict): Example configuration for the error response model."""

    detail: str

    class Config:
        """
        Configuration class for the response error model."""

        json_schema_extra = {"example": {"detail": "Product with id 101 not found"}}


# Add a new product
@router.post(
    "/products/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description=(
        "Add a new product to the catalog with details like title, "
        "description, price, and seller ID. The `seller_id` must correspond to an "
        "existing seller."
    ),
    response_description="Details of the created product.",
    responses={
        201: {"model": ProductResponse, "description": "Product created successfully."},
        404: {"model": ErrorResponse, "description": "Seller not found."},
        500: {"description": "Internal server error."},
    },
)
async def add_product(
    product_data: ProductCreateRequest, db: Session = Depends(get_db)
):
    """
    Add a new product.

    - **title**: The title/name of the product.
    - **description**: The description of the product.
    - **price**: The price of the product (float).
    - **seller_id**: The ID of the seller (int).
    - **average_rating**: Average rating of the product (float, default: 0.0).
    - **rating_count**: Number of product ratings (int, default: 0).
    """
    seller = db.query(User).filter(User.id == product_data.seller_id).first()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Seller with id {product_data.seller_id} not found",
        )

    product = create_product(
        db,
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        seller_id=product_data.seller_id,
        average_rating=product_data.average_rating,
        rating_count=product_data.rating_count,
    )

    new_event = build_event(
        product,
        actor={"actor_id": str(seller.id), "username": seller.username},
        system={
            "platform": "marketplace",
            "service": "products",
            "event_type": "created",
        },
    )

    await publish_event("product.created", new_event)

    return {
        "message": "Product created successfully",
        "product": {"id": str(product.id), "title": product.title},
    }


# Get all products
@router.get(
    "/products/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all products",
    description="Fetch a list of all products available in the catalog.",
    response_description="A list of products with their details.",
    responses={
        200: {"model": list[ProductResponse], "description": "List of products."},
        500: {"description": "Internal server error."},
    },
)
def get_products(db: Session = Depends(get_db)):
    """
    Retrieve all products.

    Returns a list of all products with details such as:
    - **id**: Product ID.
    - **title**: Product title.
    - **price**: Product price.
    - **description**: Product description.
    - **seller_id**: Seller ID.
    - **average_rating**: Average rating of the product.
    - **rating_count**: Number of ratings the product has received.
    """
    products = db.query(Product).all()
    if products:
        return {
            "message": "Products found",
            "products": [
                {
                    "id": str(product.id),
                    "title": product.title,
                    "price": product.price,
                    "description": product.description,
                    "seller_id": str(product.seller_id),
                    "average_rating": product.average_rating,
                    "rating_count": product.rating_count,
                }
                for product in products
            ],
        }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No products found",
    )


# Get a product by ID
@router.get(
    "/products/{product_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve a product by ID",
    description="Fetch details of a specific product using its ID.",
    response_description="Details of the requested product.",
    responses={
        200: {"model": ProductResponse, "description": "Product details."},
        404: {"model": ErrorResponse, "description": "Product not found."},
        500: {"description": "Internal server error."},
    },
)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    """
    Retrieve a product by its ID.

    - **product_id**: The ID of the product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )

    return {
        "message": "Product found",
        "product": {
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "description": product.description,
            "seller_id": product.seller_id,
            "average_rating": product.average_rating,
            "rating_count": product.rating_count,
        },
    }


# Update the product rating
@router.post(
    "/products/{product_id}/review/",
    status_code=status.HTTP_200_OK,
    summary="Update product rating",
    description="Update the average rating and rating count of a specific product.",
    response_description="Updated rating details of the product.",
    responses={
        200: {
            "description": "Rating details updated successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Product rating updated successfully",
                        "new_average_rating": 4.8,
                        "rating_count": 101,
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "Product not found."},
        500: {"description": "Internal server error."},
    },
)
async def update_product_rating(
    product_id: str,
    average_rating: float,
    rating_count: int,
    db: Session = Depends(get_db),
):
    """
    Update a product's rating details.

    - **product_id**: The ID of the product.
    - **average_rating**: The new average rating for the product.
    - **rating_count**: The updated count of ratings for the product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )

    product = update_product(db, product, average_rating, rating_count)
    await publish_event("product.updated", f"Product {product_id} rating updated.")
    return {
        "message": "Product rating updated successfully",
        "new_average_rating": product.average_rating,
        "rating_count": product.rating_count,
    }


# Delete a product
@router.delete(
    "/products/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a product",
    description="Delete a specific product by its ID.",
    response_description="Confirmation of successful deletion.",
    responses={
        204: {"description": "Product deleted successfully."},
        404: {"model": ErrorResponse, "description": "Product not found."},
        500: {"description": "Internal server error."},
    },
)
async def delete_product(product_id: str, db: Session = Depends(get_db)):
    """
    Delete a product by its ID.

    - **product_id**: The ID of the product to delete.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )

    db.delete(product)
    db.commit()

    new_event = build_event(
        product,
        actor={"actor_id": "", "username": ""},
        system={
            "platform": "marketplace",
            "service": "products",
            "event_type": "deleted",
        },
    )

    await publish_event("product.deleted", new_event)

    return {"message": "Product deleted successfully"}
