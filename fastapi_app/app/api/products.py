from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_product, update_product
from app.models import Product, User
from pydantic import BaseModel

router = APIRouter()


class ProductCreateRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_id: int
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


# Add a new product
@router.post(
    "/products/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description=(
        "Add a new product to the catalog with details like title, "
        "description, price, and seller ID."
    ),
    response_description="Details of the created product.",
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

    return {
        "message": "Product created successfully",
        "product": {"id": product.id, "title": product.title},
    }


# Get all products
@router.get(
    "/products/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all products",
    description="Fetch a list of all products available in the catalog.",
    response_description="A list of products with their details.",
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
                    "id": product.id,
                    "title": product.title,
                    "price": product.price,
                    "description": product.description,
                    "seller_id": product.seller_id,
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
)
def get_product_by_id(product_id: int, db: Session = Depends(get_db)):
    """
    Retrieve a product by its ID.

    - **product_id**: The ID of the product.
    """
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
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
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )


# Update the product rating
@router.post(
    "/products/{product_id}/review/",
    status_code=status.HTTP_200_OK,
    summary="Update product rating",
    description="Update the average rating and rating count of a specific product.",
    response_description="Updated rating details of the product.",
)
def update_product_rating(
    product_id: int,
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
    return {"message": "Product deleted successfully"}
