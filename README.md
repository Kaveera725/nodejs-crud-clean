# Node.js CRUD REST API - EC2 Deployment

A simple Node.js CRUD REST API using Express and MongoDB Atlas, designed for deployment on AWS EC2 with GitHub Actions CI/CD.

## 📋 Features

- RESTful API for Product CRUD operations
- MongoDB Atlas (Cloud Database) integration
- Docker containerization
- GitHub Actions CI/CD pipeline
- Health check endpoint
- Input validation and error handling
- ESLint for code quality
- Jest + Supertest for testing

## 🏗️ Project Structure

```
nodejs-crud-ec2/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   └── product.controller.js
│   ├── models/
│   │   └── product.model.js
│   ├── routes/
│   │   └── product.routes.js
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── tests/
│   └── product.test.js
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD pipeline
├── .env.example
├── .eslintrc.js
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── jest.config.js
├── package.json
└── README.md
```

## 🚀 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/products` | Get all products |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Product Schema

```json
{
  "name": "string (required)",
  "price": "number (required, >= 0)",
  "quantity": "number (required, >= 0)",
  "createdAt": "date (auto)",
  "updatedAt": "date (auto)"
}
```

## 🛠️ Local Development Setup

### Prerequisites

- Node.js >= 18
- MongoDB Atlas account (free tier available)
- npm or yarn

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/nodejs-crud-ec2.git
cd nodejs-crud-ec2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your MongoDB Atlas connection string:

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
```

### 4. Run the application

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm start
```

### 5. Test the API

```bash
# Health check
curl http://localhost:3000/health

# Create a product
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":999.99,"quantity":10}'

# Get all products
curl http://localhost:3000/api/products
```

## 🐳 Docker Setup

### Build and run with Docker Compose

```bash
# Create .env file first
cp .env.example .env
# Edit .env with your MONGO_URI

# Build and run
docker compose up -d --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

The app will be available at `http://localhost` (port 80)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## ☁️ MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or `0.0.0.0/0` for EC2)
5. Get your connection string
6. Replace `<username>`, `<password>`, and `<database>` in the connection string

## 🚀 EC2 Deployment

### Prerequisites on EC2

```bash
# Update system
sudo yum update -y  # Amazon Linux
# or
sudo apt update && sudo apt upgrade -y  # Ubuntu

# Install Docker
sudo yum install docker -y  # Amazon Linux
# or
sudo apt install docker.io -y  # Ubuntu

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
sudo yum install git -y  # Amazon Linux
# or
sudo apt install git -y  # Ubuntu
```

### GitHub Secrets Required

Add these secrets in your GitHub repository (Settings → Secrets → Actions):

| Secret | Description |
|--------|-------------|
| `EC2_HOST` | EC2 public IP or domain |
| `EC2_USER` | SSH username (e.g., `ec2-user`, `ubuntu`) |
| `EC2_SSH_KEY` | Private SSH key content |
| `MONGO_URI` | MongoDB Atlas connection string |

### Manual Deployment

```bash
# SSH into EC2
ssh -i your-key.pem ec2-user@your-ec2-ip

# Clone repository
git clone https://github.com/yourusername/nodejs-crud-ec2.git
cd nodejs-crud-ec2

# Create .env file
echo "PORT=3000" > .env
echo "NODE_ENV=production" >> .env
echo "MONGO_URI=your-mongodb-uri" >> .env

# Build and run
docker compose up -d --build

# Check health
curl http://localhost/health
```

### CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs linting and tests on push to `main`
2. SSHs into EC2
3. Pulls latest code
4. Rebuilds and restarts Docker containers
5. Performs health check

## 📝 API Examples

### Create Product
```bash
curl -X POST http://your-ec2-ip/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15","price":999,"quantity":50}'
```

### Get All Products
```bash
curl http://your-ec2-ip/api/products
```

### Get Single Product
```bash
curl http://your-ec2-ip/api/products/<product-id>
```

### Update Product
```bash
curl -X PUT http://your-ec2-ip/api/products/<product-id> \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone 15 Pro","price":1199,"quantity":30}'
```

### Delete Product
```bash
curl -X DELETE http://your-ec2-ip/api/products/<product-id>
```

## 🔒 Security Considerations

- Use environment variables for sensitive data
- Enable MongoDB Atlas IP whitelist
- Use HTTPS in production (consider AWS ALB or nginx)
- Keep dependencies updated
- Use security groups to restrict EC2 access

## 📄 License

MIT License  
