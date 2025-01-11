from locust import HttpUser, TaskSet, task, between


class ProductTasks(TaskSet):
    """
    A TaskSet class that defines the tasks (API endpoints) to be executed
    during the stress test for the Marketplace API. Each task simulates a user action
    like retrieving products, creating products, updating product ratings, and deleting
    products.
    """

    @task(1)
    def get_products(self):
        """
        Simulates retrieving a list of all products via the GET /products/ endpoint.

        Sends a GET request to the /products/ endpoint and verifies the response.
        The task runs with a weight of 1.
        """
        with self.client.get(
            "/products/", name="GET /products/", catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    def create_product(self):
        """
        Simulates creating a new product via the POST /products/ endpoint.

        Sends a POST request with a JSON payload containing the product's details.
        This task runs with a weight of 2.
        """
        product_data = {
            "title": f"Product {self.user.product_count}",
            "description": "A product created by Locust.",
            "price": 99.99,
            "seller_id": "1",
        }
        with self.client.post(
            "/products/", json=product_data, name="POST /products/", catch_response=True
        ) as response:
            if response.status_code == 201:
                self.user.product_count += 1
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    def get_product_by_id(self):
        """
        Simulates retrieving a specific product by ID via the GET /products/{product_id}
        endpoint.

        Sends a GET request to retrieve the details of a product using its ID.
        The task runs with a weight of 1.
        """
        product_id = "101"  # Replace with a valid product ID for your tests
        with self.client.get(
            f"/products/{product_id}", name="GET /products/{id}", catch_response=True
        ) as response:
            if response.status_code in [200, 404]:  # 404 if the product doesn't exist
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    def update_product_rating(self):
        """
        Simulates updating the rating of a product via the POST /products/{product_id}/
        review/ endpoint.

        Sends a POST request with JSON data to update the average rating and
        rating count of a product.
        The task runs with a weight of 1.
        """
        product_id = "101"  # Replace with a valid product ID for your tests
        review_data = {
            "average_rating": 4.5,
            "rating_count": 150,
        }
        with self.client.post(
            f"/products/{product_id}/review/",
            json=review_data,
            name="POST /products/{id}/review/",
            catch_response=True,
        ) as response:
            if response.status_code in [200, 404]:  # 404 if the product doesn't exist
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    def delete_product(self):
        """
        Simulates deleting a product via the DELETE /products/{product_id} endpoint.

        Sends a DELETE request to remove a product using its ID.
        The task runs with a weight of 1.
        """
        product_id = "101"  # Replace with a valid product ID for your tests
        with self.client.delete(
            f"/products/{product_id}", name="DELETE /products/{id}", catch_response=True
        ) as response:
            if response.status_code in [204, 404]:  # 404 if the product doesn't exist
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")


class MarketplaceUser(HttpUser):
    """
    A class representing a simulated user interacting with the Marketplace API.

    This user will execute the tasks defined in the ProductTasks TaskSet.
    The wait_time between tasks simulates user think time.
    """

    tasks = [ProductTasks]
    wait_time = between(1, 3)  # Wait time between tasks (1-3 seconds)
    product_count = 0  # Tracks the number of products created during the test
