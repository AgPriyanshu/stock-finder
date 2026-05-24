# Build stage
FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.13.1 --activate

WORKDIR /app

ARG VITE_API_BASE_URL=https://api.stock-finder.shop
ARG VITE_APP_URL=https://app.stock-finder.shop
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_URL=${VITE_APP_URL}

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production stage
FROM nginx:alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html

COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    listen [::]:80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location = /index.html {
        add_header Cache-Control "no-cache, must-revalidate";
    }

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, must-revalidate";
    }
}
EOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
