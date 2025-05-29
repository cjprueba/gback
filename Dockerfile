# Use Node.js official image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]