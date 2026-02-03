# AWS EC2 Deployment Guide

Complete guide to deploy this Node.js CRUD application on AWS EC2 with GitHub Actions CI/CD.

## 📋 Prerequisites

- AWS Account
- GitHub Account
- MongoDB Atlas Account (with connection string)
- SSH Key Pair for EC2
- Domain name (optional)

---

## 🚀 Deployment Steps

### Step 1: Launch EC2 Instance

1. **Go to AWS Console** → EC2 → Launch Instance

2. **Configure Instance:**
   - **Name:** nodejs-crud-app
   - **AMI:** Ubuntu Server 22.04 LTS (or Amazon Linux 2023)
   - **Instance Type:** t2.micro (Free tier eligible)
   - **Key Pair:** Create new or use existing (download .pem file)
   - **Network Settings:**
     - Allow SSH (port 22) - from your IP
     - Allow HTTP (port 80) - from anywhere (0.0.0.0/0)
     - Allow HTTPS (port 443) - from anywhere (optional)
   - **Storage:** 8 GB (default)

3. **Launch Instance** and note the **Public IP address**

---

### Step 2: Connect to EC2 Instance

```bash
# Windows (using PowerShell or Git Bash)
ssh -i "your-key.pem" ubuntu@your-ec2-public-ip

# Or use PuTTY on Windows
```

---

### Step 3: Setup EC2 Server

Once connected to EC2, run these commands:

#### 3.1 Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### 3.2 Install Docker
```bash
# Install Docker
sudo apt install docker.io -y

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER

# Apply group changes
newgrp docker

# Verify Docker installation
docker --version
```

#### 3.3 Install Docker Compose
```bash
# Download Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Make it executable
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker-compose --version
```

#### 3.4 Install Git
```bash
sudo apt install git -y
git --version
```

---

### Step 4: Clone Repository on EC2

```bash
# Navigate to home directory
cd ~

# Clone your repository
git clone https://github.com/YOUR_USERNAME/nodejs-crud-ec2.git

# Navigate to project
cd nodejs-crud-ec2
```

---

### Step 5: Configure Environment Variables

```bash
# Create .env file
nano .env

# Add these contents (press Ctrl+X, then Y, then Enter to save):
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/YOUR_DATABASE?retryWrites=true&w=majority
```

**Important:** Replace with your actual MongoDB Atlas connection string!

---

### Step 6: Deploy with Docker

```bash
# Build and start containers
docker-compose up -d --build

# Check if containers are running
docker ps

# View logs
docker-compose logs -f

# Test health endpoint
curl http://localhost/health
```

You should see: `{"status":"ok"}`

---

### Step 7: Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on **Network Access** → **Add IP Address**
3. Add **0.0.0.0/0** (allow from anywhere) or add your EC2's public IP
4. This allows your EC2 instance to connect to MongoDB

---

### Step 8: Test Your Application

Open browser and visit:
```
http://YOUR_EC2_PUBLIC_IP
```

You should see your Product Management Dashboard!

**API Endpoints:**
- Health: `http://YOUR_EC2_PUBLIC_IP/health`
- Products: `http://YOUR_EC2_PUBLIC_IP/api/products`

---

## 🔄 Setup GitHub Actions CI/CD (Automated Deployment)

### Step 1: Prepare SSH Key

On your local machine:

```bash
# Open your EC2 private key file (.pem)
# Copy the ENTIRE contents including:
# -----BEGIN RSA PRIVATE KEY-----
# ...content...
# -----END RSA PRIVATE KEY-----
```

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these 4 secrets:

| Secret Name | Value | Example |
|-------------|-------|---------|
| `EC2_HOST` | Your EC2 public IP | `54.123.45.67` |
| `EC2_USER` | SSH username | `ubuntu` (or `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | Your private key content | (entire .pem file content) |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |

### Step 3: Push Code to GitHub

```bash
# On your local machine
cd nodejs-crud-ec2

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add remote (create repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/nodejs-crud-ec2.git

# Push to main branch
git push -u origin main
```

### Step 4: Verify GitHub Actions

1. Go to your GitHub repository
2. Click on **Actions** tab
3. You should see the deployment workflow running
4. Wait for it to complete (green checkmark ✅)

### Step 5: Test Automated Deployment

Make a small change and push:

```bash
# Edit a file
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test automated deployment"
git push

# GitHub Actions will automatically:
# 1. Run tests
# 2. SSH into EC2
# 3. Pull latest code
# 4. Rebuild Docker containers
# 5. Restart the application
```

---

## 🔧 Useful Commands on EC2

### View Application Logs
```bash
cd ~/nodejs-crud-ec2
docker-compose logs -f
```

### Restart Application
```bash
docker-compose restart
```

### Stop Application
```bash
docker-compose down
```

### Start Application
```bash
docker-compose up -d
```

### Rebuild Application
```bash
docker-compose up -d --build
```

### Check Container Status
```bash
docker ps
```

### Pull Latest Code Manually
```bash
cd ~/nodejs-crud-ec2
git pull origin main
docker-compose up -d --build
```

### Check System Resources
```bash
# CPU and Memory usage
htop

# Disk space
df -h

# Docker disk usage
docker system df
```

---

## 🔒 Security Best Practices

### 1. Update Security Group Rules
- Restrict SSH (port 22) to your IP only
- Keep HTTP (port 80) open to all (0.0.0.0/0)

### 2. Setup Firewall (UFW)
```bash
# Enable firewall
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (optional)
sudo ufw enable
sudo ufw status
```

### 3. Setup SSL/HTTPS (Optional but Recommended)

#### Using Nginx + Let's Encrypt:

```bash
# Install Nginx
sudo apt install nginx -y

# Configure Nginx as reverse proxy
sudo nano /etc/nginx/sites-available/nodejs-app

# Add this configuration:
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/nodejs-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 4. Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker-compose pull
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Application Not Accessible
```bash
# Check if containers are running
docker ps

# Check logs
docker-compose logs

# Restart
docker-compose restart
```

### MongoDB Connection Error
- Verify MONGO_URI in .env file
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0)
- Test connection from EC2:
```bash
docker-compose logs | grep MongoDB
```

### Port Already in Use
```bash
# Check what's using port 80
sudo lsof -i :80

# Kill the process
sudo kill -9 <PID>
```

### GitHub Actions Deployment Failed
- Check GitHub Actions logs in repository
- Verify all secrets are correctly set
- Test SSH connection manually:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

---

## 📊 Monitoring

### Check Application Health
```bash
curl http://localhost/health
```

### Monitor Docker Containers
```bash
docker stats
```

### View System Logs
```bash
# Docker logs
docker-compose logs -f

# System logs
sudo journalctl -u docker -f
```

---

## 💰 Cost Optimization

1. **Use t2.micro** (Free tier: 750 hours/month for 12 months)
2. **Stop instance when not in use** (AWS Console → EC2 → Stop Instance)
3. **Use MongoDB Atlas Free Tier** (512 MB storage)
4. **Monitor AWS billing** (Set up billing alerts)

---

## 🎯 Quick Reference

### Your Application URLs
- **Frontend:** `http://YOUR_EC2_IP/`
- **Health Check:** `http://YOUR_EC2_IP/health`
- **API:** `http://YOUR_EC2_IP/api/products`

### SSH Command
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
```

### Project Directory on EC2
```bash
cd ~/nodejs-crud-ec2
```

### Quick Redeploy
```bash
cd ~/nodejs-crud-ec2
git pull
docker-compose up -d --build
```

---

## ✅ Deployment Checklist

- [ ] EC2 instance created and running
- [ ] Security group configured (ports 22, 80 open)
- [ ] SSH key downloaded and accessible
- [ ] Connected to EC2 via SSH
- [ ] Docker and Docker Compose installed
- [ ] Git installed
- [ ] Repository cloned on EC2
- [ ] .env file created with correct MONGO_URI
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Application running (docker-compose up -d)
- [ ] Health check passing (curl http://localhost/health)
- [ ] Application accessible from browser
- [ ] GitHub repository created
- [ ] GitHub secrets configured (EC2_HOST, EC2_USER, EC2_SSH_KEY, MONGO_URI)
- [ ] Code pushed to GitHub
- [ ] GitHub Actions workflow running successfully
- [ ] Automated deployment tested

---

## 📚 Additional Resources

- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

Need help? Check the [README.md](README.md) for API documentation and local development setup.
