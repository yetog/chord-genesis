# Dockerfile Template for Vite Apps
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build args for base path configuration
ARG VITE_BASE_PATH=/chord-genesis/
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

# Build args for ElevenLabs API key
ARG VITE_ELEVENLABS_API_KEY=sk_8e01678d62936838bc440a754e187457811e36b93613dca6
ENV VITE_ELEVENLABS_API_KEY=${VITE_ELEVENLABS_API_KEY}

# Build the application
RUN npm run build

# Production stage with nginx
FROM nginx:alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for proper MIME types
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]