import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test credentials
USERNAME = "testuser"


def add_user():
    """Add a new user."""
    print("Registering a new user...")
    register_url = f"{BASE_URL}/users/"
    data = {"username": USERNAME}
    response = requests.post(register_url, json=data)

    if response.headers.get("Content-Type") == "application/json":
        try:
            response_json = response.json()
            if response.status_code == 201:
                print(
                    f"User {USERNAME} added successfully with response: "
                    f"{response_json}."
                )
                return response_json
            else:
                print(f"Failed to add user: {response.status_code} {response.text}")
        except ValueError:
            print("Failed to parse JSON response")
    else:
        print(f"Unexpected content type: {response.headers.get('Content-Type')}")

    return None


def get_user_by_username(username):
    """Get user by username."""
    print(f"Fetching user data for username: {username}")
    response = requests.get(f"{BASE_URL}/users/{username}")
    if response.status_code == 200:
        print(f"User data: {json.dumps(response.json(), indent=4)}")
    else:
        print(f"Failed to fetch user data: {response.status_code} " f"{response.text}")
    return response


def delete_user(username):
    """Delete user profile."""
    print(f"Deleting user data for username: {username}")
    response = requests.delete(f"{BASE_URL}/users/{username}")

    if response.status_code == 204:
        print("User deleted successfully")
    else:
        print(f"Failed to delete user: {response.status_code} " f"{response.text}")

    return response


if __name__ == "__main__":
    print("Starting test script...")

    # Step 1: Add the user
    add_user_response = add_user()

    if add_user_response:
        # Step 2: Get the user by username
        get_user_by_username(username=USERNAME)

        # Step 3: Delete the user
        delete_user(username=USERNAME)
    else:
        print("Unable to continue tests as adding user failed.")
