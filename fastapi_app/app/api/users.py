from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import create_user, get_db
from app.models import User

router = APIRouter()


class UserCreateRequest(BaseModel):
    username: str

    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
            }
        }


class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "username": "johndoe",
            }
        }


class ErrorResponse(BaseModel):
    detail: str

    class Config:
        json_schema_extra = {
            "example": {"detail": "Username already exists"},
        }


# Add a new user
@router.post(
    "/users/",
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user",
    description="Add a new user to the system. The username must be unique.",
    response_description="Details of the created user.",
    responses={
        201: {"model": UserResponse, "description": "User created successfully."},
        409: {"model": ErrorResponse, "description": "Username already exists."},
        500: {"description": "Internal server error."},
    },
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
        "user": {"id": str(user.id), "username": user.username},
    }


# Get all users
@router.get(
    "/users/",
    status_code=status.HTTP_200_OK,
    summary="Retrieve all users",
    description="Fetch a list of all registered users in the system.",
    response_description="A list of users with their details.",
    responses={
        200: {
            "description": "List of users retrieved successfully.",
            "content": {
                "application/json": {
                    "example": {
                        "message": "Users found",
                        "users": [
                            {
                                "id": 1,
                                "username": "johndoe",
                            },
                            {
                                "id": 2,
                                "username": "janedoe",
                            },
                        ],
                    }
                }
            },
        },
        404: {"model": ErrorResponse, "description": "No users found."},
        500: {"description": "Internal server error."},
    },
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
                    "id": str(user.id),
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
    responses={
        200: {
            "model": UserResponse,
            "description": "User details retrieved successfully.",
        },
        404: {"model": ErrorResponse, "description": "User not found."},
        500: {"description": "Internal server error."},
    },
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
        "user": {"id": str(user.id), "username": user.username},
    }


# Delete a user
@router.delete(
    "/users/{username}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a user",
    description="Delete a user from the system by their username.",
    response_description="Confirmation of user deletion.",
    responses={
        204: {"description": "User deleted successfully."},
        404: {"model": ErrorResponse, "description": "User not found."},
        500: {"description": "Internal server error."},
    },
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


@router.put(
    "/users/{username}",
    status_code=status.HTTP_200_OK,
    summary="Update user data",
    description="Allow a user to update their personal information.",
    response_description="Updated user details.",
    responses={
        200: {"model": UserResponse, "description": "User updated successfully."},
        404: {"model": ErrorResponse, "description": "User not found."},
        500: {"description": "Internal server error."},
    },
)
def update_user(
    username: str, user_data: UserCreateRequest, db: Session = Depends(get_db)
):
    """
    Update a user's personal data.

    - **username**: The current username of the user.
    - **user_data**: New data to update the user with.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    user.username = user_data.username
    db.commit()
    db.refresh(user)
    return {
        "message": "User updated successfully",
        "user": {"id": str(user.id), "username": user.username},
    }
