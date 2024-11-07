import requests
import json
import pytest
import random

BASE_URL = "http://localhost:8000/api"


@pytest.fixture
def add_review():
    """Add a new review."""
    print("Adding a new review...")
    user_id = 1
    product_id = 1
    rating = random.randint(1, 5)
    content = "This is a test review."
    review_url = f"{BASE_URL}/reviews/"
    data = {
        "user_id": user_id,
        "product_id": product_id,
        "rating": rating,
        "content": content,
    }
    response = requests.post(review_url, json=data)

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
    response = requests.get(f"{BASE_URL}/reviews/{product_id}")
    assert (
        response.status_code == 200
    ), f"Failed to fetch reviews for product: {response.status_code} {response.text}"
    reviews_json = json.dumps(response.json(), indent=4)
    print(f"Reviews for product ID {product_id}: {reviews_json}")


if __name__ == "__main__":
    print("Starting review API tests...")
    pytest.main(["-v", "-s", __file__])
