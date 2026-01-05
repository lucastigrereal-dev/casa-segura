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

# Generate Prisma client (this creates the types we need)
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma

# Build the API (tsconfig.json has paths configured to resolve workspaces)
RUN npm run build --workspace=@casa-segura/api

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/

ENV NODE_ENV=production
ENV PORT=3333

EXPOSE 3333

# Start the application
CMD ["node", "apps/api/dist/apps/api/src/main.js"]
