import asyncio
import os
from fastapi import FastAPI, WebSocket
from nats.aio.client import Client as NATS
from nats.aio.errors import ErrNoServers
from loguru import logger
import uvicorn

NOTIFICATION_TYPES = ["email", "in_app"]

app = FastAPI()
connected_clients = []
missed_notifications = []

logger.add("./logs/notification_service.log", rotation="1 MB", level="DEBUG")


class NotificationService:
    def __init__(self):
        self.nc = NATS()
        self.nats_url = os.getenv("NATS_URL", "nats://localhost:4222")
        self.notification_type = os.getenv("NOTIFICATION_TYPE", "in_app")

    async def connect_to_nats(self):
        retry_count = 0
        while retry_count < 5:
            try:
                logger.debug(
                    f"Attempting to connect to NATS at {self.nats_url} "
                    f"(Attempt {retry_count + 1}/5)"
                )
                await self.nc.connect(servers=[self.nats_url])
                logger.info(f"Connected to NATS at {self.nats_url}")
                return
            except ErrNoServers as e:
                retry_count += 1
                logger.error(
                    f"Failed to connect to NATS server: {e}. Retrying ({retry_count}/5)"
                )
                await asyncio.sleep(2)
        raise ConnectionError("Failed to connect to NATS after 5 attempts")

    async def subscribe_to_subject(self, subject):
        async def message_handler(msg):
            subject = msg.subject
            data = msg.data.decode()
            logger.info(f"Received a message on '{subject}': {data}")
            await self.send_notification(subject, data)

        logger.debug(f"Subscribing to NATS subject: {subject}")
        await self.nc.subscribe(subject, cb=message_handler)
        logger.info(f"Subscribed to NATS subject: {subject}")
        await asyncio.sleep(1)

    async def send_notification(self, subject, message):
        if self.notification_type not in NOTIFICATION_TYPES:
            logger.error(
                f"Notification type '{self.notification_type}' is not supported"
            )
            return

        notification = f"[{subject}] {message}"
        if self.notification_type == "in_app":
            logger.info(f"In-app Notification: {notification}")
            # Store notification in missed_notifications if no clients are connected
            if not connected_clients:
                missed_notifications.append(notification)
            else:
                # Send notification to all connected WebSocket clients
                disconnected_clients = []
                for client in connected_clients:
                    try:
                        await client.send_text(notification)
                    except Exception as e:
                        logger.error(f"Failed to send notification to client: {e}")
                        disconnected_clients.append(client)
                # Remove disconnected clients
                for client in disconnected_clients:
                    connected_clients.remove(client)
        elif self.notification_type == "email":
            logger.info(f"Email Notification: {notification}")

    async def run(self):
        await self.connect_to_nats()
        subjects = [
            "user.created",
            "user.deleted",
            "product.created",
            "product.deleted",
            "review.created",
            "transaction.created",
        ]
        logger.debug("Starting to subscribe to subjects")
        await asyncio.gather(
            *(self.subscribe_to_subject(subject) for subject in subjects)
        )


notification_service = NotificationService()


@app.on_event("startup")
async def startup_event():
    try:
        logger.debug("Starting startup event and connecting to NATS")
        await notification_service.connect_to_nats()
        asyncio.create_task(notification_service.run())
        logger.info("Notification service started successfully and connected to NATS.")
    except Exception as e:
        logger.error(f"Failed to start notification service: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    if notification_service.nc.is_connected:
        await notification_service.nc.close()
        logger.info("Disconnected from NATS server.")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.append(websocket)

    # Send any missed notifications when the connection opens
    if missed_notifications:
        for notification in missed_notifications:
            try:
                await websocket.send_text(notification)
            except Exception as e:
                logger.error(f"Failed to send missed notification: {e}")
        missed_notifications.clear()

    try:
        logger.info(f"WebSocket connection opened from {websocket.client}")
        while True:
            await websocket.receive_text()  # Keep the connection alive
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        logger.info(f"WebSocket connection closed from {websocket.client}")
        connected_clients.remove(websocket)


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, ws="websockets")
