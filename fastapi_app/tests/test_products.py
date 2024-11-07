import requests
import json

BASE_URL = "http://localhost:8000/api"


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

    if response.headers.get("Content-Type") == "application/json":
        try:
            response_json = response.json()
            if response.status_code == 201:
                print(f"Product added successfully with response: " f"{response_json}.")
                return response_json
            else:
                print(f"Failed to add product: {response.status_code} {response.text}")
        except ValueError:
            print("Failed to parse JSON response")
    else:
        print(f"Unexpected content type: {response.headers.get('Content-Type')}")

    return None


def get_products():
    """Get all products."""
    print("Fetching all products...")
    response = requests.get(f"{BASE_URL}/products/")
    if response.status_code == 200:
        print(f"Products data: {json.dumps(response.json(), indent=4)}")
    else:
        print(
            f"Failed to fetch products data: {response.status_code} " f"{response.text}"
        )
    return response


def get_product_by_id(product_id):
    """Get product by id."""
    print(f"Fetching product data for id: {product_id}")
    response = requests.get(f"{BASE_URL}/products/{product_id}")
    if response.status_code == 200:
        print(f"Product data: {json.dumps(response.json(), indent=4)}")
    else:
        print(
            f"Failed to fetch product data: {response.status_code} " f"{response.text}"
        )
    return response


def delete_product(product_id):
    """Delete product."""
    print(f"Deleting product data for id: {product_id}")
    response = requests.delete(f"{BASE_URL}/products/{product_id}")

    if response.status_code == 204:
        print("Product deleted successfully")
    else:
        print(f"Failed to delete product: {response.status_code} " f"{response.text}")

    return response


if __name__ == "__main__":
    print("Starting test script...")

    # Step 1: Add the product
    add_user_response = add_product()

    # Step 2: Get all products
    get_products()

    if add_user_response:
        # Step 3: Get the product by id
        get_product_by_id(add_user_response["product"]["id"])

        # Step 4: Delete the product
        delete_product(add_user_response["product"]["id"])
    else:
        print("Unable to continue tests as adding user failed.")
