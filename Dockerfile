FROM node:22-slim

# Install OpenSSL for Prisma, curl/wget for healthchecks and downloads, and python3
RUN apt-get update -y && apt-get install -y openssl curl wget python3 && rm -rf /var/lib/apt/lists/*

# Install the absolute latest yt-dlp directly from GitHub (bypassing outdated apt packages)
RUN wget https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -O /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp

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
