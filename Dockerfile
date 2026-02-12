# Stage 1: Build frontend
FROM node:20-slim AS frontend-build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build backend
FROM node:20-slim AS backend-build
WORKDIR /app/server
COPY server/package.json server/package-lock.json* ./
RUN npm ci
COPY server/ .
RUN npx tsc || true

# Stage 3: Production
FROM node:20-slim
RUN apt-get update && apt-get install -y --no-install-recommends dumb-init && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend
COPY --from=backend-build /app/server/node_modules ./server/node_modules
COPY --from=backend-build /app/server/src ./server/src
COPY server/package.json ./server/

# Copy frontend build
COPY --from=frontend-build /app/dist ./client

# Create directories
RUN mkdir -p data uploads

ENV NODE_ENV=production
ENV PORT=3001
ENV DB_PATH=./data/survey.db
ENV UPLOADS_DIR=./uploads
ENV CLIENT_DIR=./client

EXPOSE 3001

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--import", "tsx", "server/src/index.ts"]
