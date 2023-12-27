# Dockerfile
# https://hub.docker.com/_/node
FROM node:lts-buster-slim

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && npm install

# Copy local code to the container image.
COPY . ./