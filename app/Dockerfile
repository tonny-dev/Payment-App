# Use Node.js 18 LTS as base image
FROM node:18-alpine

# Install necessary packages for React Native
RUN apk add --no-cache \
    watchman \
    openjdk11-jre \
    android-tools \
    git \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S reactnative
RUN adduser -S reactnative -u 1001

# Change ownership of the app directory
RUN chown -R reactnative:reactnative /app
USER reactnative

# Expose Metro bundler port
EXPOSE 8081

# Expose React Native debugger port
EXPOSE 8097

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8081/status || exit 1

# Start Metro bundler
CMD ["npm", "start", "--", "--host", "0.0.0.0"]
