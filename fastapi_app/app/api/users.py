from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db, create_user
from app.models import User
from pydantic import BaseModel

router = APIRouter()


class UserCreateRequest(BaseModel):
    username: str

    class Config:
        schema_extra = {
            "example": {
                "username": "johndoe",
            }
        }


# Add a new user
@router.post(
    "/users/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Add a new user to the system. The username must be unique.",
    response_description="Details of the created user.",
)
def add_user(user_data: UserCreateRequest, db: Session = Depends(get_db)):
    """
    Create a new user.

    - **username**: The unique username for the new user.
    """
    # Check if the user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already exists",
        )

    user = create_user(db, username=user_data.username)
    return {
        "message": "User created successfully",
        "user": {"id": user.id, "username": user.username},
    }


# Get all users
@router.get(
    "/users/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all users",
    description="Fetch a list of all registered users in the system.",
    response_description="A list of users with their details.",
)
def get_users(db: Session = Depends(get_db)):
    """
    Retrieve all users.

    Returns a list of all registered users with details:
    - **id**: User ID.
    - **username**: Username of the user.
    """
    users = db.query(User).all()
    if users:
        return {
            "message": "Users found",
            "users": [
                {
                    "id": user.id,
                    "username": user.username,
                }
                for user in users
            ],
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No users found",
        )


# Get user by username
@router.get(
    "/users/{username}",
    status_code=status.HTTP_200_OK,
    summary="Retrieve a user by username",
    description="Fetch the details of a user by their username.",
    response_description="Details of the requested user.",
)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    """
    Retrieve a user by username.

    - **username**: The username of the user to retrieve.
    """
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


# Delete a user
@router.delete(
    "/users/{username}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user",
    description="Delete a user from the system by their username.",
    response_description="Confirmation of user deletion.",
)
def delete_user(username: str, db: Session = Depends(get_db)):
    """
    Delete a user by username.

    - **username**: The username of the user to delete.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}
