import requests
import json
import pytest

BASE_URL = "http://localhost:8000/api"


@pytest.fixture
def add_product():
    """Add a new product."""
    print("Adding a new product...")
    product_url = f"{BASE_URL}/products/"
    data = {
        "title": "Test Product",
        "description": "test description",
        "price": 10,
        "seller_id": "1",
        "average_rating": 0.0,
        "rating_count": 0,
    }
    response = requests.post(product_url, json=data)

    assert (
        response.status_code == 201
    ), f"Failed to add product: {response.status_code} {response.text}"
    response_json = response.json()
    print(f"Product added successfully with response: {response_json}.")
    return response_json


def test_get_products():
    """Get all products."""
    print("Fetching all products...")
    response = requests.get(f"{BASE_URL}/products/")
    assert (
        response.status_code == 200
    ), f"Failed to fetch products data: {response.status_code} {response.text}"
    print(f"Products data: {json.dumps(response.json(), indent=4)}")


def test_get_product_by_id(add_product):
    """Get product by id."""
    product_id = add_product["product"]["id"]
    print(f"Fetching product data for id: {product_id}")
    response = requests.get(f"{BASE_URL}/products/{product_id}")
    assert (
        response.status_code == 200
    ), f"Failed to fetch product data: {response.status_code} {response.text}"
    print(f"Product data: {json.dumps(response.json(), indent=4)}")


def test_delete_product(add_product):
    """Delete product."""
    product_id = add_product["product"]["id"]
    print(f"Deleting product data for id: {product_id}")
    response = requests.delete(f"{BASE_URL}/products/{product_id}")
    assert (
        response.status_code == 204
    ), f"Failed to delete product: {response.status_code} {response.text}"
    print("Product deleted successfully")


if __name__ == "__main__":
    print("Starting product API tests...")
    pytest.main(["-v", "-s", __file__])
