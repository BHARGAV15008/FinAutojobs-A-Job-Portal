# Multi-stage build for FinAutoJobs Frontend

# Stage 1: Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_URL
ARG VITE_APP_NAME
ARG VITE_APP_VERSION
ARG VITE_CLOUDINARY_CLOUD_NAME
ARG VITE_ENABLE_REAL_TIME_NOTIFICATIONS
ARG VITE_ENABLE_FILE_UPLOADS
ARG VITE_ENABLE_SOCIAL_LOGIN
ARG VITE_NODE_ENV=production

# Set environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_VERSION=$VITE_APP_VERSION
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_ENABLE_REAL_TIME_NOTIFICATIONS=$VITE_ENABLE_REAL_TIME_NOTIFICATIONS
ENV VITE_ENABLE_FILE_UPLOADS=$VITE_ENABLE_FILE_UPLOADS
ENV VITE_ENABLE_SOCIAL_LOGIN=$VITE_ENABLE_SOCIAL_LOGIN
ENV VITE_NODE_ENV=$VITE_NODE_ENV

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy SSL certificates (if using HTTPS)
# COPY ssl/ /etc/nginx/ssl/

# Create nginx user and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/share/nginx/html && \
    chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
