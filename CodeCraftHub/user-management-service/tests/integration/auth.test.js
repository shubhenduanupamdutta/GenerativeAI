const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const User = require('../../src/models/User');

describe('Auth Endpoints', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await User.deleteMany({});
  });

  describe('POST /api/v1/auth/register', () => {
    const validUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
    };

    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(validUserData.email);
      expect(response.body.data.user.username).toBe(validUserData.username);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();

      // Verify user was created in database
      const user = await User.findOne({ email: validUserData.email });
      expect(user).toBeTruthy();
      expect(user.firstName).toBe(validUserData.firstName);
      expect(user.lastName).toBe(validUserData.lastName);
    });

    it('should not register user with invalid email', async () => {
      const invalidData = { ...validUserData, email: 'invalid-email' };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('valid email');
    });

    it('should not register user with weak password', async () => {
      const invalidData = { ...validUserData, password: 'weak' };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Password must');
    });

    it('should not register user with duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to create user with same email
      const duplicateData = { ...validUserData, username: 'different' };
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email already exists');
    });

    it('should not register user with duplicate username', async () => {
      // Create first user
      await request(app)
        .post('/api/v1/auth/register')
        .send(validUserData)
        .expect(201);

      // Try to create user with same username
      const duplicateData = { ...validUserData, email: 'different@example.com' };
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Username is already taken');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Test123!@#',
      firstName: 'Test',
      lastName: 'User',
    };

    beforeEach(async () => {
      // Create a test user
      const user = new User(userData);
      user.status = 'active';
      user.emailVerified = true;
      await user.save();
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.tokens.accessToken).toBeDefined();
      expect(response.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should login with username', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.username,
          password: userData.password,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.username).toBe(userData.username);
    });

    it('should not login with invalid password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: userData.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toBe('Invalid credentials');
    });

    it('should not login with inactive account', async () => {
      // Set user status to inactive
      await User.findOneAndUpdate(
        { email: userData.email },
        { status: 'inactive' }
      );

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('not active');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    let authToken;
    let testUser;

    beforeEach(async () => {
      // Create and login a test user
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
      };

      testUser = new User(userData);
      testUser.status = 'active';
      testUser.emailVerified = true;
      await testUser.save();

      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          password: userData.password,
        });

      authToken = loginResponse.body.data.tokens.accessToken;
    });

    it('should get current user with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.username).toBe(testUser.username);
    });

    it('should not get current user without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('No token provided');
    });

    it('should not get current user with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid token');
    });
  });
});