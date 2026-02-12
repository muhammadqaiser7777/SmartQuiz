# Build stage
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to replace the default nginx contents.
# The user specified build output is in dist/browser
COPY --from=build /app/dist/browser /usr/share/nginx/html

EXPOSE 2005

CMD ["nginx", "-g", "daemon off;"]
