## Frontend Dockerfile - builds React (Vite) app and serves the production build via nginx
## Multi-stage build:
##  - Stage 1 (builder): install deps and run `npm run build` to produce static assets.
##  - Stage 2 (runtime): use a small nginx image and only copy the built files + a minimal config.
##
## This keeps the final image small and production-optimized: no source code, no Node, only nginx + static files.

# ----------------------
# Stage 1: Build the app
# ----------------------
FROM node:20-alpine AS build

# Set working directory for the build stage
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy dependency manifests first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install dependencies (dev deps included because we need the build toolchain)
RUN npm install

# Copy the rest of the frontend source
COPY . .

# Build optimized static assets for production
RUN npm run build

# -------------------------
# Stage 2: nginx web server
# -------------------------
FROM nginx:1.27-alpine

# Copy the built static files from the builder stage into nginx's default html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Remove default nginx config and replace with a minimal one for SPA routing
RUN rm /etc/nginx/conf.d/default.conf

# Simple nginx config to serve the React SPA and support client-side routing
COPY <<'EOF' /etc/nginx/conf.d/hostelops.conf
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Expose port 80 for HTTP traffic (frontend)
EXPOSE 80

# Use the default nginx startup command
CMD ["nginx", "-g", "daemon off;"]

