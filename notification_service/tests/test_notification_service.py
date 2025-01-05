"""
Unit Tests for Notification Service

This module contains unit tests for the Notification Service implemented in the `main`
module.
The tests use pytest and mock objects to validate the behavior of the service without
requiring a live NATS server or actual WebSocket connections.

Fixtures:
    - `notification_service`: Provides a mocked instance of the
      `NotificationService` class.
    - `client`: Provides a FastAPI test client for simulating API calls.

Tests:
    - `test_connect_to_nats_success`: Validates successful connection
        to the NATS server.
    - `test_connect_to_nats_failure`: Ensures retry logic is executed
        on connection failure.
    - `test_subscribe_to_subject`: Tests subscribing to a NATS subject.
    - `test_send_notification_in_app`: Validates in-app notifications are stored
        when no clients are connected.
    - `test_send_notification_with_connected_clients`: Ensures notifications are sent
        to connected WebSocket clients.
    - `test_send_notification_unsupported_type`: Confirms unsupported notification types
        are logged as errors.
    - `test_websocket_endpoint_connect_and_receive`: Tests WebSocket endpoint
        connectivity.
    - `test_startup_event`: Verifies behavior during application startup.
    - `test_shutdown_event`: Verifies behavior during application shutdown.
    - `test_websocket_missed_notifications`: Ensures missed notifications are sent
      when a client connects.
"""

from unittest.mock import AsyncMock, patch
from loguru import logger
import pytest
from fastapi.testclient import TestClient
from main import app, NotificationService, connected_clients, missed_notifications


@pytest.fixture
def notification_service():
    """
    Fixture to provide a mocked instance of NotificationService.

    Returns:
        NotificationService: A mocked instance of the NotificationService class.
    """
    service = NotificationService()
    service.nc = AsyncMock()
    return service


@pytest.fixture
def client():
    """
    Fixture to provide a FastAPI test client.

    Returns:
        TestClient: A FastAPI test client instance.
    """
    return TestClient(app)


@pytest.mark.asyncio
async def test_connect_to_nats_success(notification_service):
    """
    Test successful connection to the NATS server.
    """
    notification_service.nc.connect = AsyncMock()
    await notification_service.connect_to_nats()
    notification_service.nc.connect.assert_called_once()


@pytest.mark.asyncio
async def test_connect_to_nats_failure(notification_service):
    """
    Test retry logic for connecting to the NATS server on failure.

    Verifies that the connection is attempted 5 times before raising a ConnectionError.
    """
    with patch.object(
        notification_service.nc,
        "connect",
        AsyncMock(side_effect=Exception("Connection error")),
    ) as mock_connect:
        try:
            await notification_service.connect_to_nats()
        except ConnectionError as e:
            logger.debug(f"Error raised: {e}")

    logger.debug(f"Connect call count: {mock_connect.call_count}")
    assert mock_connect.call_count == 5


@pytest.mark.asyncio
async def test_subscribe_to_subject(notification_service):
    """
    Test subscribing to a NATS subject.

    Verifies that the `subscribe` method is called with the correct subject
    and callback.
    """
    subject = "test.subject"
    notification_service.nc.subscribe = AsyncMock()
    await notification_service.subscribe_to_subject(subject)
    notification_service.nc.subscribe.assert_called_once_with(
        subject, cb=notification_service.nc.subscribe.call_args[1]["cb"]
    )


@pytest.mark.asyncio
async def test_send_notification_in_app(notification_service):
    """
    Test sending in-app notifications when no clients are connected.

    Ensures notifications are stored in the `missed_notifications` list.
    """
    notification_service.notification_type = "in_app"
    connected_clients.clear()
    missed_notifications.clear()
    await notification_service.send_notification("test.subject", "Test Message")
    assert missed_notifications == ["[test.subject] Test Message"]


@pytest.mark.asyncio
async def test_send_notification_with_connected_clients(notification_service):
    """
    Test sending in-app notifications to connected WebSocket clients.

    Verifies that the notification is sent to all connected clients.
    """
    notification_service.notification_type = "in_app"
    mock_client = AsyncMock()
    connected_clients.append(mock_client)
    await notification_service.send_notification("test.subject", "Test Message")

    mock_client.send_text.assert_called_once_with("[test.subject] Test Message")
    assert mock_client in connected_clients


@pytest.mark.asyncio
async def test_send_notification_unsupported_type(notification_service):
    """
    Test handling unsupported notification types.

    Verifies that an error is logged when the notification type is unsupported.
    """
    notification_service.notification_type = "unsupported_type"
    with patch("loguru.logger.error") as mock_logger:
        await notification_service.send_notification("test.subject", "Test Message")
        mock_logger.assert_called_once_with(
            "Notification type 'unsupported_type' is not supported"
        )


def test_websocket_endpoint_connect_and_receive(client):
    """
    Test WebSocket endpoint connectivity.

    Verifies that the WebSocket connection is added to the list of connected clients.
    """
    with patch("main.connected_clients", []) as mock_connected_clients:
        with client.websocket_connect("/ws") as websocket:
            mock_connected_clients.append(websocket)
            assert websocket in mock_connected_clients


@pytest.mark.asyncio
async def test_startup_event():
    """
    Test application startup event.

    Verifies that the NATS connection and subscription process are initiated.
    """
    with (
        patch("main.NotificationService.connect_to_nats") as mock_connect,
        patch("main.NotificationService.run") as mock_run,
    ):
        await app.router.startup()
        mock_connect.assert_called_once()
        mock_run.assert_called_once()


@pytest.mark.asyncio
async def test_shutdown_event():
    """
    Test application shutdown event.

    Verifies that the NATS connection is properly closed during shutdown.
    """
    with patch("main.NotificationService.close_connection") as mock_close:
        await app.router.shutdown()
        mock_close.assert_called_once()


def test_websocket_missed_notifications(client):
    """
    Test sending missed notifications to a WebSocket client.

    Verifies that missed notifications are delivered when a client connects.
    """
    missed_notifications.append("[test.subject] Test Message")

    with client.websocket_connect("/ws") as websocket:
        received_message = websocket.receive_text()
        assert received_message == "[test.subject] Test Message"
        assert not missed_notifications
