# Use Node.js official image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./

COPY tsconfig.json ./
COPY src ./src
RUN npm install

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]
