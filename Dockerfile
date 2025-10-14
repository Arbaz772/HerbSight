# ---------- Stage 1: Build the app ----------
FROM node:20-alpine AS build
WORKDIR /app

# optionally pass NPM token if you need to access private packages
ARG NPM_TOKEN
ENV NPM_TOKEN=${NPM_TOKEN}

# copy package manifest(s) first for layer caching
COPY package.json package-lock.json* ./

# if you use .npmrc for tokenless registries, copy it here (optional)
# COPY .npmrc ./

# Install dependencies:
# - prefer npm ci when lockfile present
# - fall back to npm install otherwise
# - run with verbose logging so build errors are visible
RUN set -eux; \
    if [ -f package-lock.json ]; then \
      echo "Using npm ci (package-lock.json found)"; \
      npm ci --prefer-offline --no-audit --loglevel=verbose; \
    else \
      echo "package-lock.json not found — using npm install"; \
      npm install --no-audit --loglevel=verbose; \
    fi

# copy rest of source & build
COPY . .
RUN npm run build

# normalize build output
RUN set -eux; \
    if [ -d "dist" ]; then \
      rm -rf /app/out && mkdir -p /app/out && cp -a dist/. /app/out/; \
    elif [ -d "build" ]; then \
      rm -rf /app/out && mkdir -p /app/out && cp -a build/. /app/out/; \
    else \
      echo "ERROR: build output not found (expected 'dist/' or 'build/')"; exit 1; \
    fi
