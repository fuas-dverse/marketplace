import pytest
import asyncio
from nats.aio.client import Client as NATS


@pytest.fixture(scope="module")
def nats_server():
    import subprocess
    import time

    # Start NATS server
    nats_server_process = subprocess.Popen(["nats-server", "-p", "4222"])
    time.sleep(1)  # Give it some time to start

    yield

    # Teardown NATS server
    nats_server_process.terminate()
    nats_server_process.wait()


@pytest.mark.asyncio
async def test_using_nats_server(nats_server):
    """A test which relies on nats-server being up and running."""
    nc = NATS()
    await nc.connect("nats://localhost:4222")

    # Publish a message
    subject = "product.add"
    message = b"Hello, NATS!"

    # Subscribe to the subject
    future = asyncio.Future()

    async def message_handler(msg):
        future.set_result(msg.data)

    # Await the subscription setup
    await nc.subscribe(subject, cb=message_handler)
    await asyncio.sleep(0.5)  # Give some time for subscription to be ready

    # Publish the message
    await nc.publish(subject, message)

    # Wait for the message
    result = await asyncio.wait_for(future, 5.0)  # Increased timeout
    assert result == message

    await nc.close()
