import requests
import json
import pytest

BASE_URL = "http://localhost:8000/api"


@pytest.fixture
def add_transaction():
    """Add a new transaction."""
    print("Adding a new transaction...")
    buyer_id = 1
    product_id = 1
    status = "complete"
    transaction_url = f"{BASE_URL}/transactions/"
    data = {
        "buyer_id": buyer_id,
        "product_id": product_id,
        "status": status,
    }
    response = requests.post(transaction_url, json=data)

    if response.status_code == 201:
        response_json = response.json()
        print(f"Transaction added successfully with response: {response_json}.")
        return response_json
    else:
        print(f"Failed to add transaction: {response.status_code} {response.text}")
        pytest.skip("Skipping test as transaction could not be added.")


def test_get_user_transactions():
    """Get transactions by user ID."""
    user_id = 1
    print(f"Fetching transactions for user ID: {user_id}")
    response = requests.get(f"{BASE_URL}/transactions/{user_id}")
    assert (
        response.status_code == 200
    ), f"Failed to fetch transactions for user: {response.status_code} {response.text}"
    transactions = json.dumps(response.json(), indent=4)
    print(f"Transactions for user ID {user_id}: {transactions}")


if __name__ == "__main__":
    print("Starting transaction API tests...")
    pytest.main(["-v", "-s", __file__])
