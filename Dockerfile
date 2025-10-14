# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --prefer-offline --no-audit; else npm install --no-audit; fi

COPY . .
RUN npm run build

# Stage 2: nginx
FROM nginx:stable-alpine
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
