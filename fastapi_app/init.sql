-- Create the user if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_roles WHERE rolname = 'marketplace'
    ) THEN
        CREATE ROLE marketplace WITH LOGIN PASSWORD 'marketplace';
    END IF;
END $$;

-- Create the database if it doesn't already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_database WHERE datname = 'marketplace_db'
    ) THEN
        CREATE DATABASE marketplace_db OWNER marketplace;
    END IF;
END $$;

-- Connect to the auth_db database
\c marketplace_db;
