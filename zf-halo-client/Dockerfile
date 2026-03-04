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
RUN pnpm build

# Stage 2: Serve
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Install ping/nslookup utility if not present
RUN apk add --no-cache bind-tools curl

CMD ["sh", "-c", "echo 'Waiting for backend...' && while ! ping -c 1 zf-core; do sleep 2; done; echo 'Backend is up, starting Nginx...' && nginx -g 'daemon off;'"]
