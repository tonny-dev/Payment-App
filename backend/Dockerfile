# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies with verbose logging
RUN npm ci && \
    npm install typescript -g

# Copy source code and configuration
COPY src/ ./src/

# Build the application with verbose output
RUN echo "Starting build process..." && \
    npm run build || (echo "Build failed!" && exit 1) && \
    echo "Build completed." && \
    ls -la dist/ || (echo "dist directory not found!" && exit 1)

# Copy source code and configuration
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

# Add non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create necessary directories with proper permissions
RUN mkdir -p /app/logs /app/database && \
    chown -R appuser:appgroup /app

# Create volumes for persistence
VOLUME ["/app/logs", "/app/database"]

# Set environment variables
ENV NODE_ENV=production \
    PORT=3000

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start the application
CMD ["node", "dist/app.js"]
