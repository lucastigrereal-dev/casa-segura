# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace packages
COPY packages/ ./packages/
COPY apps/web-admin/ ./apps/web-admin/

# Install dependencies
RUN npm install

# Build the app
RUN npm run build --workspace=@casa-segura/web-admin

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web-admin/.next ./apps/web-admin/.next
COPY --from=builder /app/apps/web-admin/public ./apps/web-admin/public
COPY --from=builder /app/apps/web-admin/package.json ./apps/web-admin/
COPY --from=builder /app/apps/web-admin/next.config.js* ./apps/web-admin/

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace=@casa-segura/web-admin"]
