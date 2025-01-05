import json
import secrets
import string

import pytest
import requests

BASE_URL = "http://localhost:5001/api"


@pytest.fixture(scope="module", autouse=True)
def add_user():
    """Add a new user at test startup."""
    print("Adding a new user...")
    user_url = f"{BASE_URL}/users/"
    random_suffix = "".join(
        secrets.choice(string.ascii_letters + string.digits) for i in range(6)
    )
    username = f"testuser_{random_suffix}"
    data = {"username": username}
    response = requests.post(user_url, json=data, timeout=60)

    if response.status_code == 201:
        response_json = response.json()
        print(f"User added successfully with response: {response_json}.")
        return response_json["user"]["id"]
    else:
        print(f"Failed to add user: {response.status_code} {response.text}")
        pytest.skip("Skipping test as user could not be added.")


@pytest.fixture
def add_transaction(add_user):
    """Add a new transaction."""
    print("Adding a new transaction...")
    buyer_id = add_user
    product_id = 1
    status = "pending"
    transaction_url = f"{BASE_URL}/transactions/"
    data = {
        "buyer_id": buyer_id,
        "product_id": product_id,
        "status": status,
        "amount": 100.0,
    }
    response = requests.post(transaction_url, json=data, timeout=60)

    if response.status_code == 201:
        response_json = response.json()
        print(f"Transaction added successfully with response: {response_json}.")
        return {"response": response_json, "buyer_id": buyer_id}
    else:
        print(f"Failed to add transaction: {response.status_code} {response.text}")
        pytest.skip("Skipping test as transaction could not be added.")


def test_get_user_transactions(add_transaction):
    """Get transactions by user ID."""
    buyer_id = add_transaction.get("buyer_id")
    if buyer_id is None:
        pytest.skip("No valid buyer ID available for testing.")
    print(f"Fetching transactions for user ID: {buyer_id}")
    response = requests.get(f"{BASE_URL}/transactions/{buyer_id}", timeout=60)
    assert (
        response.status_code == 200
    ), f"Failed to fetch transactions for user: {response.status_code} {response.text}"
    transactions = json.dumps(response.json(), indent=4)
    print(f"Transactions for user ID {buyer_id}: {transactions}")


if __name__ == "__main__":
    print("Starting transaction API tests...")
    pytest.main(["-v", "-s", __file__])
