# Use Node.js official image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package files first (for better Docker layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client BEFORE copying source code
RUN npx prisma generate

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src

# Create npm cache directory with proper permissions
RUN mkdir -p /.npm && chown -R node:node /.npm

# Switch to node user (built-in non-root user)
USER node

# Expose the port Fastify runs on
EXPOSE 3000

# Start the application in dev mode
CMD ["npm", "run", "dev"]
