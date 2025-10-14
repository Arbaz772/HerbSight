# ---------- Stage 1: Build the app ----------
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (uses package-lock.json if present)
COPY package*.json ./
RUN npm ci --silent

# Copy source and run build
COPY . .
RUN npm run build

# Normalize build output into /app/out so the next stage can copy reliably
RUN set -eux; \
    if [ -d "dist" ]; then \
      rm -rf /app/out && mkdir -p /app/out && cp -a dist/. /app/out/; \
    elif [ -d "build" ]; then \
      rm -rf /app/out && mkdir -p /app/out && cp -a build/. /app/out/; \
    else \
      echo "ERROR: build output not found (expected 'dist/' or 'build/')"; exit 1; \
    fi

# ---------- Stage 2: Serve with nginx ----------
FROM nginx:stable-alpine AS prod

# Clear default nginx html and copy the built static files
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/out /usr/share/nginx/html

# Expose container port 80 (host nginx will proxy to this)
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- --spider http://localhost:80/ || exit 1

# Run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
