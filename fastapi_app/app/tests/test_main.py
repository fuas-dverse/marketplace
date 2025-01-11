import requests

BASE_URL = "http://localhost:5001"


def test_root_endpoint():
    """
    Test the root endpoint to ensure it returns a welcome message.
    """
    response = requests.get(f"{BASE_URL}/", timeout=10)
    assert (
        response.status_code == 200
    ), f"Unexpected status code: {response.status_code}"
    assert response.json() == {"message": "Welcome to the API"}
    print("Root endpoint test passed.")


def test_products_endpoint():
    """
    Test the /api/products endpoint for basic functionality.
    """
    response = requests.get(f"{BASE_URL}/api/products", timeout=10)
    assert response.status_code in [
        200,
        404,
    ], f"Unexpected status code: {response.status_code}"
    print("Products endpoint test passed.")


def test_users_endpoint():
    """
    Test the /api/users endpoint for basic functionality.
    """
    response = requests.get(f"{BASE_URL}/api/users", timeout=10)
    assert response.status_code in [
        200,
        404,
    ], f"Unexpected status code: {response.status_code}"
    print("Users endpoint test passed.")


def test_transactions_endpoint():
    """
    Test the /api/transactions endpoint for basic functionality.
    """
    response = requests.get(f"{BASE_URL}/api/transactions", timeout=10)
    assert response.status_code in [
        200,
        404,
    ], f"Unexpected status code: {response.status_code}"
    print("Transactions endpoint test passed.")


def test_reviews_endpoint():
    """
    Test the /api/reviews endpoint for basic functionality.
    """
    response = requests.get(f"{BASE_URL}/api/reviews", timeout=10)
    assert response.status_code in [
        200,
        404,
    ], f"Unexpected status code: {response.status_code}"
    print("Reviews endpoint test passed.")


def test_metrics_endpoint():
    """
    Test the /metrics endpoint for Prometheus metrics exposure.
    """
    response = requests.get(f"{BASE_URL}/metrics", timeout=10)
    assert (
        response.status_code == 200
    ), f"Unexpected status code: {response.status_code}"
    assert "http_requests_total" in response.text, "Metrics not found in response."
    print("Metrics endpoint test passed.")


if __name__ == "__main__":
    test_root_endpoint()
    test_products_endpoint()
    test_users_endpoint()
    test_transactions_endpoint()
    test_reviews_endpoint()
    test_metrics_endpoint()
