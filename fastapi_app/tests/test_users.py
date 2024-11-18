import requests
import json
import pytest
import secrets
import string

BASE_URL = "http://localhost:5001/api"


@pytest.fixture
def add_user():
    """Add a new user."""
    print("Registering a new user...")
    random_suffix = "".join(
        secrets.choices(string.ascii_lowercase + string.digits, k=6)
    )
    username = f"testuser_{random_suffix}"
    register_url = f"{BASE_URL}/users/"
    data = {"username": username}
    response = requests.post(register_url, json=data, timeout=60)

    assert (
        response.status_code == 201
    ), f"Failed to add user: {response.status_code} {response.text}"
    response_json = response.json()
    print(f"User {username} added successfully with response: {response_json}.")
    return response_json


def test_get_user_by_username(add_user):
    """Get user by username."""
    username = add_user["user"]["username"]
    print(f"Fetching user data for username: {username}")
    response = requests.get(f"{BASE_URL}/users/{username}", timeout=60)
    assert (
        response.status_code == 200
    ), f"Failed to fetch user data: {response.status_code} {response.text}"
    print(f"User data: {json.dumps(response.json(), indent=4)}")


def test_delete_user(add_user):
    """Delete user profile."""
    username = add_user["user"]["username"]
    print(f"Deleting user data for username: {username}")
    response = requests.delete(f"{BASE_URL}/users/{username}", timeout=60)
    assert (
        response.status_code == 204
    ), f"Failed to delete user: {response.status_code} {response.text}"
    print("User deleted successfully")


if __name__ == "__main__":
    print("Starting user API tests...")
    pytest.main(["-v", "-s", __file__])
