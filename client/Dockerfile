# Multi-stage build for optimal production deployment
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the SvelteKit application
RUN npm run build

# Production stage - smaller runtime image
FROM node:20-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S sveltekit -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application from build stage
COPY --from=build --chown=sveltekit:nodejs /app/build ./build

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Environment variables for production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "build"] 