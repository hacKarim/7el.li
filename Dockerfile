FROM node:25-alpine

WORKDIR /app

# Install dependencies for canvas
RUN apk add --no-cache \
    cairo-dev \
    pango-dev \
    jpeg-dev \
    giflib-dev \
    librsvg-dev \
    pixman-dev \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application (skip env validation during build)
ENV SKIP_ENV_VALIDATION=true
RUN npm run build

# Create uploads directory
RUN mkdir -p ./public/uploads

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]