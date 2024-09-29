import json
import asyncio
from nats.aio.client import Client as NATS

# Initialize global variables
users = {}
product_listings = {}
transactions = {}
reviews = {}
logged_in_user = None  # Stores the current logged-in user

nats_client = NATS()


async def connect_to_nats():
    await nats_client.connect(servers=["nats://127.0.0.1:4222"])


async def publish_event(subject, message):
    await nats_client.publish(subject, json.dumps(message).encode())


def load_data():
    global users, product_listings, transactions, reviews
    try:
        with open('users.json', 'r') as f:
            users = json.load(f)
    except FileNotFoundError:
        users = {}

    try:
        with open('products.json', 'r') as f:
            product_listings = json.load(f)
    except FileNotFoundError:
        product_listings = {}

    try:
        with open('transactions.json', 'r') as f:
            transactions = json.load(f)
    except FileNotFoundError:
        transactions = {}

    try:
        with open('reviews.json', 'r') as f:
            reviews = json.load(f)
    except FileNotFoundError:
        reviews = {}


def save_data():
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)
    with open('products.json', 'w') as f:
        json.dump(product_listings, f, indent=4)
    with open('transactions.json', 'w') as f:
        json.dump(transactions, f, indent=4)
    with open('reviews.json', 'w') as f:
        json.dump(reviews, f, indent=4)


def login():
    global logged_in_user
    username = input("Enter your username: ")
    if username in users:
        logged_in_user = username
        print(f"Welcome back, {username}!")
    else:
        print(f"User '{username}' not found. Please register.")
        logged_in_user = None


def logout():
    global logged_in_user
    print(f"User '{logged_in_user}' has logged out.")
    logged_in_user = None


def register_user(username):
    if username in users:
        print("User already exists.")
    else:
        users[username] = {
            "username": username,
            "reputation_score": 0,
            "product_listings": [],
            "viewed_products": []
        }
        print(f"User '{username}' registered successfully!")
        save_data()


async def create_product_listing(title, description, price):
    if logged_in_user:
        product_id = str(len(product_listings) + 1)
        product_listings[product_id] = {
            "title": title,
            "description": description,
            "price": price,
            "seller": logged_in_user,
            "average_rating": 0,
            "rating_count": 0
        }
        users[logged_in_user]["product_listings"].append(product_id)
        print(f"Product '{title}' added successfully.")
        save_data()

        # Publish product creation event immediately
        await publish_event("product.created", {
            "product_id": product_id,
            "title": title,
            "seller": logged_in_user
        })
    else:
        print("Please log in to create a product listing.")


def view_product_listings():
    print("\nAvailable Products:")
    for product_id, product in product_listings.items():
        print(f"ID: {product_id} | Title: {product['title']} | Price: {product['price']} | Seller: {product['seller']} | Rating: {product['average_rating']:.1f}")
    save_data()


async def add_product_review(listing_id, rating, content):
    if logged_in_user:
        review = {
            "username": logged_in_user,
            "rating": rating,
            "content": content
        }

        if listing_id not in reviews:
            reviews[listing_id] = []
        reviews[listing_id].append(review)

        # Update the product's average rating
        product = product_listings[listing_id]
        product['rating_count'] += 1
        product['average_rating'] = ((product['average_rating'] * (product['rating_count'] - 1)) + rating) / product['rating_count']

        print(f"Review added for product ID {listing_id}. New average rating: {product['average_rating']:.1f}")
        save_data()

        # Publish review event immediately
        await publish_event("review.added", {
            "product_id": listing_id,
            "rating": rating,
            "reviewer": logged_in_user,
            "content": content
        })
    else:
        print("Please log in to add a review.")


async def purchase_product(product_id):
    if logged_in_user:
        if product_id in product_listings:
            product = product_listings[product_id]
            if product['seller'] == logged_in_user:
                print("You cannot purchase your own product.")
                return

            transaction_id = str(len(transactions) + 1)
            transactions[transaction_id] = {
                "buyer": logged_in_user,
                "listing_id": product_id,
                "status": "Completed"
            }

            # Add to viewed products
            if 'viewed_products' not in users[logged_in_user]:
                users[logged_in_user]['viewed_products'] = []
            users[logged_in_user]['viewed_products'].append(product_id)

            print(f"Product '{product['title']}' purchased successfully.")
            save_data()

            # Publish purchase event immediately
            await publish_event("product.purchased", {
                "product_id": product_id,
                "title": product['title'],
                "buyer": logged_in_user
            })
        else:
            print("Product not found.")
    else:
        print("Please log in to purchase a product.")


def view_transactions():
    if logged_in_user:
        print(f"\nTransactions for {logged_in_user}:")
        for transaction_id, transaction in transactions.items():
            if transaction['buyer'] == logged_in_user:
                product = product_listings[transaction['listing_id']]
                print(f"Transaction ID: {transaction_id} | Product: {product['title']} | Price: {product['price']} | Status: {transaction['status']}")
    else:
        print("Please log in to view your transactions.")


def recommend_products():
    if logged_in_user:
        viewed_products = users[logged_in_user].get("viewed_products", [])
        recommended = [product for product in product_listings.values()
                       if product['average_rating'] >= 4.0 and
                       product['seller'] != logged_in_user and
                       str(product) not in viewed_products]

        if recommended:
            print("\nRecommended Products:")
            for product in recommended:
                print(f"Title: {product['title']}, Price: {product['price']}, Average Rating: {product['average_rating']:.1f}")
        else:
            print("No recommendations available.")
    else:
        print("Please log in to get recommendations.")


async def main():
    load_data()
    await connect_to_nats()

    while True:
        if logged_in_user:
            print(f"\nLogged in as: {logged_in_user}")
            print("1. Create Product Listing")
            print("2. View Product Listings")
            print("3. Add Product Review")
            print("4. Purchase Product")
            print("5. View Transactions")
            print("6. Get Recommended Products")
            print("7. Log Out")
        else:
            print("\n--- Decentralized Marketplace ---")
            print("1. Register User")
            print("2. Login")
            print("3. View Product Listings")
            print("4. Exit")

        choice = input("Choose an option: ")

        if logged_in_user:
            if choice == '1':
                title = input("Enter product title: ")
                description = input("Enter product description: ")
                price = float(input("Enter product price: "))
                await create_product_listing(title, description, price)
            elif choice == '2':
                view_product_listings()
            elif choice == '3':
                listing_id = input("Enter product listing ID: ")
                rating = int(input("Enter rating (1-5): "))
                content = input("Enter review content: ")
                await add_product_review(listing_id, rating, content)
            elif choice == '4':
                product_id = input("Enter the product ID to purchase: ")
                await purchase_product(product_id)
            elif choice == '5':
                view_transactions()
            elif choice == '6':
                recommend_products()
            elif choice == '7':
                logout()
            else:
                print("Invalid option. Please try again.")
        else:
            if choice == '1':
                username = input("Enter username: ")
                register_user(username)
            elif choice == '2':
                login()
            elif choice == '3':
                view_product_listings()
            elif choice == '4':
                print("Exiting and saving data...")
                save_data()
                break
            else:
                print("Invalid option. Please try again.")

if __name__ == "__main__":
    asyncio.run(main())
