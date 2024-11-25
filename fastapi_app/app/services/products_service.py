import asyncio
import json
from fastapi import Depends
from nats.aio.client import Client as NATS
from requests import Session
from app.database import get_db, create_product
from app.models import User
from sqlalchemy.orm import sessionmaker
from app.database import engine

# Initialize NATS client
nats_client = NATS()

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


async def message_handler(msg):
    subject = msg.subject
    data = msg.data.decode()
    print(f"Received a message on '{subject}': {data}")

    try:
        if subject == "product.add":
            product_data = json.loads(data)
            with SessionLocal() as db:
                product = add_product(product_data, db)
                if product:
                    await send_product_created_event(product)
    except json.JSONDecodeError as e:
        print(f"Failed to decode JSON: {e}")


# Function to add a product
def add_product(product_data, db: Session = Depends(get_db)):
    seller = db.query(User).filter(User.id == product_data["seller_id"]).first()
    if not seller:
        print(f"Seller with id {product_data['seller_id']} not found.")
        return

    product = create_product(
        db,
        title=product_data.title,
        description=product_data.description,
        price=product_data.price,
        seller_id=product_data.seller_id,
        average_rating=product_data.average_rating,
        rating_count=product_data.rating_count,
    )

    print(f"Product created successfully: {product.title}")
    return product


# Function to send product created event
async def send_product_created_event(product):
    event_data = {
        "id": product.id,
        "title": product.title,
        "seller_id": product.seller_id,
        "message": "Product created successfully",
    }
    await nats_client.publish("product.created", json.dumps(event_data).encode())


# Run the NATS connection and subscribe to relevant subjects
async def run():
    await nats_client.connect(servers=["nats://nats-server:4222"])
    await nats_client.subscribe("product.add", cb=message_handler)


# Start the NATS client
aio_loop = asyncio.get_event_loop()
aio_loop.run_until_complete(run())
aio_loop.run_forever()
