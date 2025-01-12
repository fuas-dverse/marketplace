from locust import HttpUser, TaskSet, task, between
import random


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
        Simulates retrieving a list of all products via the GET /api/products/ endpoint.

        Sends a GET request to the /api/products/ endpoint and verifies the response.
        The task runs with a weight of 1.
        """
        with self.client.get(
            "/api/products/", name="GET /api/products/", catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(2)
    def create_product(self):
        """
        Simulates creating a new product via the POST /api/products/ endpoint.

        Sends a POST request with a JSON payload containing the product's details.
        This task runs with a weight of 2.
        """

        if not self.user.user_id:
            print("User ID is not set. Skipping product creation.")
            return

        product_data = {
            "title": f"Product {self.user.product_count}",
            "description": "A product created by Locust.",
            "price": 99.99,
            "seller_id": self.user.user_id,
        }
        with self.client.post(
            "/api/products/",
            json=product_data,
            name="POST /api/products/",
            catch_response=True,
        ) as response:
            if response.status_code == 201:
                self.user.product_count += 1
                response_data = response.json()
                self.user.product_ids.append(response_data["product"]["id"])
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    def get_product_by_id(self):
        """
        Simulates retrieving a specific product by ID via the GET /api/products/
        {product_id} endpoint.

        Sends a GET request to retrieve the details of a product using its ID.
        The task runs with a weight of 1.
        """
        number = self.user.product_count - 1 if self.user.product_count > 0 else 0
        product_id = self.user.product_ids[number]
        if not product_id:
            print("No product IDs found. Skipping product retrieval.")
            return

        with self.client.get(
            f"/api/products/{product_id}",
            name="GET /api/products/{id}",
            catch_response=True,
        ) as response:
            if response.status_code in [200, 404]:
                response.success()
            else:
                response.failure(f"Failed with status {response.status_code}")

    @task(1)
    def delete_product(self):
        """
        Simulates deleting a product via the DELETE /api/products/{product_id} endpoint.

        Sends a DELETE request to remove a product using its ID.
        The task runs with a weight of 1.
        """
        number = self.user.product_count - 1 if self.user.product_count > 0 else 0
        product_id = self.user.product_ids[number]
        if not product_id:
            print("No product IDs found. Skipping product retrieval.")
            return

        with self.client.delete(
            f"/api/products/{product_id}",
            name="DELETE /api/products/{id}",
            catch_response=True,
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
    wait_time = between(1, 3)
    product_count = 0
    user_id = None
    product_ids = []

    def on_start(self):
        """
        Called when a simulated user starts. It creates a user and assigns the user ID.
        """
        self.create_user()

    def create_user(self):
        """
        Helper function to create a user via POST /api/users/ and assign the ID
        to the Locust user.
        """
        username = f"user_{random.randint(1000, 9999)}"
        response = self.client.post(
            "/api/users/", json={"username": username}, name="POST /api/users/"
        )
        if response.status_code == 201:
            response_data = response.json()
            self.user_id = response_data["user"]["id"]
            print(f"User created successfully with ID: {self.user_id}")
        else:
            print(f"Failed to create user. Status code: {response.status_code}")
