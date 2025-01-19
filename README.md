---

# Marketplace Application

This is the final version of the Marketplace application, providing CRUD functionalities using FastAPI, PostgreSQL, and NATS for messaging. The app also has a simple frontend to interact with in a more user-friendly manner. The events are used by notification service for demonstration and displayed in the frontend.
I also created auth-service and frontend that are now added to the docker compose together with the api gateway so creating the containers allows to interact with the full system.


## Features

1. **Product Listings**: Add, view, and search product listings with detailed information, including ratings.
2. **Transactions & Reviews**: Handle transactions and manage product reviews for a full marketplace experience.
3. **Real-Time Messaging**: Uses NATS to demontrate the messaging possibilities.
4. **Notifications**: The service listens to specified topics and shows the events to the user.
5. **Auth**: Simple service and frontend, that are available for everyone and after login redirect to the inital applictaion.
6. **User data**: User can update, export and delete their own data.

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
   - Create a `.env` file with configuration (available in my portfolio) for the database, NATS server, and other settings.

1.3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   - This command builds and starts all the services in one network.


## Configuration

- **Environment Variables**: Managed via a `.env` file for easy setup.
- **Docker Compose**: Simplifies running and managing the entire application stack.
- **Alembic**: Enables data migration.

