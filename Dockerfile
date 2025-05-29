# Use Node.js official image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY src ./src
RUN npm install

# Install production dependencies only
RUN npm ci --only=production

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application
CMD ["node", "src/http/server.js"]