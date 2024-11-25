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
    seller_id: str
    average_rating: float = 0.0
    rating_count: int = 0


# Add a new product
@router.post("/products/", status_code=status.HTTP_201_CREATED)
def add_product(product_data: ProductCreateRequest, db: Session = Depends(get_db)):
    # Check if seller exists
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
        "product": {"id": str(product.id), "title": product.title},
    }


# Get all products
@router.get("/products/", status_code=status.HTTP_200_OK)
def get_products(db: Session = Depends(get_db)):
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
@router.get("/products/{product_id}", status_code=status.HTTP_200_OK)
def get_product_by_id(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if product:
        return {
            "message": "Product found",
            "product": {
                "id": str(product.id),
                "title": product.title,
                "price": product.price,
                "seller_id": str(product.seller_id),
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
@router.post("/products/{product_id}/review/", status_code=status.HTTP_200_OK)
def update_product_rating(
    product_id: str,
    average_rating: float,
    rating_count: int,
    db: Session = Depends(get_db),
):
    product = db.query(Product).filter(Product.id == product_id).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )

    product = update_product(db, product, average_rating, rating_count)

    return {
        "message": "Review added successfully",
        "new_average_rating": product.average_rating,
        "rating_count": product.rating_count,
    }


# Delete a product
@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {product_id} not found",
        )

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
