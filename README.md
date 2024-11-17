---

# Marketplace Application - v3

This is the third version of the Marketplace application, providing CRUD functionalities using FastAPI, PostgreSQL, and NATS for messaging. The app also has a simple frontend to interact with in a more user-friendly manner.
The register and login functionalities are on a very basic level due to the goal of using our group authentication service.

## Features

1. **Product Listings**: Add, view, and search product listings with detailed information, including ratings.
2. **Transactions & Reviews**: Handle transactions and manage product reviews for a full marketplace experience.
3. **Real-Time Messaging**: Uses NATS to demontrating the messaging possibilities.

## Project Structure

- **Backend**: FastAPI for the API, connected to PostgreSQL and NATS for messaging.
- **Frontend**: A user-friendly interface for interacting with the marketplace.
- **Database**: PostgreSQL for data storage, with initialization scripts to set up the database and roles.
- **Data Models**: Structured models for Users, Products, Transactions, and Reviews, added in this version for better data schema.
- **Middleware**: FastAPI middleware with data validation and error handling.
- **Configuration**: Centralized settings for easier management and security.

## Installation and Setup

### Running the Backend

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/fuas-dverse/marketplace.git
   cd marketplace
   git checkout v3
   ```

2. **Set Up Environment Variables**:
   - Create a `.env` file with your configuration for the database, NATS server, and other settings.

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   - This command builds and starts all the services in one network, including the FastAPI app, PostgreSQL, and NATS.

### Running the Frontend

Will be added to docker-compose in the next version. Not there as it is not a finished v1.

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

## Improvements in v3

- **Data Models**: Structured models with migration script added for better data handling.
- **Docker Integration**: Full Docker Compose setup for easier deployment.
- **Enhanced Database Setup**: Initialization script with duplication checks.
- **API Enhancements**: Improved data validation and error handling.
- **Centralized Config**: Simplified and optimized configuration management.

---
