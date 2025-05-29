# Use Node.js official image
FROM node:20-alpine

# Error: Cannot find module '/app/src/http/server.js'

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY src ./src

# Install npm globally to latest version
RUN npm install -g npm@11.4.1

# Install workspace dependencies
RUN npm install

# Install production dependencies only
RUN npm ci --omit=dev

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/http/server.ts"]