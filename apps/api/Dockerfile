# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy all workspace packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all dependencies
RUN npm install

# Build database package (generates Prisma client + compiles TypeScript)
RUN npm run build --workspace=@casa-segura/database

# Build shared package
RUN npm run build --workspace=@casa-segura/shared || true

# Build the API
RUN npm run build --workspace=@casa-segura/api

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/database/package.json ./packages/database/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/node_modules ./node_modules
# Remove old symlink references to workspaces
RUN rm -rf ./node_modules/@casa-segura/database ./node_modules/@casa-segura/shared

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Start the application
CMD ["node", "apps/api/dist/main.js"]
