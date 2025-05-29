# Use Node.js official image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY src ./src

# Install npm globally to latest version
RUN npm install -g npm@11.4.1

# Install dependencies including workspaces
RUN npm install --include=workspace

# Install production dependencies only
RUN npm ci --only=production --include=workspace

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/http/server.js"]