require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Get Vehicles Integration Tests (GET /api/vehicles)', () => {
  let token;

  // Set up connection, seed a test user, and log in to get a valid JWT
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing in the .env file.');
    }
    await mongoose.connect(mongoURI);

    // Register clean user
    await User.deleteMany({});
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Vehicle Reader',
      email: 'reader@test.com',
      password: hashedPassword,
      role: 'user'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'reader@test.com', password: 'password123' });

    token = loginResponse.body.token;
  }, 30000);

  // Close connection after tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  // Reset vehicle collection before each test runs
  beforeEach(async () => {
    await Vehicle.deleteMany({});
  }, 30000);

  /**
   * Test Case A: Successfully fetch all vehicles
   * Asserts that sending a request with a valid JWT when vehicles exist in the inventory
   * returns a 200 OK status, success flag, correct count of items, and the array of seeded vehicles.
   */
  it('should successfully fetch all vehicles from the database', async () => {
    // Seed test vehicles
    await Vehicle.create([
      { make: 'Toyota', model: 'Fortuner', category: 'SUV', price: 4200000, quantity: 5 },
      { make: 'Honda', model: 'City', category: 'Sedan', price: 1500000, quantity: 10 },
      { make: 'Tata', model: 'Nexon', category: 'SUV', price: 1200000, quantity: 8 }
    ]);

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 3,
      vehicles: [
        expect.objectContaining({ make: 'Toyota', model: 'Fortuner', category: 'SUV', price: 4200000, quantity: 5 }),
        expect.objectContaining({ make: 'Honda', model: 'City', category: 'Sedan', price: 1500000, quantity: 10 }),
        expect.objectContaining({ make: 'Tata', model: 'Nexon', category: 'SUV', price: 1200000, quantity: 8 })
      ]
    });
  });

  /**
   * Test Case B: Return an empty array when no vehicles exist
   * Asserts that sending a request with a valid JWT when no vehicle documents exist
   * returns a 200 OK status, success flag, count of 0, and an empty vehicles array.
   */
  it('should return count 0 and an empty array when no vehicles are registered', async () => {
    // Assure database is clean
    await Vehicle.deleteMany({});

    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 0,
      vehicles: []
    });
  });

  /**
   * Test Case C: Request without JWT
   * Asserts that attempting to hit the route without the Authorization header returns 401 Unauthorized.
   */
  it('should return a 401 status if the Authorization header is missing', async () => {
    const response = await request(app)
      .get('/api/vehicles');

    expect(response.status).toBe(401);
  });

  /**
   * Test Case D: Request with invalid JWT
   * Asserts that passing a malformed or invalid JWT returns 401 Unauthorized.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .get('/api/vehicles')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(401);
  });

});
