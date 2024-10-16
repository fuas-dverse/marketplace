from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_transaction,
)
from models import Transaction
from pydantic import BaseModel

app = FastAPI()


class TransactionCreateRequest(BaseModel):
    buyer_id: int
    product_id: int
    status: str


# Add a new transaction
@app.post("/transactions/")
def add_transaction(
    transaction_data: TransactionCreateRequest, db: Session = Depends(get_db)
):
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
@app.get("/transactions/")
def get_all_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).all()  # Fetch all transactions
    return transactions


# Get transactions by user ID
@app.get("/transactions/{user_id}")
def get_user_transactions(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.buyer_id == user_id).all()
    return transactions
