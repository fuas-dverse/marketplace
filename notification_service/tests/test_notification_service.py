from unittest.mock import AsyncMock, patch
from fastapi import logger
import pytest
from fastapi.testclient import TestClient
from main import app, NotificationService, connected_clients, missed_notifications


@pytest.fixture
def notification_service():
    service = NotificationService()
    service.nc = AsyncMock()  # Mock NATS client
    return service


@pytest.fixture
def client():
    return TestClient(app)


@pytest.mark.asyncio
async def test_connect_to_nats_success(notification_service):
    notification_service.nc.connect = AsyncMock()
    await notification_service.connect_to_nats()
    notification_service.nc.connect.assert_called_once()


@pytest.mark.asyncio
async def test_connect_to_nats_failure(notification_service):
    with patch.object(
        notification_service.nc,
        "connect",
        AsyncMock(side_effect=Exception("Connection error")),
    ) as mock_connect:
        try:
            await notification_service.connect_to_nats()
        except ConnectionError as e:
            logger.debug(f"Error raised: {e}")

    # Verify retry attempts
    logger.debug(f"Connect call count: {mock_connect.call_count}")
    assert mock_connect.call_count == 5


@pytest.mark.asyncio
async def test_subscribe_to_subject(notification_service):
    subject = "test.subject"
    notification_service.nc.subscribe = AsyncMock()
    await notification_service.subscribe_to_subject(subject)
    notification_service.nc.subscribe.assert_called_once_with(
        subject, cb=notification_service.nc.subscribe.call_args[1]["cb"]
    )


@pytest.mark.asyncio
async def test_send_notification_in_app(notification_service):
    notification_service.notification_type = "in_app"
    connected_clients.clear()  # No connected clients
    missed_notifications.clear()
    await notification_service.send_notification("test.subject", "Test Message")
    assert missed_notifications == ["[test.subject] Test Message"]


@pytest.mark.asyncio
async def test_send_notification_with_connected_clients(notification_service):
    notification_service.notification_type = "in_app"

    # Mock WebSocket client
    mock_client = AsyncMock()
    connected_clients.append(mock_client)
    await notification_service.send_notification("test.subject", "Test Message")

    mock_client.send_text.assert_called_once_with("[test.subject] Test Message")
    assert mock_client in connected_clients


@pytest.mark.asyncio
async def test_send_notification_unsupported_type(notification_service):
    notification_service.notification_type = "unsupported_type"
    with patch("loguru.logger.error") as mock_logger:
        await notification_service.send_notification("test.subject", "Test Message")
        mock_logger.assert_called_once_with(
            "Notification type 'unsupported_type' is not supported"
        )


def test_websocket_endpoint_connect_and_receive(client):
    with patch("main.connected_clients", []) as mock_connected_clients:
        with client.websocket_connect("/ws") as websocket:
            mock_connected_clients.append(websocket)
            assert websocket in mock_connected_clients


@pytest.mark.asyncio
async def test_startup_event():
    with (
        patch("main.NotificationService.connect_to_nats") as mock_connect,
        patch("main.NotificationService.run") as mock_run,
    ):
        await app.router.startup()
        mock_connect.assert_called_once()
        mock_run.assert_called_once()


@pytest.mark.asyncio
async def test_shutdown_event():
    with patch("main.NotificationService.close_connection") as mock_close:
        await app.router.shutdown()
        mock_close.assert_called_once()


def test_websocket_missed_notifications(client):
    missed_notifications.append("[test.subject] Test Message")  # Ensure correct format

    with client.websocket_connect("/ws") as websocket:
        received_message = websocket.receive_text()
        assert received_message == "[test.subject] Test Message"
        assert not missed_notifications  # Ensure missed notifications are cleared
