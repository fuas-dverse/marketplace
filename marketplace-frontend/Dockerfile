# Stage 1: Builder
FROM node:18.18.0 AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the entire application
COPY . .

# Build the application
RUN npm run build

# Stage 2: Runner
FROM node:18.18.0 AS runner

WORKDIR /app

# Copy necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Install production dependencies
RUN npm install --omit=dev

# Expose the port the app runs on
EXPOSE 3001

# Run the application
CMD ["npm", "start", "--", "--port", "3001"]
