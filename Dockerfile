# syntax=docker/dockerfile:1

# ==========================================
# Stage 1: Build React 19 Frontend
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /build/prototype

# Copy dependency manifests first for Docker layer caching
COPY prototype/package*.json ./
RUN npm ci

# Copy prototype source and build production assets
COPY prototype/ ./
RUN npm run build

# ==========================================
# Stage 2: Minimal Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3080

# Create unraid next user
RUN addgroup -S unraid && adduser -S unraid -G unraid

# Copy server code
COPY server/ ./server/

# Copy built frontend into server/public
COPY --from=builder /build/prototype/dist ./server/public

# Set ownership
RUN chown -R unraid:unraid /app

# Switch to unraid user (Note: Docker socket access requires docker group if needed, or root)
USER root

EXPOSE 3080

CMD ["node", "server/server.js"]
