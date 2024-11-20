from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_transaction
from app.models import Transaction, User, Product
from pydantic import BaseModel

router = APIRouter()


class TransactionCreateRequest(BaseModel):
    buyer_id: int
    product_id: int
    status: str

    class Config:
        schema_extra = {
            "example": {
                "buyer_id": 1,
                "product_id": 101,
                "status": "Pending",
            }
        }


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
)
def add_transaction(
    transaction_data: TransactionCreateRequest, db: Session = Depends(get_db)
):
    """
    Add a new transaction.

    - **buyer_id**: ID of the user who is buying the product.
    - **product_id**: ID of the product being purchased.
    - **status**: Status of the transaction (e.g., 'Pending', 'Completed', etc.).
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
    )

    return {
        "message": "Transaction created successfully",
        "transaction": {"id": transaction.id, "status": transaction.status},
    }


# Get all transactions
@router.get(
    "/transactions/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all transactions",
    description=(
        "Fetch a list of all recorded transactions, including details like buyer, "
        "product, and status."
    ),
    response_description="A list of transactions with details.",
)
def get_all_transactions(db: Session = Depends(get_db)):
    """
    Retrieve all transactions.

    Returns a list of transactions with details such as:
    - **id**: Transaction ID.
    - **status**: Transaction status (e.g., 'Pending', 'Completed').
    - **buyer_id**: ID of the buyer.
    - **product_id**: ID of the product involved in the transaction.
    """
    transactions = db.query(Transaction).all()

    if transactions:
        return {
            "message": "Transactions found",
            "transactions": [
                {
                    "id": transaction.id,
                    "status": transaction.status,
                    "buyer_id": transaction.buyer_id,
                    "product_id": transaction.product_id,
                }
                for transaction in transactions
            ],
        }
    else:
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
                    "id": transaction.id,
                    "status": transaction.status,
                    "buyer_id": transaction.buyer_id,
                    "product_id": transaction.product_id,
                }
                for transaction in transactions
            ],
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No transactions found for user with id {user_id}",
        )
