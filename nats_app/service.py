import asyncio
import json
from nats.aio.client import Client as NATS
import config

nats_client = NATS()


async def connect_to_nats():
    """Connect to the NATS server."""
    await nats_client.connect(servers=config.NATS_SERVER_URL)


async def handle_query_event(msg):
    """Process the received query event."""
    event_data = json.loads(msg.data.decode())

    user = event_data.get("user")
    query = event_data.get("query")
    recommendations = event_data.get("recommendations")

    print(f"Received query event for user: {user}")
    print(f"Query: {query}")
    print(f"Recommendations: {json.dumps(recommendations, indent=2)}")


async def handle_product_event(msg):
    """Process the received product created event."""
    event_data = json.loads(msg.data.decode())

    product_id = event_data.get("product_id")
    title = event_data.get("title")
    seller = event_data.get("seller")

    print(f"Product created: ID: {product_id}, Title: {title}, Seller: {seller}")


async def handle_review_event(msg):
    """Process the received review added event."""
    event_data = json.loads(msg.data.decode())

    product_id = event_data.get("product_id")
    rating = event_data.get("rating")
    reviewer = event_data.get("reviewer")
    content = event_data.get("content")

    print(
        f"Review added for Product ID {product_id} by {reviewer}: "
        f"Rating {rating}, Content: {content}"
    )


async def subscribe_to_topics():
    """Subscribe to multiple NATS topics and handle events."""
    await nats_client.subscribe("query.made", cb=handle_query_event)
    await nats_client.subscribe("product.created", cb=handle_product_event)
    await nats_client.subscribe("review.added", cb=handle_review_event)

    print(
        "Subscribed to topics 'query.made', 'product.created', and 'review.added' "
        "and waiting for events..."
    )


async def main():
    await connect_to_nats()
    await subscribe_to_topics()

    # Keep the service running to listen for incoming events
    while True:
        await asyncio.sleep(1)


if __name__ == "__main__":
    asyncio.run(main())
