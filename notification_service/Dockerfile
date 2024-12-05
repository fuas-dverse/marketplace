FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Copy requirements file and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Set environment variables (can be overridden at runtime)
ENV NATS_URL=nats://nats-server:4222
ENV NOTIFICATION_TYPE=in_app

# Expose the port for WebSocket connections
EXPOSE 5003

# Run the application using uvicorn for FastAPI
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "5003"]
