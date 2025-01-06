"""
Unit tests for the `build_event` function from `dverse_nats_helper.event_builder`.

Fixtures:
    sample_system: Sample system metadata.
    sample_actor: Sample actor metadata.
    test_session: In-memory SQLite database session.

Functions:
    custom_message_structure_for(object): Prints object attributes.
    test_build_event_with_valid_product(): Tests with a valid Product.
    test_build_event_with_invalid_object(): Tests with an invalid object.
    test_build_event_with_product(sample_system, sample_actor, test_session):
        Tests with a valid Product.
    test_build_event_with_transaction(sample_system, sample_actor):
        Tests with a valid Transaction.
    test_build_event_with_review(sample_system, sample_actor):
        Tests with a valid Review.
    test_build_event_with_user(sample_system, sample_actor): Tests with a valid User.
"""

import inspect
import uuid
import pytest
from dverse_nats_helper.event_builder import build_event
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base
from fastapi_app.app.models import Product, Review, Transaction, User


@pytest.fixture
def sample_system():
    """
    Provides a sample system metadata for event building.

    Returns:
        dict: A dictionary containing system metadata like event type,
        platform, and service.
    """
    return {"event_type": "object_created", "platform": "web", "service": "marketplace"}


@pytest.fixture
def sample_actor():
    """
    Provides a sample actor metadata for event building.

    Returns:
        dict: A dictionary containing actor metadata like actor ID and username.
    """
    return {
        "actor_id": "12345",
        "username": "test_user",
    }


@pytest.fixture(scope="module")
def test_session():
    """
    Creates an in-memory SQLite database session for testing.

    Yields:
        Session: A session object for interacting with the in-memory database.
    """
    engine = create_engine("sqlite:///:memory:")  # In-memory SQLite database
    Base.metadata.create_all(engine)  # Create tables
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def custom_message_structure_for(object):
    """
    Prints debug information about the attributes of a given object.

    Args:
        object: The object to inspect and debug.
    """
    print(f"DEBUG: Object attributes: {inspect.getmembers(object)}")
    if isinstance(object, Product):
        ...


def test_build_event_with_valid_product():
    """
    Tests the build_event function with a valid Product object.
    """
    product = Product(id=uuid.uuid4(), title="Test Product", price=100.0)
    actor = {"actor_id": "user123", "username": "testuser"}
    system = {
        "event_type": "object_created",
        "platform": "web",
        "service": "marketplace",
    }

    event = build_event(product, actor, system)

    assert event["object"]["product_id"] == str(product.id)
    assert event["event_type"] == "object_created"


def test_build_event_with_invalid_object():
    """
    Tests the build_event function with an invalid object type.

    Expects:
        ValueError: Raised when the object type is unsupported.
    """

    class InvalidObject:
        """
        A class representing an invalid object.
        This class is used as a placeholder for objects that are considered invalid
        within the context of the application. It currently does not have any attributes
        or methods.
        """

    invalid_object = InvalidObject()
    actor = {"actor_id": "user123", "username": "testuser"}
    system = {
        "event_type": "object_created",
        "platform": "web",
        "service": "marketplace",
    }

    with pytest.raises(ValueError, match="Unsupported object type"):
        build_event(invalid_object, actor, system)


def test_build_event_with_product(sample_system, sample_actor, test_session):
    """
    Tests the build_event function with a valid Product object.

    Args:
        sample_system (dict): System metadata fixture.
        sample_actor (dict): Actor metadata fixture.
        test_session (Session): Database session fixture.
    """
    product = Product(id=uuid.uuid4(), title="Sample Product", price=19.99)
    test_session.add(product)
    test_session.commit()

    event = build_event(product, sample_actor, sample_system)

    assert event["object"]["product_id"] == str(product.id)
    assert event["object"]["title"] == "Sample Product"
    assert event["object"]["price"] == "19.99"


def test_build_event_with_transaction(sample_system, sample_actor):
    """
    Tests the build_event function with a valid Transaction object.

    Args:
        sample_system (dict): System metadata fixture.
        sample_actor (dict): Actor metadata fixture.
    """
    transaction = Transaction(id=1, product_id=2, amount=100, status="complete")

    event = build_event(transaction, sample_actor, sample_system)

    assert event["object"]["transaction_id"] == "1"
    assert event["object"]["product_id"] == "2"
    assert event["object"]["amount"] == "100"
    assert event["object"]["status"] == "complete"


def test_build_event_with_review(sample_system, sample_actor):
    """
    Tests the build_event function with a valid Review object.

    Args:
        sample_system (dict): System metadata fixture.
        sample_actor (dict): Actor metadata fixture.
    """
    review = Review(id=1, product_id=2, rating=5, content="Great product!")

    event = build_event(review, sample_actor, sample_system)

    assert event["object"]["review_id"] == "1"
    assert event["object"]["product_id"] == "2"
    assert event["object"]["rating"] == 5
    assert event["object"]["content"] == "Great product!"


def test_build_event_with_user(sample_system, sample_actor):
    """
    Tests the build_event function with a valid User object.

    Args:
        sample_system (dict): System metadata fixture.
        sample_actor (dict): Actor metadata fixture.
    """
    user = User(id=1, username="test_user")

    event = build_event(user, sample_actor, sample_system)

    assert event["object"]["user_id"] == "1"
    assert event["object"]["username"] == "test_user"
