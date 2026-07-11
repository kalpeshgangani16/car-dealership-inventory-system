require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');

describe('User Login Integration Tests (POST /api/auth/login)', () => {

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

  // Clear database and seed a fresh user before each test to maintain state isolation
  beforeEach(async () => {
    await User.deleteMany({});
    
    // Seed standard test user with a hashed password
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Kalpesh',
      email: 'kalpesh@test.com',
      password: hashedPassword,
      role: 'user'
    });
  }, 30000);

  /**
   * Test Case A: Successful Login
   * Asserts that sending correct credentials returns a 200 status, success status,
   * a success message, a JWT token, and the matching user profile details.
   */
  it('should successfully log in a user and return a 200 status and session token', async () => {
    const loginCredentials = {
      email: 'kalpesh@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Login successful',
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
   * Test Case B: Login with email that does not exist
   * Asserts that attempting login with an unregistered email returns a 401 Unauthorized status and a success flag set to false.
   */
  it('should return a 401 status if the email does not exist', async () => {
    const loginCredentials = {
      email: 'nonexistent@test.com',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  /**
   * Test Case C: Login with incorrect password
   * Asserts that attempting login with the wrong password returns a 401 Unauthorized status and a success flag set to false.
   */
  it('should return a 401 status if the password is incorrect', async () => {
    const loginCredentials = {
      email: 'kalpesh@test.com',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  /**
   * Test Case D: Missing email
   * Asserts that omitting the "email" field returns a 400 Bad Request status.
   */
  it('should return a 400 status if email is missing', async () => {
    const loginCredentials = {
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case E: Missing password
   * Asserts that omitting the "password" field returns a 400 Bad Request status.
   */
  it('should return a 400 status if password is missing', async () => {
    const loginCredentials = {
      email: 'kalpesh@test.com'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(400);
  });

  /**
   * Test Case F: Invalid email format
   * Asserts that passing an invalid email string format returns a 400 Bad Request status.
   */
  it('should return a 400 status if the email format is invalid', async () => {
    const loginCredentials = {
      email: 'invalid-email',
      password: 'password123'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(loginCredentials);

    expect(response.status).toBe(400);
  });

});
