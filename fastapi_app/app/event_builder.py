"""
Borrowed from Eduard
Utile module for building events pushed on the nats server.
"""

import uuid
from datetime import datetime, timezone

from fastapi_app.app.models import Product, Review, Transaction, User


def build_event(object, actor, system):
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
        "platform": system.platform,
        "service": system.service,
        "event_type": system.event_type,
        "actor": {
            "actor_id": actor["actor_id"],
            "username": actor["username"],
        },
        "object": custom_message_structure_for(object),
    }
    return event


def custom_message_structure_for(object):
    if isinstance(object, Product):
        return {
            "product_id": str(object.id),
            "title": object.title,
            "price": object.price,
        }
    elif isinstance(object, Transaction):
        return {
            "transaction_id": str(object.id),
            "product_id": str(object.product_id),
            "amount": object.amount,
            "status": object.status,
        }
    elif isinstance(object, Review):
        return {
            "review_id": str(object.id),
            "product_id": str(object.product_id),
            "rating": object.rating,
            "comment": object.content,
        }
    elif isinstance(object, User):
        return {
            "user_id": str(object.id),
            "username": object.username,
        }
    else:
        raise ValueError("Unsupported object type")
