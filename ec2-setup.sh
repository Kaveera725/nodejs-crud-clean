#!/bin/bash
# EC2 Setup Script - Run this on your EC2 instance

echo "========================================="
echo "Setting up EC2 for Node.js CRUD App"
echo "========================================="

# Update system
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "Installing Docker..."
sudo apt install docker.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "Installing Git..."
sudo apt install git -y

# Verify installations
echo ""
echo "========================================="
echo "Installation Complete!"
echo "========================================="
docker --version
docker-compose --version
git --version

echo ""
echo "⚠️  IMPORTANT: Log out and log back in for Docker permissions to take effect!"
echo "Then run: newgrp docker"
echo ""
echo "Next steps:"
echo "1. Configure GitHub secrets"
echo "2. Push code to GitHub"
echo "3. GitHub Actions will automatically deploy!"
