from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_product,
    update_product,
)
from models import Product
from pydantic import BaseModel

app = FastAPI()


class ProductCreateRequest(BaseModel):
    title: str
    description: str
    price: float
    seller_id: int
    average_rating: float
    rating_count: int


# Add a new product
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


# Get all products
@app.get("/products/")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
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


# Get a product by ID
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


# Update the product rating
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
