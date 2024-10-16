from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import (
    get_db,
    create_user,
)
from models import User
from pydantic import BaseModel

router = APIRouter()


class UserCreateRequest(BaseModel):
    username: str


# Add a new user
@router.post("/users/")
def add_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    user = create_user(db, username=user_data.username)
    return {
        "message": "User created successfully",
        "user": {"id": user.id, "username": user.username},
    }


# Get all users
@router.get("/users/")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


# Get user by username
@router.get("/users/{username}")
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if user:
        return {
            "message": "User found",
            "user": {"id": user.id, "username": user.username},
        }
    else:
        return {"message": "User not found"}, 404
