# Stage 1: Install dependencies and build the app
FROM node:18 AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app source code
COPY . .

# Ensure TypeScript is installed
RUN npm install typescript -g

# Build the app
RUN npm run build

# Stage 2: Create a lightweight production image
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm install --omit=dev

# Copy the built app from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js

# Set environment variables for Next.js
ENV NODE_ENV=production
ENV PORT=3006

# Expose the desired port
EXPOSE 3006

# Start the Next.js app
CMD ["npm", "start"]
