# Use Node.js 18 on Alpine Linux as the base image
FROM node:18-alpine

# Install build dependencies needed by node-gyp for bcrypt
RUN apk add --no-cache python3 make g++

# Set the working directory in the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the entire application code
COPY . .

# Rebuild bcrypt specifically for the container's architecture
RUN npm rebuild bcrypt --build-from-source

# Expose the port the app runs 
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
