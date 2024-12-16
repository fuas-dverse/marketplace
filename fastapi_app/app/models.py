import uuid
from sqlalchemy import Column, String, Float, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# Base class for creating models
Base = declarative_base()


# User model
class User(Base):
    """
    Represents a user in the marketplace.

    Attributes:
        id (UUID): Unique identifier for the user.
        username (str): Unique username for the user, used for login and identification.
        reputation_score (int): A score indicating the user's reputation,
        based on their transactions and reviews.
        transactions (list[Transaction]): List of transactions where the user
        is the buyer.
        products (list[Product]): List of products listed by the user as the seller.
        reviews (list[Review]): List of reviews written by the user on various products.
    """

    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    username = Column(String, unique=True, index=True)
    reputation_score = Column(Integer)

    # Relationships
    transactions = relationship("Transaction", back_populates="buyer")
    products = relationship("Product", back_populates="seller")
    reviews = relationship("Review", back_populates="buyer")


# Product model
class Product(Base):
    """
    Represents a product in the marketplace.

    Attributes:
        id (UUID): Unique identifier for the product.
        title (str): Name of the product.
        description (str): Description of the product.
        price (float): Price of the product.
        seller_id (UUID): Foreign key linking to the user who listed the product.
        average_rating (float): The average rating for the product,
        calculated from all reviews.
        rating_count (int): The number of reviews for this product.
        seller (User): The user who listed the product.
        transactions (list[Transaction]): List of transactions associated
        with this product.
        reviews (list[Review]): List of reviews associated with this product.
    """

    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    average_rating = Column(Float)
    rating_count = Column(Integer)

    # Relationships
    seller = relationship("User", back_populates="products")
    transactions = relationship("Transaction", back_populates="product")
    reviews = relationship("Review", back_populates="product")


# Transaction model
class Transaction(Base):
    """
    Represents a transaction in the marketplace.

    Attributes:
        id (UUID): Unique identifier for the transaction.
        buyer_id (UUID): Foreign key linking to the user who purchased the product.
        product_id (UUID): Foreign key linking to the purchased product.
        status (str): Status of the transaction (e.g., "complete", "pending").
        buyer (User): The user who made the purchase.
        product (Product): The product involved in the transaction.
        amount (float): The amount paid for the product.
    """

    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    status = Column(String)
    amount = Column(Float)

    # Relationships
    buyer = relationship("User", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")


# Review model
class Review(Base):
    """
    Represents a review for a product in the marketplace.

    Attributes:
        id (UUID): Unique identifier for the review.
        user_id (UUID): Foreign key linking to the user who wrote the review.
        product_id (UUID): Foreign key linking to the reviewed product.
        rating (int): Rating given by the user, generally from 1 to 5.
        content (str): Text content of the review.
        buyer (User): The user who wrote the review.
        product (Product): The product being reviewed.
    """

    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"))
    rating = Column(Integer)
    content = Column(String)

    # Relationships
    buyer = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
