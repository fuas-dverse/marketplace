"""
Notification Service Module

This module implements a FastAPI-based notification service that integrates with NATS.
It supports WebSocket connections for real-time in-app notifications and
handles different notification types such as email and in-app.

The service includes:
- Connection management with NATS.
- Subscription to predefined NATS subjects.
- Sending notifications to connected WebSocket clients.
- Storing missed notifications for offline clients.

Classes:
    NotificationService: Handles NATS integration and notification delivery.

Routes:
    - `/ws`: WebSocket endpoint for real-time notifications.
    - `/`: Root endpoint for the API.

Events:
    - `startup`: Initializes the service and connects to NATS.
    - `shutdown`: Cleans up resources and disconnects from NATS.
"""

import asyncio
from fastapi import FastAPI, WebSocket
from nats.aio.client import Client as NATS
from loguru import logger
import uvicorn
from config import Config

NOTIFICATION_TYPES = ["email", "in_app"]

app = FastAPI()
connected_clients = []
missed_notifications = []


class NotificationService:
    """
    Notification Service for handling integration with NATS and managing notifications.

    Attributes:
        nc (NATS): The NATS client instance.
        nats_url (str): The URL of the NATS server.
        notification_type (str): Type of notifications supported (e.g., email, in-app).
        lock (asyncio.Lock): Ensures thread-safe operations.
        connected (bool): Tracks whether the service is connected to the NATS server.
    """

    def __init__(self):
        self.nc = NATS()
        self.nats_url = Config.NATS_SERVER_URL
        self.notification_type = Config.NOTIFICATION_TYPE
        self.lock = asyncio.Lock()
        self.connected = False

    async def connect_to_nats(self):
        """
        Connect to the NATS server with retry logic.

        Raises:
            ConnectionError: If the connection fails after multiple retries.
        """
        retry_count = 0
        while retry_count < 5:
            try:
                logger.debug(f"Attempting to connect to NATS at {self.nats_url}")
                async with self.lock:
                    if not self.connected:
                        await self.nc.connect(servers=[self.nats_url])
                        self.connected = True
                logger.info(f"Connected to NATS at {self.nats_url}")
                return
            except Exception as e:
                retry_count += 1
                logger.error(
                    f"Failed to connect to NATS server: {e}. Retrying ({retry_count}/5)"
                )
                await asyncio.sleep(2)
        raise ConnectionError("Failed to connect to NATS after 5 attempts")

    async def subscribe_to_subject(self, subject):
        """
        Subscribe to a NATS subject and handle incoming messages.

        Args:
            subject (str): The subject to subscribe to.
        """

        async def message_handler(msg):
            subject = msg.subject
            data = msg.data.decode()
            logger.info(f"Received a message on '{subject}': {data}")
            await self.send_notification(subject, data)

        async with self.lock:
            logger.debug(f"Subscribing to NATS subject: {subject}")
            await self.nc.subscribe(subject, cb=message_handler)
        logger.info(f"Subscribed to NATS subject: {subject}")

    async def send_notification(self, subject, message):
        """
        Send notifications to connected WebSocket clients or store them as missed
        notifications.

        Args:
            subject (str): The subject of the notification.
            message (str): The notification message.

        Logs errors if the notification type is unsupported or if delivery to a client
        fails.
        """
        if self.notification_type not in NOTIFICATION_TYPES:
            logger.error(
                f"Notification type '{self.notification_type}' is not supported"
            )
            return

        notification = f"[{subject}] {message}"
        if self.notification_type == "in_app":
            logger.info(f"In-app Notification: {notification}")
            if not connected_clients:
                missed_notifications.append(notification)
            else:
                disconnected_clients = []
                for client in connected_clients:
                    try:
                        await client.send_text(notification)
                    except Exception as e:
                        logger.error(f"Failed to send notification to client: {e}")
                        disconnected_clients.append(client)
                for client in disconnected_clients:
                    connected_clients.remove(client)
        elif self.notification_type == "email":
            logger.info(f"Email Notification: {notification}")

    async def close_connection(self):
        """
        Close the connection to the NATS server if connected.
        """
        async with self.lock:
            if self.connected:
                await self.nc.close()
                self.connected = False
                logger.info("Disconnected from NATS server.")

    async def run(self):
        """
        Connect to NATS and subscribe to predefined subjects.
        """
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
    """
    Event triggered on application startup.

    Connects to the NATS server and starts the notification service.
    Logs any errors encountered during initialization.
    """
    try:
        logger.debug("Starting startup event and connecting to NATS")
        await notification_service.connect_to_nats()
        asyncio.create_task(notification_service.run())
        logger.info("Notification service started successfully and connected to NATS.")
    except Exception as e:
        logger.error(f"Failed to start notification service: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """
    Event triggered on application shutdown.

    Closes the connection to the NATS server.
    Logs any errors encountered during shutdown.
    """
    try:
        await notification_service.close_connection()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for handling real-time notifications.

    Args:
        websocket (WebSocket): The WebSocket connection object.

    Stores missed notifications if there are no connected clients or delivers them
    to the connected client when a connection opens.
    """
    await websocket.accept()
    connected_clients.append(websocket)

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
            await websocket.receive_text()
    except Exception as e:
        logger.error(f"Error: {e}")
    finally:
        logger.info(f"WebSocket connection closed from {websocket.client}")
        connected_clients.remove(websocket)


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the API.

    Returns:
        dict: A welcome message.
    """
    logger.info("Root endpoint was hit")
    return {"message": "Welcome to the API"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=5003, reload=True, ws="websockets")
