from transformers import pipeline
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import asyncio
from nats.aio.client import Client as NATS
import torch
import config
import requests

# Determine if a GPU is available and assign device accordingly
device = config.CUDA_DEVICE if torch.cuda.is_available() else -1

# Load the LLM (using Hugging Face pipeline here)
query_model = pipeline(
    "feature-extraction", model="sentence-transformers/all-MiniLM-L6-v2", device=device
)

logged_in_user = None  # Stores the current logged-in user

nats_client = NATS()

server_url = config.FASTAPI_URL


async def connect_to_nats():
    await nats_client.connect(servers=config.NATS_SERVER_URL)


async def publish_event(subject, message):
    await nats_client.publish(subject, json.dumps(message).encode())


def generate_embeddings(text):
    """Generate embeddings using the LLM."""
    # Set clean_up_tokenization_spaces explicitly to False
    embeddings = query_model(text, clean_up_tokenization_spaces=False)
    return np.mean(embeddings[0], axis=0)  # Get the mean of the token embeddings


def find_best_products(query, product_listings):
    """Find the best products based on the user's query using LLM embeddings."""
    query_embedding = generate_embeddings(query)

    product_similarities = []
    for product_id, product in product_listings.items():
        product_text = f"{product['title']} {product['description']}"
        product_embedding = generate_embeddings(product_text)

        # Calculate similarity between query and product
        similarity = cosine_similarity([query_embedding], [product_embedding])[0][0]
        product_similarities.append((product_id, similarity))

    # Sort products by similarity score and then by rating
    product_similarities.sort(
        key=lambda x: (-x[1], -product_listings[x[0]]["average_rating"])
    )

    return product_similarities[:5]  # Return top 5 matched products


async def recommend_products_by_query(query):
    """Recommend products based on a natural language query and publish the event."""
    if logged_in_user:
        products = requests.get(f"{server_url}/products").json()
        best_products = find_best_products(query, products)

        if best_products:
            print("\nRecommended Products:")
            recommendations = []
            for product_id, similarity in best_products:
                product = products[product_id]
                print(
                    f"Title: {product['title']}, Price: {product['price']}, "
                    f"Rating: {product['average_rating']:.1f}, "
                    f"Relevance: {similarity:.2f}"
                )
                recommendations.append(
                    {
                        "title": product["title"],
                        "price": product["price"],
                        "rating": product["average_rating"],
                        "similarity": similarity,
                    }
                )

            # Publish query and recommendation event
            await publish_event(
                "query.made",
                {
                    "user": logged_in_user,
                    "query": query,
                    "recommendations": recommendations,
                },
            )
        else:
            print("No matching products found.")

            # Publish query event even if no results
            await publish_event(
                "query.made",
                {"user": logged_in_user, "query": query, "recommendations": []},
            )
    else:
        print("Please log in to get recommendations.")


def login():
    global logged_in_user
    username = input("Enter your username: ")

    response = requests.get(f"{server_url}/users/{username}")

    if response.status_code == 200:
        parsed_response = response.json()
        user = parsed_response.get("user")

        if user:
            print(f"User '{username}' has logged in.")
            logged_in_user = user
        elif response.status_code == 404:
            print(f"User '{username}' not found.")
            logged_in_user = None
    else:
        print(f"Error logging in user '{username}'. Please try again. {response.text}")
        logged_in_user = None


def logout():
    global logged_in_user
    print(f"User '{logged_in_user}' has logged out.")
    logged_in_user = None


def register_user(username):
    payload = {"username": username}
    response = requests.post(url=f"{server_url}/users", json=payload)

    if response.ok:
        print(f"User '{username}' registered successfully.")
    else:
        print(f"Error registering user '{username}'. Please try again. {response.text}")


async def create_product_listing(title, description, price):
    if logged_in_user:
        payload = {
            "title": title,
            "description": description,
            "price": price,
            "seller_id": logged_in_user.get("id"),
        }
        response = requests.post(url=f"{server_url}/products", json=payload)
        if response.ok:
            print(f"Product '{title}' added successfully.")

            # Publish product creation event immediately
            await publish_event(
                "product.created",
                {"title": title, "seller_id": logged_in_user.get("id")},
            )
        else:
            print(f"Error adding product '{title}'. Please try again. {response.text}")

    else:
        print("Please log in to create a product listing.")


def view_product_listings():
    print("\nAvailable Products:")

    response = requests.get(f"{server_url}/products")

    if response.ok:
        try:
            product_listings = response.json().get("products", [])
        except requests.exceptions.JSONDecodeError:
            print("Error: Received invalid JSON from the server.")
            print("Response content:", response.text)
            return

        if not product_listings:
            print("No products available.")
            return

        for product in product_listings:
            print(
                f"ID: {product['id']} | Title: {product['title']} | "
                f"Price: {product['price']} | "
                f"Seller: {product['seller_id']} | "
                f"Rating: {product['average_rating']:.1f}"
            )
    else:
        print(f"Error fetching product listings. Please try again. {response.text}")


async def add_product_review(product_id, rating, content):
    if not logged_in_user:
        print("Please log in to add a review.")
        return

    if not (1 <= rating <= 5):
        print("Invalid rating. Please enter a rating between 1 and 5.")
        return

    payload = {
        "user_id": logged_in_user.get("id"),
        "product_id": product_id,
        "rating": rating,
        "content": content,
    }

    try:
        response = requests.post(url=f"{server_url}/reviews", json=payload)
        response.raise_for_status()

        if response.ok:
            print(f"Review added for product ID {product_id}.")

            product_response = requests.get(
                f"{server_url}/products/{product_id}"
            ).json()

            # Update the product's average rating
            product = product_response.get("product")

            # Ensure product exists and has the required fields
            if product and "rating_count" in product and "average_rating" in product:
                print(
                    f"Before update: rating_count={product['rating_count']}, "
                    f"average_rating={product['average_rating']}"
                )

                # Initialize rating_count and average_rating if they are None
                if product["rating_count"] is None:
                    product["rating_count"] = 0
                if product["average_rating"] is None:
                    product["average_rating"] = 0.0

                # Update the rating count and average rating
                product["rating_count"] += 1
                product["average_rating"] = (
                    (product["average_rating"] * (product["rating_count"] - 1)) + rating
                ) / product["rating_count"]

                response = requests.post(
                    url=f"{server_url}/products/{product_id}/review/",
                    json={
                        "product": product,
                        "average_rating": product["average_rating"],
                        "rating_count": product["rating_count"],
                    },
                )
                if response.ok:
                    print(f"Review added for product ID {product_id}.")
                print(
                    f"After update: rating_count={product['rating_count']}, "
                    f"average_rating={product['average_rating']:.1f}"
                )
            else:
                print("Error: Product data is missing or incomplete.")

            print(f"New average rating: {product['average_rating']:.1f}")

            # Publish review event immediately
            await publish_event(
                "review.added",
                {
                    "product_id": product_id,
                    "rating": rating,
                    "reviewer": logged_in_user.get("username"),
                    "content": content,
                },
            )
        else:
            print(f"Error adding review. Please try again. {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"Error adding review: {str(e)}")


async def purchase_product(product_id):
    if not logged_in_user:
        print("Please log in to purchase a product.")
        return

    # users = requests.get(f"{server_url}/users").json()
    product = requests.get(f"{server_url}/products/{product_id}").json()
    if product:
        # if product['seller_id'] == logged_in_user.get('id'):
        #     print("You cannot purchase your own product.")
        #     return

        # if 'viewed_products' not in users[logged_in_user]:
        #     users[logged_in_user]['viewed_products'] = []
        # users[logged_in_user]['viewed_products'].append(product_id)

        payload = {
            "buyer_id": logged_in_user.get("id"),
            "product_id": product_id,
            "status": "Completed",
        }
        response = requests.post(url=f"{server_url}/transactions", json=payload)

        if response.ok:
            print(f"Product '{product_id}' purchased successfully.")

            # Publish purchase event immediately
            await publish_event(
                "product.purchased",
                {"product_id": product_id, "buyer": logged_in_user.get("id")},
            )
        else:
            print(
                f"Error purchasing product '{product_id}'. "
                f"Please try again. {response.text}"
            )
    elif response.status_code == 404:
        print("Product not found.")
    else:
        print(f"Error purchasing product. Please try again. {response.text}")


def view_transactions():
    if not logged_in_user:
        print("Please log in to view your transactions.")
        return

    transactions = requests.get(
        url=f"{server_url}/transactions/", json={"user_id": logged_in_user.get("id")}
    ).json()

    print(f"\nTransactions for {logged_in_user}:")
    for transaction in transactions:
        product = requests.get(
            f"{server_url}/products/{transaction['product_id']}"
        ).json()
        print(
            f"Transaction ID: {transaction['id']} | Product: {product['title']} | "
            f"Price: {product['price']} | Status: {transaction['status']}"
        )


def recommend_products():
    if logged_in_user:
        user = requests.get(url=f"{server_url}/users/{logged_in_user.get('id')}").json()
        viewed_products = user.get("viewed_products", [])
        products = requests.get(f"{server_url}/products").json()

        recommended = [
            product
            for product in products
            if product["average_rating"] >= 4.0
            and product["seller_id"] != logged_in_user.get("id")
            and str(product) not in viewed_products
        ]

        if recommended:
            print("\nRecommended Products:")
            for product in recommended:
                print(
                    f"Title: {product['title']}, Price: {product['price']}, "
                    f"Average Rating: {product['average_rating']:.1f}"
                )
        else:
            print("No recommendations available.")
    else:
        print("Please log in to get recommendations.")


async def main():
    await connect_to_nats()

    while True:
        if logged_in_user:
            print(f"\nLogged in as: {logged_in_user.get('username')}")
            print("1. Create Product Listing")
            print("2. View Product Listings")
            print("3. Add Product Review")
            print("4. Purchase Product")
            print("5. View Transactions")
            print("6. Get Recommended Products")
            print("7. Get Recommendations by Query")
            print("8. Log Out")
        else:
            print("\n--- Decentralized Marketplace ---")
            print("1. Register User")
            print("2. Login")
            print("3. View Product Listings")
            print("4. Exit")

        choice = input("Choose an option: ")

        if logged_in_user:
            if choice == "1":
                title = input("Enter product title: ")
                description = input("Enter product description: ")
                price = float(input("Enter product price: "))
                await create_product_listing(title, description, price)
            elif choice == "2":
                view_product_listings()
            elif choice == "3":
                listing_id = input("Enter product listing ID: ")
                rating = int(input("Enter rating (1-5): "))
                content = input("Enter review content: ")
                await add_product_review(listing_id, rating, content)
            elif choice == "4":
                product_id = input("Enter the product ID to purchase: ")
                await purchase_product(product_id)
            elif choice == "5":
                view_transactions()
            elif choice == "6":
                recommend_products()
            elif choice == "7":
                query = input("Enter your query: ")
                await recommend_products_by_query(query)
            elif choice == "8":
                logout()
            else:
                print("Invalid option. Please try again.")
        else:
            if choice == "1":
                username = input("Enter username: ")
                register_user(username)
            elif choice == "2":
                login()
            elif choice == "3":
                view_product_listings()
            elif choice == "4":
                print("Exiting...")
                break
            else:
                print("Invalid option. Please try again.")


if __name__ == "__main__":
    asyncio.run(main())
