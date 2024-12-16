import json
from jsonschema import ValidationError, validate
from nats.aio.client import Client as NATS
from app import event_schema

nc = NATS()


async def connect_nats():
    if not nc.is_connected:
        await nc.connect(servers=["nats://nats:4222"])


# Helper function to publish NATS event
async def publish_event(subject, data):
    try:
        validate(instance=data, schema=event_schema)
    except ValidationError as e:
        raise ValidationError(f"Validation failed: {e.message}")

    # Serialize the event data to JSON
    event_json = json.dumps(data).encode("utf-8")

    if nc.is_connected:
        await nc.publish(subject, event_json)
    else:
        raise ConnectionError("NATS connection is not established")
