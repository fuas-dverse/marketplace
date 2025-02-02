"""
This module defines the API endpoints for managing transactions in the marketplace
application using FastAPI.
It includes endpoints for creating a new transaction, retrieving all transactions,
and retrieving transactions for a specific user.

Endpoints:
- POST /transactions/: Create a new transaction.
- GET /transactions/: Retrieve all transactions.
- GET /transactions/{user_id}: Retrieve transactions for a specific user.

Dependencies:
- FastAPI for API routing and request handling.
- SQLAlchemy for database interactions.
- Pydantic for data validation and serialization.
- dverse_nats_helper for event building and publishing.

Models:
- TransactionCreateRequest: Schema for creating a new transaction.
- TransactionResponse: Schema for the response of a transaction.
- ErrorResponse: Schema for error responses.

Functions:
- add_transaction: Endpoint to add a new transaction.
- get_all_transactions: Endpoint to retrieve all transactions.
- get_user_transactions: Endpoint to retrieve transactions for a specific user.
"""

from dverse_nats_helper.event_builder import build_event
from dverse_nats_helper.nats_connection import publish_event
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import create_transaction, get_db
from app.models import Product, Transaction, User

router = APIRouter()


class TransactionCreateRequest(BaseModel):
    """
    Represents a request to create a new transaction.

    Attributes:
        buyer_id (str): The ID of the buyer initiating the transaction.
        product_id (str): The ID of the product being purchased.
        status (str): The current status of the transaction (e.g., Pending, Completed).
        amount (float): The total amount of the transaction.
    """

    buyer_id: str
    product_id: str
    status: str
    amount: float

    class Config:
        """
        Configuration for the schema example.
        """

        json_schema_extra = {
            "example": {
                "buyer_id": 1,
                "product_id": 101,
                "status": "Pending",
                "amount": 100.0,
            }
        }


class TransactionResponse(BaseModel):
    """
    Represents the response of a transaction, including its unique identifier
    and status.

    Attributes:
        id (int): The unique identifier of the transaction.
        status (str): The current status of the transaction (e.g., Pending, Completed).
    """

    id: int
    status: str

    class Config:
        """
        Configuration for the schema example.
        """

        json_schema_extra = {
            "example": {
                "id": 1,
                "status": "Pending",
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

        json_schema_extra = {"example": {"detail": "Buyer (user) with id 1 not found"}}


# Add a new transaction
@router.post(
    "/transactions/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new transaction",
    description=(
        "Record a new transaction involving a buyer and a product. "
        "The transaction status must be specified."
    ),
    response_description="Details of the created transaction.",
    responses={
        201: {
            "model": TransactionResponse,
            "description": "Transaction created successfully.",
        },
        404: {"model": ErrorResponse, "description": "Buyer or product not found."},
        500: {"description": "Internal server error."},
    },
)
async def add_transaction(
    transaction_data: TransactionCreateRequest, db: Session = Depends(get_db)
):
    """
    Add a new transaction.

    - **buyer_id**: ID of the user who is buying the product.
    - **product_id**: ID of the product being purchased.
    - **status**: Status of the transaction (e.g., 'Pending', 'Completed', etc.).
    - **amount**: Amount of the transaction.
    """
    # Check if buyer (user) exists
    buyer = db.query(User).filter(User.id == transaction_data.buyer_id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Buyer (user) with id {transaction_data.buyer_id} not found",
        )

    # Check if product exists
    product = (
        db.query(Product).filter(Product.id == transaction_data.product_id).first()
    )
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with id {transaction_data.product_id} not found",
        )

    # Create the transaction
    transaction = create_transaction(
        db,
        buyer_id=transaction_data.buyer_id,
        product_id=transaction_data.product_id,
        status=transaction_data.status,
        amount=transaction_data.amount,
    )

    new_event = build_event(
        transaction,
        actor={"actor_id": str(buyer.id), "username": buyer.username},
        system={
            "platform": "marketplace",
            "service": "transactions",
            "event_type": "started",
        },
    )

    await publish_event("transaction.created", new_event)

    return {
        "message": "Transaction created successfully",
        "transaction": {"id": str(transaction.id), "status": transaction.status},
    }


# Get all transactions
@router.get(
    "/transactions/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all transactions",
    description=(
        "Fetch a list of all recorded transactions, including details like buyer, "
        "product, amount and status."
    ),
    response_description="A list of transactions with details.",
    responses={
        200: {
            "description": "List of transactions retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Transactions found",
                        "transactions": [
                            {
                                "id": 1,
                                "status": "Pending",
                                "buyer_id": 1,
                                "product_id": 101,
                                "amount": 100.0,
                            }
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "No transactions found."},
        500: {"description": "Internal server error."},
    },
)
def get_all_transactions(db: Session = Depends(get_db)):
    """
    Retrieve all transactions.

    Returns a list of transactions with details such as:
    - **id**: Transaction ID.
    - **status**: Transaction status (e.g., 'Pending', 'Completed').
    - **buyer_id**: ID of the buyer.
    - **product_id**: ID of the product involved in the transaction.
    - **amount**: Transaction amount.
    """
    transactions = db.query(Transaction).all()

    if transactions:
        return {
            "message": "Transactions found",
            "transactions": [
                {
                    "id": str(transaction.id),
                    "status": transaction.status,
                    "buyer_id": str(transaction.buyer_id),
                    "product_id": str(transaction.product_id),
                    "amount": transaction.amount,
                }
                for transaction in transactions
            ],
        }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No transactions found",
    )


# Get transactions by user ID
@router.get(
    "/transactions/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve transactions for a specific user",
    description=(
        "Fetch all transactions associated with a given user ID, "
        "including the products involved."
    ),
    response_description="A list of transactions for the specified user.",
    responses={
        200: {
            "description": "List of transactions for the user retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Transactions found",
                        "transactions": [
                            {
                                "id": 1,
                                "status": "Pending",
                                "buyer_id": 1,
                                "product_id": 101,
                                "amount": 100.0,
                            }
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "User or transactions not found."},
        500: {"description": "Internal server error."},
    },
)
def get_user_transactions(user_id: int, db: Session = Depends(get_db)):
    """
    Retrieve all transactions for a specific user.

    - **user_id**: ID of the user for whom transactions are requested.
    """
    # Check if buyer exists
    buyer = db.query(User).filter(User.id == user_id).first()
    if not buyer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id {user_id} not found",
        )

    transactions = db.query(Transaction).filter(Transaction.buyer_id == user_id).all()
    if transactions:
        return {
            "message": "Transactions found",
            "transactions": [
                {
                    "id": str(transaction.id),
                    "status": transaction.status,
                    "buyer_id": str(transaction.buyer_id),
                    "product_id": str(transaction.product_id),
                    "amount": transaction.amount,
                }
                for transaction in transactions
            ],
        }

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"No transactions found for user with id {user_id}",
    )
