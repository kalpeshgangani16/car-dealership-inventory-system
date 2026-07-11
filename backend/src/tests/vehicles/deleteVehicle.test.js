require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Delete Vehicle Integration Tests (DELETE /api/vehicles/:id)', () => {
  let token;
  let testVehicle;

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
      name: 'Vehicle Deleter',
      email: 'deleter@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'deleter@test.com', password: 'password123' });

    token = loginResponse.body.token;
  }, 30000);

  // Close connection after tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  // Seed a fresh vehicle before each test and clear collection to ensure isolation
  beforeEach(async () => {
    await Vehicle.deleteMany({});

    testVehicle = await Vehicle.create({
      make: 'Ford',
      model: 'Mustang',
      category: 'Sports',
      price: 7500000,
      quantity: 2
    });
  }, 30000);

  // ==========================================
  // SUCCESSFUL CASES
  // ==========================================

  /**
   * Asserts that sending a request to delete an existing vehicle
   * returns a 200 status, success flag, and actually removes the document
   * from the MongoDB database.
   */
  it('should successfully delete an existing vehicle from the database', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Vehicle deleted successfully'
    });

    // Verify database removal
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle).toBeNull();
  });

  // ==========================================
  // VALIDATION CASES
  // ==========================================

  /**
   * Asserts that attempting to delete a vehicle ID that does not exist returns 404.
   */
  it('should return a 404 status if the vehicle ID does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/vehicles/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
  });

  /**
   * Asserts that passing an invalid format MongoDB ObjectId string returns 400.
   */
  it('should return a 400 status if the vehicle ID is not a valid MongoDB ObjectId', async () => {
    const invalidId = 'invalid-id-string';

    const response = await request(app)
      .delete(`/api/vehicles/${invalidId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
  });

  // ==========================================
  // AUTHENTICATION CASES
  // ==========================================

  /**
   * Asserts that requesting without an Authorization header returns 401.
   */
  it('should return a 401 status if the JWT is missing', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${testVehicle._id}`);

    expect(response.status).toBe(401);
  });

  /**
   * Asserts that requesting with a malformed JWT returns 401.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .delete(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(401);
  });

});
