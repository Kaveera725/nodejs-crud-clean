const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const Product = require('../src/models/product.model');

// Mock MongoDB connection
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-db';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Product.deleteMany({});
});

describe('Health Endpoint', () => {
  it('GET /health - should return status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});

describe('Product CRUD Operations', () => {
  const sampleProduct = {
    name: 'Test Product',
    price: 99.99,
    quantity: 10
  };

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .send(sampleProduct);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', sampleProduct.name);
      expect(res.body.data).toHaveProperty('price', sampleProduct.price);
      expect(res.body.data).toHaveProperty('quantity', sampleProduct.quantity);
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Incomplete Product' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for negative price', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Bad Product', price: -10, quantity: 5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      await Product.create(sampleProduct);
      await Product.create({ name: 'Product 2', price: 50, quantity: 20 });

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data).toHaveLength(2);
    });

    it('should return empty array when no products exist', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product by ID', async () => {
      const product = await Product.create(sampleProduct);

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', sampleProduct.name);
    });

    it('should return 404 for non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for invalid ID format', async () => {
      const res = await request(app).get('/api/products/invalid-id');

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const product = await Product.create(sampleProduct);
      const updatedData = { name: 'Updated Product', price: 150, quantity: 25 };

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send(updatedData);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('name', updatedData.name);
      expect(res.body.data).toHaveProperty('price', updatedData.price);
    });

    it('should return 404 for updating non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ name: 'Updated', price: 100, quantity: 5 });

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const product = await Product.create(sampleProduct);

      const res = await request(app).delete(`/api/products/${product._id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);

      const found = await Product.findById(product._id);
      expect(found).toBeNull();
    });

    it('should return 404 for deleting non-existent product', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/products/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
});

describe('404 Handler', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/unknown-route');

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Route not found');
  });
});
