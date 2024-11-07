from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_user
from app.models import User
from pydantic import BaseModel

router = APIRouter()


class UserCreateRequest(BaseModel):
    username: str


# Add a new user
@router.post("/users/", status_code=status.HTTP_201_CREATED)
def add_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    # Check if the user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already exists",
        )

    user = create_user(db, username=user_data.username)
    return {
        "message": "User created successfully",
        "user": {"id": user.id, "username": user.username},
    }


# Get all users
@router.get("/users/", status_code=status.HTTP_200_OK)
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return users


# Get user by username
@router.get("/users/{username}", status_code=status.HTTP_200_OK)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return {
        "message": "User found",
        "user": {"id": user.id, "username": user.username},
    }


@router.delete("/users/{username}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(username: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
