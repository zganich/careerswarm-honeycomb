# Production Dockerfile for CareerSwarm
# Uses Node 20 (required by Vite 7)

FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the app (Vite frontend + esbuild server)
RUN pnpm run build

# --- Production stage ---
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy built artifacts, migration scripts, and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Railway injects PORT; default to 3000
ENV PORT=3000
ENV NODE_ENV=production

# Run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 careerswarm
USER careerswarm

EXPOSE 3000

# Run migrations in background then start server (so healthcheck passes)
CMD ["sh", "-c", "node scripts/run-migrate.mjs & exec node --experimental-global-webcrypto dist/index.js"]
