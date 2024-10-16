from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import config
from fastapi_app.app.models import Base, User, Product, Transaction, Review

# Create the PostgreSQL connection string
DATABASE_URL = (
    f"postgresql://{config.POSTGRES_USER}:{config.POSTGRES_PASSWORD}"
    f"@{config.POSTGRES_HOST}:{config.POSTGRES_PORT}/{config.POSTGRES_DB}"
)

# Set up the SQLAlchemy engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database schema (tables)
Base.metadata.create_all(bind=engine)


# Dependency to create and close database sessions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Add a new user
def create_user(db, username: str):
    new_user = User(username=username, reputation_score=0)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# Add a new product
def create_product(
    db,
    title: str,
    description: str,
    price: float,
    seller_id: int,
    average_rating: float = 0.0,
    rating_count: int = 0,
):
    new_product = Product(
        title=title,
        description=description,
        price=price,
        seller_id=seller_id,
        average_rating=average_rating,
        rating_count=rating_count,
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


def update_product(db, product: Product, average_rating: float, rating_count: int):
    if product is None:
        return None

    product.average_rating = average_rating
    product.rating_count = rating_count

    db.commit()
    db.refresh(product)
    return product


# Add a new transaction
def create_transaction(db, buyer_id: int, product_id: int, status: str):
    new_transaction = Transaction(
        buyer_id=buyer_id, product_id=product_id, status=status
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


# Add a new review
def create_review(db, user_id: int, product_id: int, rating: int, content: str):
    new_review = Review(
        user_id=user_id, product_id=product_id, rating=rating, content=content
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review
