# Backend Dockerfile for HostelOps (Node.js + Express)

# 1) Use a small, official Node.js base image suitable for production
FROM node:20-alpine

# 2) Set the working directory inside the container
WORKDIR /app

# 3) Copy only package files first to leverage Docker layer caching
#    This way, `npm install` is only re-run when dependencies change.
COPY package.json package-lock.json* ./

# 4) Install dependencies
#    Use npm ci if package-lock.json exists for reproducible builds.
RUN npm install --omit=dev

# 5) Copy the rest of the backend source code into the image
COPY . .

# 6) Set environment variables (can be overridden at runtime via docker-compose or `docker run -e`)
#    These match the project requirements and are read by the Node app via process.env.*
ENV NODE_ENV=production \
    PORT=5000 \
    DB_HOST=localhost \
    DB_USER=root \
    DB_PASSWORD=password \
    DB_NAME=hostelops \
    JWT_SECRET=changeme

# 7) Expose the port the Express server listens on
EXPOSE 5000

# 8) Define the default command to start the production server
#    Assumes `server.js` is the main entry point.
CMD ["node", "server.js"]

