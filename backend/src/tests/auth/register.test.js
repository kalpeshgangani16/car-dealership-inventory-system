require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Registration Integration Tests (POST /api/auth/register)', () => {
  
  // Set up connection to the MongoDB cluster before starting tests
  beforeAll(async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI environment variable is missing in the .env file.');
    }
    await mongoose.connect(mongoURI);
  }, 30000);

  // Disconnect from MongoDB database after all tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  // Clear User collection before each test to maintain state isolation
  beforeEach(async () => {
    await User.deleteMany({});
  }, 30000);

  /**
   * Test Case A: Successful registration
   * Asserts that sending valid user registration data returns a 201 Created status,
   * a success message, a JWT token, and the created user details (excluding password).
   */
  it('should successfully register a user and return a 201 status and token', async () => {
    const registrationData = {
      name: 'Kalpesh',
      email: 'kalpesh@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      message: 'User registered successfully',
      token: expect.any(String),
      user: {
        id: expect.any(String),
        name: 'Kalpesh',
        email: 'kalpesh@test.com',
        role: 'user'
      }
    });
  });

  /**
   * Test Case B: Missing name
   * Asserts that omitting the "name" field from the payload returns a 400 Bad Request status.
   */
  it('should return a 400 status if name is missing', async () => {
    const registrationData = {
      email: 'kalpesh@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case C: Missing email
   * Asserts that omitting the "email" field from the payload returns a 400 Bad Request status.
   */
  it('should return a 400 status if email is missing', async () => {
    const registrationData = {
      name: 'Kalpesh',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case D: Missing password
   * Asserts that omitting the "password" field from the payload returns a 400 Bad Request status.
   */
  it('should return a 400 status if password is missing', async () => {
    const registrationData = {
      name: 'Kalpesh',
      email: 'kalpesh@test.com'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case E: Invalid email format
   * Asserts that passing an invalid email string returns a 400 Bad Request status.
   */
  it('should return a 400 status if the email format is invalid', async () => {
    const registrationData = {
      name: 'Kalpesh',
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case F: Duplicate email
   * Asserts that trying to register with an email that is already registered returns a 409 Conflict status.
   * We seed the database directly with the existing user to keep this test case independent of endpoint write behavior.
   */
  it('should return a 409 status if the email is already registered', async () => {
    // Seed the database with the conflicting user profile directly
    await User.create({
      name: 'Existing User',
      email: 'kalpesh@test.com',
      password: 'existingpassword123'
    });

    const registrationData = {
      name: 'Kalpesh',
      email: 'kalpesh@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(registrationData);

    expect(response.status).toBe(409);
  });

});
