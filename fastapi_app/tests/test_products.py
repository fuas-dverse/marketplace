import json
import secrets
import string

import pytest
import requests

BASE_URL = "http://localhost:5001/api"


@pytest.fixture(scope="module", autouse=True)
def add_user():
    """
    Add a new user at test startup.

    This fixture creates a new user by sending a POST request to the `/users/` endpoint.
    The user's username is randomly generated to ensure uniqueness.

    Returns:
        str: The ID of the newly created user.

    Skips the test if the user cannot be added successfully.
    """
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
    """
    Add a new product.

    This fixture creates a new product by sending a POST request to the `/products/`
    endpoint.
    The product is associated with the user created by the `add_user` fixture.

    Args:
        add_user (str): The ID of the seller (user).

    Returns:
        dict: The JSON response containing the details of the created product.
    """
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

    assert (
        response.status_code == 201
    ), f"Failed to add product: {response.status_code} {response.text}"
    response_json = response.json()
    print(f"Product added successfully with response: {response_json}.")
    return response_json


def test_get_products(add_product):
    """
    Test fetching all products.

    This test creates multiple products using the `add_product` fixture
    and verifies that they can be fetched successfully using the `/products/` endpoint.

    Args:
        add_product (dict): The details of the created product.
    """
    product1 = add_product
    product2 = add_product
    product3 = add_product
    print("Added test products: ", product1, product2, product3)
    print("Fetching all products...")
    response = requests.get(f"{BASE_URL}/products/", timeout=60)
    assert (
        response.status_code == 200
    ), f"Failed to fetch products data: {response.status_code} {response.text}"
    print(f"Products data: {json.dumps(response.json(), indent=4)}")


def test_get_product_by_id(add_product):
    """
    Test fetching a product by its ID.

    This test verifies that a product can be fetched successfully using its ID
    via the `/products/{product_id}` endpoint.

    Args:
        add_product (dict): The details of the created product.
    """
    product_id = add_product["product"]["id"]
    print(f"Fetching product data for id: {product_id}")
    response = requests.get(f"{BASE_URL}/products/{product_id}", timeout=60)
    assert (
        response.status_code == 200
    ), f"Failed to fetch product data: {response.status_code} {response.text}"
    print(f"Product data: {json.dumps(response.json(), indent=4)}")


def test_delete_product(add_product):
    """
    Test deleting a product.

    This test verifies that a product can be deleted successfully using its ID
    via the `/products/{product_id}` endpoint.

    Args:
        add_product (dict): The details of the created product.
    """
    product_id = add_product["product"]["id"]
    print(f"Deleting product data for id: {product_id}")
    response = requests.delete(f"{BASE_URL}/products/{product_id}", timeout=60)
    assert (
        response.status_code == 204
    ), f"Failed to delete product: {response.status_code} {response.text}"
    print("Product deleted successfully")


if __name__ == "__main__":
    print("Starting product API tests...")
    pytest.main(["-v", "-s", __file__])
