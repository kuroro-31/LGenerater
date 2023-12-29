# Dockerfile
# https://hub.docker.com/_/node
FROM node:lts-buster-slim

# Set the working directory
WORKDIR /app

# Install openssl（prismaで使用するため）, make
RUN apt-get update -y && apt-get install -y openssl && apt-get install -y make

# Copy package.json and package-lock.json
COPY package*.json ./

# Clear npm cache and install dependencies
RUN npm cache clean --force && npm install

# Copy local code to the container image.
COPY . ./