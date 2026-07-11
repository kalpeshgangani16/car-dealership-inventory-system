require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('Create Vehicle Integration Tests (POST /api/vehicles)', () => {
  let token;

  // Set up connection and seed a test user to obtain a JWT for authentication
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing in the .env file.');
    }
    await mongoose.connect(mongoURI);

    // Seed test user directly into the database
    await User.deleteMany({});
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Vehicle Manager',
      email: 'manager@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Obtain JWT via the login endpoint
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'password123' });

    token = loginResponse.body.token;
  }, 30000);

  // Close Mongoose connection after tests finish
  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  // Clear vehicles collection before each test to maintain state isolation
  beforeEach(async () => {
    if (mongoose.connection.db) {
      // Query raw database collection directly to avoid importing a non-existent Vehicle model
      await mongoose.connection.db.collection('vehicles').deleteMany({});
    }
  }, 30000);

  /**
   * Test Case A: Successfully create a vehicle
   * Asserts that sending a valid vehicle payload with a valid JWT returns a 201 Created status,
   * a success flag, and the created vehicle details including a generated _id.
   */
  it('should successfully create a vehicle with a valid JWT and payload', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      vehicle: {
        _id: expect.any(String),
        make: 'Tesla',
        model: 'Model 3',
        category: 'Sedan',
        price: 45000,
        quantity: 5
      }
    });
  });

  /**
   * Test Case B: Missing make
   * Asserts that omitting the "make" parameter returns a 400 Bad Request status.
   */
  it('should return a 400 status if make is missing', async () => {
    const vehicleData = {
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case C: Missing model
   * Asserts that omitting the "model" parameter returns a 400 Bad Request status.
   */
  it('should return a 400 status if model is missing', async () => {
    const vehicleData = {
      make: 'Tesla',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case D: Missing category
   * Asserts that omitting the "category" parameter returns a 400 Bad Request status.
   */
  it('should return a 400 status if category is missing', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case E: Missing price
   * Asserts that omitting the "price" parameter returns a 400 Bad Request status.
   */
  it('should return a 400 status if price is missing', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case F: Missing quantity
   * Asserts that omitting the "quantity" parameter returns a 400 Bad Request status.
   */
  it('should return a 400 status if quantity is missing', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case G: Invalid price
   * Asserts that passing an invalid price format (negative number or invalid data type) returns a 400 Bad Request status.
   */
  it('should return a 400 status if the price is invalid (negative or non-number)', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: -100, // Invalid negative price
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case H: Invalid quantity
   * Asserts that passing an invalid quantity format (negative integer or invalid data type) returns a 400 Bad Request status.
   */
  it('should return a 400 status if the quantity is invalid (negative or non-number)', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: -5 // Invalid negative quantity
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(vehicleData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case I: Missing JWT
   * Asserts that attempting to hit the endpoint without passing a JWT returns a 401 Unauthorized status.
   */
  it('should return a 401 status if the Authorization header is missing', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .send(vehicleData);

    expect(response.status).toBe(401);
  });

  /**
   * Test Case J: Invalid JWT
   * Asserts that attempting to hit the endpoint with an invalid or malformed JWT returns a 401 Unauthorized status.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const vehicleData = {
      make: 'Tesla',
      model: 'Model 3',
      category: 'Sedan',
      price: 45000,
      quantity: 5
    };

    const response = await request(app)
      .post('/api/vehicles')
      .set('Authorization', 'Bearer invalidtoken123')
      .send(vehicleData);

    expect(response.status).toBe(401);
  });

});
