import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config import Config
from app.models import Product, Review, Transaction, User

# Set up the SQLAlchemy engine and session
engine = create_engine(Config.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency to create and close database sessions."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_user(db, username: str):
    """
    Create a new user in the database."""
    new_user = User(id=uuid.uuid4(), username=username, reputation_score=0)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def create_product(
    db,
    title: str,
    description: str,
    price: float,
    seller_id: str,
    average_rating: float = 0.0,
    rating_count: int = 0,
):
    """
    Create a new product in the database."""
    new_product = Product(
        id=uuid.uuid4(),
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
    """
    Update product average rating and rating count in the database."""

    if product is None:
        return None

    product.average_rating = average_rating
    product.rating_count = rating_count

    db.commit()
    db.refresh(product)
    return product


def create_transaction(db, buyer_id: str, product_id: str, status: str, amount: float):
    """
    Create a new transaction in the database."""

    new_transaction = Transaction(
        id=uuid.uuid4(),
        buyer_id=buyer_id,
        product_id=product_id,
        status=status,
        amount=amount,
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return new_transaction


def create_review(db, user_id: str, product_id: str, rating: int, content: str):
    """
    Create a new review in the database."""

    new_review = Review(
        id=uuid.uuid4(),
        user_id=user_id,
        product_id=product_id,
        rating=rating,
        content=content,
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


def insert_user_if_empty(db):
    """
    Create a new admin user in the database if the table is empty."""

    user_count = db.query(User).count()

    if user_count == 0:
        new_user = User(id=uuid.uuid4(), username="admin", reputation_score=0)

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("Inserted new user:", new_user.username)
    else:
        print("User table is not empty.")
