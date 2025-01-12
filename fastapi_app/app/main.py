"""
This module defines the main entry point for the FastAPI application
serving as the backend for the marketplace use case.

The application includes the following functionalities:
- Product management
- User management
- Transaction management
- Review management

The application also handles startup and shutdown events to manage
database initialization and NATS server connections.

Modules and packages imported:
- dverse_nats_helper.nats_connection: For connecting to the NATS server.
- fastapi: For creating the FastAPI application.
- sqlalchemy.orm: For database session management.
- app.api.products: Product-related API routes.
- app.api.reviews: Review-related API routes.
- app.api.transactions: Transaction-related API routes.
- app.api.users: User-related API routes.
- app.config: Configuration settings for the application.
- app.database: Database engine and session management.
- app.models: Database models.

Routes included:
- /api/products: Product-related endpoints.
- /api/users: User-related endpoints.
- /api/transactions: Transaction-related endpoints.
- /api/reviews: Review-related endpoints.
- /: Root endpoint returning a welcome message.

Startup and shutdown events:
- startup_event: Initializes the database and connects to the NATS server.
- shutdown_event: Closes the connection to the NATS server.
"""

from dverse_nats_helper.nats_connection import connect_nats, nc
from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
from apitally.fastapi import ApitallyMiddleware
from sqlalchemy.orm import Session

from app.api.products import router as products_router
from app.api.reviews import router as reviews_router
from app.api.transactions import router as transactions_router
from app.api.users import router as users_router
from app.config import Config
from app.database import engine, get_db, insert_user_if_empty
from app.models import Base
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.responses import PlainTextResponse

app = FastAPI(
    title="The Marketplace API",
    description=(
        "This is a FastAPI application serving as the backend for the "
        "marketplace use case."
    ),
)

CACHE_CONTROL = "no-store, no-cache, must-revalidate, max-age=0"


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Cache-Control"] = CACHE_CONTROL
        return response


app.add_middleware(SecurityHeadersMiddleware)
Instrumentator().instrument(app).expose(app)
app.add_middleware(
    ApitallyMiddleware,
    client_id="3fd3190f-26c3-4eff-b7a1-66307cd50078",
    env="dev",
)

Base.metadata.create_all(bind=engine)

app.include_router(products_router, prefix="/api", tags=["Products"])
app.include_router(users_router, prefix="/api", tags=["Users"])
app.include_router(transactions_router, prefix="/api", tags=["Transactions"])
app.include_router(reviews_router, prefix="/api", tags=["Reviews"])


@app.on_event("startup")
async def startup_event():
    """
    Handles startup events for the FastAPI application.

    This function performs the following tasks during the startup of the application:
    1. Initializes a database session and inserts a user if the database is empty.
    2. Establishes a connection to a NATS server using the provided server URL.

    Raises:
    Exception: If there is an error connecting to the NATS server."""

    db: Session = next(get_db())
    insert_user_if_empty(db=db)
    await connect_nats(server_url=Config.NATS_SERVER_URL)


@app.on_event("shutdown")
async def shutdown_event():
    """
    Handles shutdown events for the FastAPI application.

    This function closes the connection to the NATS server."""
    if nc.is_connected:
        await nc.close()


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint for the API.

    Returns a welcome message.
    """
    return {"message": "Welcome to the API"}


@app.get("/health", tags=["Health"])
async def health():
    """
    Health check endpoint for the API.

    Returns a simple health check response.
    """
    return {"status": "ok"}, 200


@app.get("/robots.txt", include_in_schema=False)
async def robots_txt():
    """
    Serve the robots.txt file for web crawlers.

    The robots.txt file instructs web crawlers (e.g., search engine bots)
    on which parts of the website they are allowed to access. In this case,
    it disallows all crawling.

    Returns:
        PlainTextResponse: The robots.txt file content with security headers.
    """
    content = "User-agent: *\nDisallow: /"
    headers = {
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        "X-Content-Type-Options": "nosniff",
    }
    return PlainTextResponse(content, headers=headers)


@app.get("/sitemap.xml", include_in_schema=False)
async def sitemap_xml():
    """
    Serve an empty sitemap.xml file.

    The sitemap.xml file is used by search engines to understand the
    structure of a website. In this case, it serves an empty sitemap.

    Returns:
        PlainTextResponse: The sitemap.xml file content with security headers.
    """
    content = """<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    </urlset>"""
    headers = {"Cache-Control": CACHE_CONTROL, "X-Content-Type-Options": "nosniff"}
    return PlainTextResponse(content, headers=headers)
