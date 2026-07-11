require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Purchase Vehicle Integration Tests (PATCH /api/vehicles/:id/purchase)', () => {
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
      name: 'Vehicle Purchaser',
      email: 'purchaser@test.com',
      password: hashedPassword,
      role: 'user'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'purchaser@test.com', password: 'password123' });

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
      make: 'Mahindra',
      model: 'Thar',
      category: 'SUV',
      price: 1600000,
      quantity: 5
    });
  }, 30000);

  // ==========================================
  // SUCCESSFUL CASES
  // ==========================================

  /**
   * Asserts that sending a request to purchase 1 vehicle
   * returns a 200 status, success flag, and reduces the stock quantity to 4.
   */
  it('should successfully purchase one vehicle and reduce quantity by 1', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Vehicle purchased successfully',
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        quantity: 4
      })
    });

    // Verify quantity reduction is persisted in the database
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.quantity).toBe(4);
  });

  /**
   * Asserts that sending a request to purchase multiple vehicles (e.g. 3)
   * returns a 200 status, success flag, and reduces the stock quantity to 2.
   */
  it('should successfully purchase multiple vehicles and reduce quantity correctly', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 3 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Vehicle purchased successfully',
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        quantity: 2
      })
    });

    // Verify quantity reduction in database
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.quantity).toBe(2);
  });

  // ==========================================
  // VALIDATION CASES
  // ==========================================

  /**
   * Asserts that attempting to purchase a vehicle that does not exist returns 404.
   */
  it('should return a 404 status if the vehicle ID does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .patch(`/api/vehicles/${nonExistentId}/purchase`)
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
      .patch(`/api/vehicles/${invalidId}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a request body without the quantity property returns 400.
   */
  it('should return a 400 status if the purchase quantity is missing', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a purchase quantity of zero returns 400.
   */
  it('should return a 400 status if the purchase quantity is zero', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 0 });

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending a negative purchase quantity returns 400.
   */
  it('should return a 400 status if the purchase quantity is negative', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: -1 });

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that requesting a purchase quantity greater than available stock returns 400.
   */
  it('should return a 400 status if the purchase quantity exceeds available stock', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 6 }); // Available: 5

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that attempting to purchase when the vehicle stock is already zero returns 400.
   */
  it('should return a 400 status if the vehicle stock is already zero', async () => {
    // Manually set quantity to 0
    await Vehicle.findByIdAndUpdate(testVehicle._id, { quantity: 0 });

    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`)
      .send({ quantity: 1 });

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
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .send({ quantity: 1 });

    expect(response.status).toBe(401);
  });

  /**
   * Asserts that requesting with a malformed JWT returns 401.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .patch(`/api/vehicles/${testVehicle._id}/purchase`)
      .set('Authorization', 'Bearer invalidtoken123')
      .send({ quantity: 1 });

    expect(response.status).toBe(401);
  });

});
