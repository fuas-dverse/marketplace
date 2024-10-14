from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

# Base class for creating models
Base = declarative_base()


# User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    reputation_score = Column(Integer)

    # Relationships
    transactions = relationship("Transaction", back_populates="buyer")
    products = relationship("Product", back_populates="seller")
    reviews = relationship("Review", back_populates="buyer")


# Product model
class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    seller_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    seller = relationship("User", back_populates="products")
    transactions = relationship("Transaction", back_populates="product")
    reviews = relationship("Review", back_populates="product")


# Transaction model
class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    status = Column(String)

    # Relationships
    buyer = relationship("User", back_populates="transactions")
    product = relationship("Product", back_populates="transactions")


# Review model
class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    rating = Column(Integer)
    content = Column(String)

    # Relationships
    buyer = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")
