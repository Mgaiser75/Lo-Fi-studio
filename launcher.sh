#!/bin/bash

# LoFi Studio - Hostinger VPS Launcher
# This script automates the deployment of LoFi Studio using Docker.

set -e

echo "------------------------------------------------"
echo "   LoFi Studio - VPS Deployment Launcher"
echo "------------------------------------------------"

# Check if Docker is installed
if ! [ -x "$(command -v docker)" ]; then
  echo "Error: Docker is not installed. Please install Docker first."
  exit 1
fi

# Check if Docker Compose is installed
if ! [ -x "$(command -v docker-compose)" ]; then
  echo "Error: Docker Compose is not installed. Please install Docker Compose first."
  exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
  echo "Creating .env file..."
  read -p "Enter your Gemini API Key: " gemini_key
  echo "GEMINI_API_KEY=$gemini_key" > .env
  echo ".env file created."
fi

# Build and start the containers
echo "Building and starting LoFi Studio..."
docker-compose up -d --build

echo "------------------------------------------------"
echo "   Deployment Successful!"
echo "   App is running on: http://localhost:8080"
echo "------------------------------------------------"
echo "   To view logs: docker-compose logs -f"
echo "   To stop: docker-compose down"
echo "------------------------------------------------"
