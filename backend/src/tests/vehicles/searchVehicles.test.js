require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User');
const Vehicle = require('../../models/Vehicle');

describe('Search Vehicles Integration Tests (GET /api/vehicles/search)', () => {
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
      name: 'Vehicle Searcher',
      email: 'searcher@test.com',
      password: hashedPassword,
      role: 'user'
    });

    // Obtain JWT via login
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'searcher@test.com', password: 'password123' });

    token = loginResponse.body.token;
  }, 30000);

  // Close connection after tests complete
  afterAll(async () => {
    await mongoose.connection.close();
  }, 30000);

  // Seed vehicles database before each test and clear it to ensure state isolation
  beforeEach(async () => {
    await Vehicle.deleteMany({});

    // Seed the 4 required vehicles
    await Vehicle.create([
      { make: 'Toyota', model: 'Fortuner', category: 'SUV', price: 4200000, quantity: 5 },
      { make: 'Honda', model: 'City', category: 'Sedan', price: 1500000, quantity: 10 },
      { make: 'Tata', model: 'Nexon', category: 'SUV', price: 1200000, quantity: 8 },
      { make: 'Hyundai', model: 'Creta', category: 'SUV', price: 1800000, quantity: 6 }
    ]);
  }, 30000);

  /**
   * Test Case A: Search by make
   * Asserts that sending a search query for make 'Toyota' returns a 200 OK status,
   * count of 1, and the correct vehicle matching the make.
   */
  it('should successfully search vehicles by make', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 1,
      vehicles: [
        expect.objectContaining({ make: 'Toyota', model: 'Fortuner', category: 'SUV', price: 4200000, quantity: 5 })
      ]
    });
  });

  /**
   * Test Case B: Search by model
   * Asserts that sending a search query for model 'City' returns a 200 OK status,
   * count of 1, and the correct vehicle matching the model.
   */
  it('should successfully search vehicles by model', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?model=City')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 1,
      vehicles: [
        expect.objectContaining({ make: 'Honda', model: 'City', category: 'Sedan', price: 1500000, quantity: 10 })
      ]
    });
  });

  /**
   * Test Case C: Search by category
   * Asserts that sending a search query for category 'SUV' returns a 200 OK status,
   * count of 3, and all matching vehicles of category 'SUV'.
   */
  it('should successfully search vehicles by category', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?category=SUV')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(3);
    response.body.vehicles.forEach(vehicle => {
      expect(vehicle.category).toBe('SUV');
    });
  });

  /**
   * Test Case D: Search using minimum price
   * Asserts that searching with minPrice 1500000 returns all vehicles with price >= 1500000.
   */
  it('should successfully filter vehicles above or equal to a minimum price', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?minPrice=1500000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(3); // Toyota (4.2M), Honda (1.5M), Hyundai (1.8M)
    response.body.vehicles.forEach(vehicle => {
      expect(vehicle.price).toBeGreaterThanOrEqual(1500000);
    });
  });

  /**
   * Test Case E: Search using maximum price
   * Asserts that searching with maxPrice 1800000 returns all vehicles with price <= 1800000.
   */
  it('should successfully filter vehicles below or equal to a maximum price', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?maxPrice=1800000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(3); // Honda (1.5M), Tata (1.2M), Hyundai (1.8M)
    response.body.vehicles.forEach(vehicle => {
      expect(vehicle.price).toBeLessThanOrEqual(1800000);
    });
  });

  /**
   * Test Case F: Search using price range
   * Asserts that searching with minPrice 1500000 and maxPrice 4200000 returns vehicles inside the range.
   */
  it('should successfully filter vehicles within a specific price range', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?minPrice=1500000&maxPrice=4200000')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(3); // Toyota (4.2M), Honda (1.5M), Hyundai (1.8M)
    response.body.vehicles.forEach(vehicle => {
      expect(vehicle.price).toBeGreaterThanOrEqual(1500000);
      expect(vehicle.price).toBeLessThanOrEqual(4200000);
    });
  });

  /**
   * Test Case G: Return an empty array if no vehicle matches
   * Asserts that requesting search parameters matching nothing returns 200 with an empty list.
   */
  it('should return count 0 and an empty array when no vehicles match query parameters', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=Ford')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      count: 0,
      vehicles: []
    });
  });

  /**
   * Test Case H: Missing JWT
   * Asserts that hitting the search endpoint without the Authorization header returns 401.
   */
  it('should return a 401 status if the Authorization header is missing', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota');

    expect(response.status).toBe(401);
  });

  /**
   * Test Case I: Invalid JWT
   * Asserts that hitting the search endpoint with an invalid JWT returns 401.
   */
  it('should return a 401 status if the JWT is invalid or malformed', async () => {
    const response = await request(app)
      .get('/api/vehicles/search?make=Toyota')
      .set('Authorization', 'Bearer invalidtoken123');

    expect(response.status).toBe(401);
  });

});
