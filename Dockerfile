FROM node:22-slim

# Install OpenSSL for Prisma and curl for healthchecks
RUN apt-get update -y && apt-get install -y openssl curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci || npm install

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the frontend
RUN npm run build

# Expose port (Internal container port)
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production

# Start the application
CMD ["/app/start.sh"]
