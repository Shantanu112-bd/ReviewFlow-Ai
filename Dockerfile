FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
# Install Prisma required dependencies (OpenSSL)
RUN apk add --no-cache openssl
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript for the worker script
# Since we execute worker.ts via tsx, we just ensure dependencies are present.
# However, if we wanted to precompile, we'd do it here. For simplicity and 
# robustness with tsx in production, we rely on the deps phase.

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install openssl for prisma runtime
RUN apk add --no-cache openssl

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Expose port (not strictly needed for pure worker, but good convention)
EXPOSE 3000
ENV PORT=3000

# Start the worker process
CMD ["npm", "run", "start:worker"]
