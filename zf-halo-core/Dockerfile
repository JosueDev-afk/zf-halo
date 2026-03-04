# Stage 1: Build
FROM node:20-alpine AS builder

# Enable pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Dummy URL for prisma generate (not used at runtime)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate
RUN pnpm build
RUN npx tsc prisma/seed.ts --outDir dist/prisma --skipLibCheck --module commonjs --target es2022 --esModuleInterop --resolveJsonModule

# Stage 2: Run
FROM node:20-alpine

WORKDIR /app

# Enable pnpm for runtime (if needed for scripts, though node usually enough for dist)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Install prod dependencies only
RUN pnpm install --prod --frozen-lockfile

# Install prisma CLI + dotenv for migrations (needed to run prisma migrate deploy)
RUN pnpm add prisma dotenv

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@generated ./node_modules/@generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

RUN rm -f .env prisma/.env

EXPOSE 3000

CMD ["sh", "-c", "export DATABASE_URL=${DATABASE_URL} && pnpm prisma migrate deploy && (node dist/prisma/seed.js || true) && node dist/src/main"]
