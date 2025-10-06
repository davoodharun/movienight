# Build stage for client
FROM node:18-alpine as client-build
WORKDIR /app/client
COPY src/client/package*.json ./
RUN npm ci --only=production
COPY src/client/ ./
RUN npm run build

# Build stage for server
FROM node:18-alpine as server-build
WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --only=production
COPY src/server/ ./src/server/
COPY src/shared/ ./src/shared/
RUN npm run build:server

# Production stage
FROM node:18-alpine
WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy built server
COPY --from=server-build /app/dist ./dist

# Copy built client
COPY --from=client-build /app/client/build ./dist/client/dist

# Create data directory
RUN mkdir -p data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/server.js"]
