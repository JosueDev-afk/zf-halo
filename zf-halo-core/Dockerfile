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

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/@generated ./node_modules/@generated

EXPOSE 3000

CMD ["node", "dist/src/main"]
