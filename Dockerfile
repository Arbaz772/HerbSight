# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (package-lock or pnpm/yarn will be used if present)
COPY package*.json ./
# If using pnpm or yarn, copy lockfile(s) and adapt below accordingly
RUN npm ci --silent

# Copy rest of sources and build
COPY . .
# If your project uses VITE, typical build command:
RUN npm run build

# Stage 2: serve with nginx
FROM nginx:stable-alpine AS prod
# Remove default nginx HTML
RUN rm -rf /usr/share/nginx/html/*
# Copy built files from build stage to nginx www dir (adjust if your build output is different, e.g., dist/)
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom nginx config to support SPA routing (optional)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# run nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
