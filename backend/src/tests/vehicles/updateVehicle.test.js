require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Update Vehicle Integration Tests (PUT /api/vehicles/:id)', () => {
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
      name: 'Vehicle Updater',
      email: 'updater@test.com',
      password: hashedPassword,
      role: 'admin'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'updater@test.com', password: 'password123' });

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
      make: 'Honda',
      model: 'Civic',
      category: 'Sedan',
      price: 2500000,
      quantity: 3
    });
  }, 30000);

  // ==========================================
  // SUCCESSFUL CASES
  // ==========================================

  /**
   * Asserts that sending a request to update all fields of a vehicle
   * returns a 200 status, success flag, and the updated vehicle object,
   * and verifies the changes are persisted in the database.
   */
  it('should successfully update all fields of a vehicle', async () => {
    const updatedData = {
      make: 'Honda Updated',
      model: 'Civic Pro',
      category: 'Hatchback',
      price: 2800000,
      quantity: 5
    };

    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updatedData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        make: 'Honda Updated',
        model: 'Civic Pro',
        category: 'Hatchback',
        price: 2800000,
        quantity: 5
      })
    });

    // Verify database persistence
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.make).toBe('Honda Updated');
    expect(dbVehicle.price).toBe(2800000);
  });

  /**
   * Asserts that sending a request with only partial update fields
   * returns a 200 status, success flag, and the updated vehicle object,
   * preserving the untouched fields in the database.
   */
  it('should successfully perform partial updates on selected fields', async () => {
    const partialData = {
      price: 2700000,
      quantity: 4
    };

    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(partialData);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      vehicle: expect.objectContaining({
        _id: testVehicle._id.toString(),
        make: 'Honda', // Preserved
        model: 'Civic', // Preserved
        category: 'Sedan', // Preserved
        price: 2700000, // Updated
        quantity: 4 // Updated
      })
    });

    // Verify database state
    const dbVehicle = await Vehicle.findById(testVehicle._id);
    expect(dbVehicle.make).toBe('Honda');
    expect(dbVehicle.price).toBe(2700000);
    expect(dbVehicle.quantity).toBe(4);
  });

  // ==========================================
  // VALIDATION CASES
  // ==========================================

  /**
   * Asserts that attempting to update a vehicle that does not exist returns 404.
   */
  it('should return a 404 status if the vehicle ID does not exist', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const updateData = { price: 3000000 };

    const response = await request(app)
      .put(`/api/vehicles/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(404);
  });

  /**
   * Asserts that passing an invalid format MongoDB ObjectId string returns 400.
   */
  it('should return a 400 status if the vehicle ID is not a valid MongoDB ObjectId', async () => {
    const invalidId = 'invalid-id-string';
    const updateData = { price: 3000000 };

    const response = await request(app)
      .put(`/api/vehicles/${invalidId}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that passing a negative price returns a 400 validation status.
   */
  it('should return a 400 status if the updated price is negative', async () => {
    const updateData = { price: -500 };

    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that passing a negative quantity returns a 400 validation status.
   */
  it('should return a 400 status if the updated quantity is negative', async () => {
    const updateData = { quantity: -2 };

    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send(updateData);

    expect(response.status).toBe(400);
  });

  /**
   * Asserts that sending an empty request body returns 400.
   */
  it('should return a 400 status if the request body is empty', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

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
      .put(`/api/vehicles/${testVehicle._id}`)
      .send({ price: 3000000 });

    expect(response.status).toBe(401);
  });

  /**
   * Asserts that requesting with a malformed JWT returns 401.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .put(`/api/vehicles/${testVehicle._id}`)
      .set('Authorization', 'Bearer invalidtoken123')
      .send({ price: 3000000 });

    expect(response.status).toBe(401);
  });

});
