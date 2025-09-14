# Step 1: Build the React (Vite) app
FROM node:18-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Build the Vite app
RUN npm run build

# Step 2: Serve with Nginx
FROM nginx:alpine

# Copy built app from previous stage to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: overwrite default nginx config (needed if using React Router)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
