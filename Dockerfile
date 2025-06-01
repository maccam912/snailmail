# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production dependencies stage
FROM node:20-alpine AS prod-deps

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Production stage - Use distroless Node.js
FROM gcr.io/distroless/nodejs20-debian12

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/public ./public # Ensure this picks up changes

# Copy only production dependencies
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json

# Expose the port that Colyseus uses
EXPOSE 2567

# Set production environment
ENV NODE_ENV=production

# OpenTelemetry tracing environment variables (can be overridden at runtime)
ENV TRACING_ENABLED=false
ENV TRACE_EXPORTER=otlp
ENV OTLP_ENDPOINT=http://localhost:4318/v1/traces

# Start the server
CMD ["build/index.js"]