---

# Marketplace Application - v4

This is the fourth version of the Marketplace application, providing CRUD functionalities using FastAPI, PostgreSQL, and NATS for messaging. The app also has a simple frontend to interact with in a more user-friendly manner.
The register and login functionalities are on a very basic level due to the goal of using our group authentication service. 
Starting from this version, the project is integrated with the group's gateway and all the endpoints are configuired to use it.

## Features

1. **Product Listings**: Add, view, and search product listings with detailed information, including ratings.
2. **Transactions & Reviews**: Handle transactions and manage product reviews for a full marketplace experience.
3. **Real-Time Messaging**: Uses NATS to demontrate the messaging possibilities.

## Project Structure

- **Backend**: Built with FastAPI, connected to PostgreSQL for data storage, and integrated with NATS for messaging.
- **Frontend**: A user-friendly interface for interacting with the marketplace.
- **Database**: PostgreSQL with initialization scripts and Alembic for managing database migrations.
- **Data Models**: Well-structured models for Users, Products, Transactions, and Reviews.
- **Middleware**: FastAPI middleware with data validation and error handling.
- **Configuration**: Centralized settings for easier management and security.

## Installation and Setup

### Running the Backend

1.1. **Clone the Repository**:
   ```bash
   git clone https://github.com/fuas-dverse/marketplace.git
   cd marketplace
   git checkout main
   ```

1.2. **Set Up Environment Variables**:
   - Create a `.env` file with your configuration for the database, NATS server, and other settings.

1.3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   - This command builds and starts all the services in one network, including the FastAPI app, PostgreSQL, and NATS.
  
2.1. **Pull docker image**:
https://hub.docker.com/repository/docker/dverse/marketplace-api/tags

### Running the Frontend

1. **Navigate to the Frontend Directory**:
   ```bash
   cd marketplace-frontend
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Frontend**:
   ```bash
   npm run dev
   ```
   - The frontend will be accessible at `http://localhost:3000`.

## Usage

- The API will be accessible at `http://localhost:5001`.
- The frontend will be available at `http://localhost:3000`.

## Configuration

- **Environment Variables**: Managed via a `.env` file for easy setup.
- **Docker Compose**: Simplifies running and managing the entire application stack.
- **Alembic**: Enables data migration.

## Improvements in v4

- **Tests**: Added comprehensive tests for all routes and components.
- **CI/CD Pipeline**: Automated coverage report uploads (to Codacy) for Jest and Pytest.
- **Docker Integration**: A new docker image of marketplace-api is being pushed with every merge into main.
- **API Enhancements**: Standardized responses.

---
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/e5a921226d254a9c94924caa773ef630)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

[![Codacy Badge](https://app.codacy.com/project/badge/Coverage/e5a921226d254a9c94924caa773ef630)](https://app.codacy.com?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_coverage)
