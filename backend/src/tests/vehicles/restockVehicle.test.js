require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Restock Vehicle Integration Tests (PATCH /api/vehicles/:id/restock)', () => {
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
      name: 'Vehicle Restocker',
      email: 'restocker@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'restocker@test.com', password: 'password123' });

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
      make: 'Maruti Suzuki',
      model: 'Swift',
      category: 'Hatchback',
      price: 800000,
      quantity: 4
    });
  }, 30000);

  // ==========================================
  // SUCCESSFUL CASES
  // ==========================================

  /**
   * Asserts that sending a request to restock 1 vehicle
   * returns a 200 status, success flag, and increases the stock quantity to 5.
   */
  it('should successfully restock one vehicle and increase quantity by 1', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Vehicle restocked successfully',
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        quantity: 5
      })
    });

    // Verify quantity increase is persisted in the database
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.quantity).toBe(5);
  });

  /**
   * Asserts that sending a request to restock multiple vehicles (e.g. 5)
   * returns a 200 status, success flag, and increases the stock quantity to 9.
   */
  it('should successfully restock multiple vehicles and increase quantity correctly', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 5 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Vehicle restocked successfully',
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        quantity: 9
      })
    });

    // Verify quantity increase in database
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.quantity).toBe(9);
  });

  // ==========================================
  // VALIDATION CASES
  // ==========================================

  /**
   * Asserts that attempting to restock a vehicle that does not exist returns 404.
   */
  it('should return a 404 status if the vehicle ID does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/vehicles/${nonExistentId}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(404);
  });

  /**
   * Asserts that passing an invalid format MongoDB ObjectId string returns 400.
   */
  it('should return a 400 status if the vehicle ID is not a valid MongoDB ObjectId', async () => {
    const invalidId = 'invalid-id-string';

    const response = await request(app)
      .patch(`/api/vehicles/${invalidId}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a request body without the quantity property returns 400.
   */
  it('should return a 400 status if the restock quantity is missing', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a restock quantity of zero returns 400.
   */
  it('should return a 400 status if the restock quantity is zero', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a negative restock quantity returns 400.
   */
  it('should return a 400 status if the restock quantity is negative', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: -1 });

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
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .send({ quantity: 1 });

    expect(response.status).toBe(401);
  });

  /**
   * Asserts that requesting with a malformed JWT returns 401.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/restock`)
      .set('Authorization', 'Bearer invalidtoken123')
      .send({ quantity: 1 });

    expect(response.status).toBe(401);
  });

});
