# Stage 1: Builder
FROM node:22 AS builder

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com
RUN npm config set strict-ssl false
RUN npm install --global npm@latest

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:22 AS runner

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Install production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on
EXPOSE 3002

# Run the application
CMD ["npm", "start", "--", "--port", "3002"]
