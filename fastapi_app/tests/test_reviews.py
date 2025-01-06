"""
This module contains tests for the review functionality of the marketplace application.

Fixtures:
    add_user: Adds a new user at the start of the test module.
    add_product: Adds a new product at the start of each test.
    add_review: Adds a new review for a product.

Tests:
    test_get_reviews_per_product: Tests fetching reviews for a specific product
    by product ID.
"""

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
    print(f"Failed to add user: {response.status_code} {response.text}")
    pytest.skip("Skipping test as user could not be added.")
    return None


@pytest.fixture
def add_product(add_user):
    """Add a new product at test startup."""
    print("Adding a new product...")
    product_url = f"{BASE_URL}/products/"
    seller_id = add_user
    data = {
        "title": "Test Product",
        "description": "test description",
        "price": 10,
        "seller_id": seller_id,
        "average_rating": 0.0,
        "rating_count": 0,
    }
    response = requests.post(product_url, json=data, timeout=60)

    if response.status_code == 201:
        response_json = response.json()
        print(f"Product added successfully with response: {response_json}.")
        return response_json["product"]["id"]
    print(f"Failed to add product: {response.status_code} {response.text}")
    pytest.skip("Skipping test as product could not be added.")
    return None


@pytest.fixture
def add_review(add_user, add_product):
    """Add a new review."""
    print("Adding a new review...")
    user_id = add_user
    print(f"User ID: {user_id}")
    product_id = add_product
    print(f"Product ID: {product_id}")
    rating = secrets.randbelow(5) + 1
    content = "This is a test review."
    review_url = f"{BASE_URL}/reviews/"
    data = {
        "user_id": user_id,
        "product_id": product_id,
        "rating": rating,
        "content": content,
    }
    response = requests.post(review_url, json=data, timeout=60)

    assert (
        response.status_code == 201
    ), f"Failed to add review: {response.status_code} {response.text}"
    response_json = response.json()
    print(f"Review added successfully with response: {response_json}.")
    return response_json


def test_get_reviews_per_product(add_review):
    """Get reviews by product ID."""
    product_id = add_review["review"]["product_id"]
    print(f"Fetching reviews for product ID: {product_id}")
    response = requests.get(f"{BASE_URL}/reviews/{product_id}", timeout=60)
    assert (
        response.status_code == 200
    ), f"Failed to fetch reviews for product: {response.status_code} {response.text}"
    reviews_json = json.dumps(response.json(), indent=4)
    print(f"Reviews for product ID {product_id}: {reviews_json}")


if __name__ == "__main__":
    print("Starting review API tests...")
    pytest.main(["-v", "-s", __file__])
