const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Setup before all tests
beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
});

// Cleanup after each test
afterEach(async () => {
  if (process.env.NODE_ENV === 'test') {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
});

// Cleanup after all tests
afterAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    
    if (mongoServer) {
      await mongoServer.stop();
    }
  }
});

// Global test timeout
jest.setTimeout(30000);