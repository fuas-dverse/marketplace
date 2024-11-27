from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_product, update_product
from app.models import Product, User
from pydantic import BaseModel
import asyncio
from nats.aio.client import Client as NATS

router = APIRouter()
nc = NATS()
loop = asyncio.get_event_loop()


# Connect to NATS
async def connect_nats():
    await nc.connect(servers=["nats://localhost:4222"], loop=loop)


loop.run_until_complete(connect_nats())


# Helper function to publish NATS event
async def publish_event(subject, data):
    await nc.publish(subject, data.encode())


class ProductCreateRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_id: str
    average_rating: float = 0.0
    rating_count: int = 0

    class Config:
        schema_extra = {
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
    id: int
    title: str
    description: str
    price: float
    seller_id: int
    average_rating: float
    rating_count: int

    class Config:
        schema_extra = {
            "example": {
                "id": 101,
                "title": "Wireless Mouse",
                "description": "A high-quality wireless mouse with ergonomic design.",
                "price": 29.99,
                "seller_id": 1,
                "average_rating": 4.5,
                "rating_count": 100,
            }
        }


class ErrorResponse(BaseModel):
    detail: str

    class Config:
        schema_extra = {"example": {"detail": "Product with id 101 not found"}}


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
def add_product(product_data: ProductCreateRequest, db: Session = Depends(get_db)):
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

    loop.run_until_complete(
        publish_event("product.created", f"Product {product.id} created.")
    )

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
    else:
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
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
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
def update_product_rating(
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
    loop.run_until_complete(
        publish_event("product.updated", f"Product {product_id} rating updated.")
    )
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
def delete_product(product_id: int, db: Session = Depends(get_db)):
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
    loop.run_until_complete(
        publish_event("product.deleted", f"Product {product_id} deleted.")
    )
    return {"message": "Product deleted successfully"}
