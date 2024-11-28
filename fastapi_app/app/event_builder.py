"""
Borrowed from Eduard
Utile module for building events pushed on the nats server.
"""

import uuid
from datetime import datetime, timezone


def build_event(product, actor):
    """
    Build an event message conforming to the event schema.

    Args:
        object (dict): A dictionary representing the object.
        actor (dict): A dictionary containing actor details.

    Returns:
        dict: The event message.
    """
    event = {
        "event_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "platform": "Marketplace",
        "service": "Product service",
        "event_type": "post",
        "actor": {
            "actor_id": actor["actor_id"],
            "username": actor["username"],
        },
        "object": {
            "product_id": str(product.id),
            "title": product.title,
            "price": product.price,
        },
    }
    return event
