# Stage 1: Build the React application
FROM node:20-alpine AS builder

ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

ARG VITE_CONVEX_URL
ENV VITE_CONVEX_URL=$VITE_CONVEX_URL

WORKDIR /app

# Install dependencies using package files
COPY package*.json ./
RUN npm ci

# Copy the rest of the project source files
COPY . .

# Build the app (Vite bakes these in)
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Copy built static files from the builder stage into Nginx's public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration to handle routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for web traffic
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]