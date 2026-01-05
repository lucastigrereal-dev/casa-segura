# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/web-client/ ./apps/web-client/

# Install dependencies
RUN npm install

# Build the app
RUN npm run build --workspace=@casa-segura/web-client

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web-client/.next ./apps/web-client/.next
COPY --from=builder /app/apps/web-client/public ./apps/web-client/public
COPY --from=builder /app/apps/web-client/package.json ./apps/web-client/
COPY --from=builder /app/apps/web-client/next.config.js* ./apps/web-client/

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@casa-segura/web-client"]
