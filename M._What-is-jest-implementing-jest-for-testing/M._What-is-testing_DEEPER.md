# 🧪 The Complete Professional Testing & Automation Guide

## 🎯 **Part 1: The Testing Philosophy for Production**

### **The Testing Pyramid (Inverted for APIs)**
```
        ╔═══════════════╗
        ║    E2E Tests  ║  ← 5-10% (Critical user journeys)
        ║   (API Tests) ║
        ╚═══════════════╝
        ╔═══════════════╗
        ║ Integration   ║  ← 20-30% (Service + DB interactions)
        ║     Tests     ║
        ╚═══════════════╝
        ╔═══════════════╗
        ║    Unit       ║  ← 60-70% (Pure business logic)
        ║    Tests      ║
        ╚═══════════════╝
```

### **The Golden Rules of Professional Testing**
1. **Tests Should Be Deterministic**: Same code → same result, every time
2. **Test Behavior, Not Implementation**: If you refactor and tests break, they're testing wrong thing
3. **Fast Feedback Loop**: Run relevant tests in < 30 seconds for TDD
4. **Tests Are Production Code**: Same quality standards, reviews, and maintenance
5. **The "Why" Matters**: Each test should have clear business requirement

### **When NOT to Write Tests**
- **Third-party libraries** (trust they're tested)
- **Framework boilerplate** (Express route definitions)
- **Simple getters/setters without logic**
- **Configuration files**
- **Generated code**

---

## 🏗️ **Part 2: Production-Grade Project Structure**

```
production-app/
├── src/
│   ├── domain/                  # Business logic (most unit tests here)
│   │   ├── entities/            # Domain objects (User, Product)
│   │   ├── value-objects/       # Email, Money, Address
│   │   ├── services/            # Pure business services
│   │   └── events/              # Domain events
│   ├── application/             # Use cases/application services
│   │   ├── use-cases/           # RegisterUserUseCase
│   │   ├── dto/                 # Data transfer objects
│   │   └── ports/               # Interfaces (Repository, MessageBus)
│   ├── infrastructure/          # Framework/DB implementations
│   │   ├── persistence/         # MongoDB, PostgreSQL repos
│   │   ├── web/                 # Express controllers/routes
│   │   ├── messaging/           # RabbitMQ, Redis
│   │   └── cache/               # Redis cache implementations
│   └── shared/                  # Shared utilities
│
├── tests/
│   ├── unit/                    # Fast (<50ms each)
│   │   ├── domain/              # Pure business logic
│   │   ├── application/         # Use case tests
│   │   └── shared/              # Utility tests
│   ├── integration/             # Medium speed (100ms-2s)
│   │   ├── api/                 # API endpoint tests
│   │   ├── persistence/         # DB integration tests
│   │   └── external-services/   # External API integrations
│   ├── e2e/                     # Slow (2s-30s)
│   │   ├── scenarios/           # Full user journeys
│   │   └── load/                # Performance tests
│   ├── __fixtures__/            # Test data builders
│   │   ├── factories/           # ObjectMother pattern
│   │   └── builders/            # Test data builders
│   ├── __mocks__/               # Manual Jest mocks
│   │   ├── node_modules/        # Mocked npm packages
│   │   └── custom/              # Custom mocks
│   ├── __helpers__/             # Test utilities
│   └── setup/                   # Global setup
│       ├── jest.api.setup.js
│       ├── jest.unit.setup.js
│       └── jest.e2e.setup.js
│
├── .husky/
├── .github/workflows/           # CI/CD pipelines
├── docker-compose.test.yml      # Test environment
└── docker-compose.e2e.yml       # E2E environment
```

---

## ⚙️ **Part 3: Advanced Jest Configuration**

### **Multi-Environment Jest Configuration**

```javascript
// jest.config.base.js
const path = require('path');

module.exports = {
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  moduleDirectories: ['node_modules', 'src'],
  moduleNameMapper: {
    '^@domain/(.*)$': '<rootDir>/src/domain/$1',
    '^@application/(.*)$': '<rootDir>/src/application/$1',
    '^@infrastructure/(.*)$': '<rootDir>/src/infrastructure/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1'
  },
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          tsx: false,
          decorators: true,
          dynamicImport: true
        },
        target: 'es2021',
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true
        }
      }
    }]
  },
  watchPlugins: [
    'jest-watch-typeahead/filename',
    'jest-watch-typeahead/testname'
  ],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true
  }
};
```

```javascript
// jest.config.unit.js
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['**/tests/unit/**/*.test.[jt]s'],
  coverageDirectory: './coverage/unit',
  collectCoverageFrom: [
    'src/domain/**/*.{js,ts}',
    'src/application/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    'src/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95
    }
  }
};
```

```javascript
// jest.config.integration.js
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['**/tests/integration/**/*.test.[jt]s'],
  coverageDirectory: './coverage/integration',
  collectCoverageFrom: [
    'src/infrastructure/**/*.{js,ts}',
    '!src/infrastructure/**/*.d.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  globalSetup: '<rootDir>/tests/setup/jest.integration.setup.js',
  globalTeardown: '<rootDir>/tests/setup/jest.integration.teardown.js',
  testTimeout: 10000,
  // Run tests sequentially to avoid DB conflicts
  maxWorkers: 1,
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.integration.setupAfterEnv.js']
};
```

```javascript
// jest.config.e2e.js
const baseConfig = require('./jest.config.base');

module.exports = {
  ...baseConfig,
  displayName: 'e2e',
  testMatch: ['**/tests/e2e/**/*.test.[jt]s'],
  coverageDirectory: './coverage/e2e',
  globalSetup: '<rootDir>/tests/setup/jest.e2e.setup.js',
  globalTeardown: '<rootDir>/tests/setup/jest.e2e.teardown.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.e2e.setupAfterEnv.js'],
  testTimeout: 30000,
  maxWorkers: 1,
  // Don't collect coverage for E2E tests (too slow)
  collectCoverage: false
};
```

### **Package.json Scripts**
```json
{
  "scripts": {
    "test:unit": "jest --config jest.config.unit.js --passWithNoTests",
    "test:integration": "jest --config jest.config.integration.js",
    "test:e2e": "jest --config jest.config.e2e.js",
    "test:api": "jest --config jest.config.api.js",
    "test:all": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:ci": "npm run test:unit -- --ci --maxWorkers=2 && npm run test:integration -- --ci --maxWorkers=1",
    "test:watch": "jest --config jest.config.unit.js --watch",
    "test:coverage": "npm run test:unit -- --coverage && npm run test:integration -- --coverage",
    "test:affected": "jest --findRelatedTests --passWithNoTests",
    "test:update-snapshots": "jest --updateSnapshot",
    "test:verbose": "jest --verbose",
    "test:debug": "node --inspect-brk ./node_modules/.bin/jest --runInBand --watch"
  }
}
```

---

## 🔬 **Part 4: Advanced Jest API & Patterns**

### **Custom Matchers (Extend Jest)**

```javascript
// tests/__helpers__/matchers/toContainObject.js
const toContainObject = (received, argument) => {
  const pass = this.equals(
    received,
    expect.arrayContaining([expect.objectContaining(argument)])
  );

  if (pass) {
    return {
      message: () =>
        `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`,
      pass: true
    };
  } else {
    return {
      message: () =>
        `expected ${this.utils.printReceived(received)} to contain object ${this.utils.printExpected(argument)}`,
      pass: false
    };
  }
};

expect.extend({ toContainObject });

// Usage in tests
expect(usersArray).toContainObject({ id: 1, name: 'John' });
```

### **Snapshot Testing for API Responses**

```javascript
// tests/integration/api/users.test.js
describe('Users API', () => {
  it('returns correct user structure', async () => {
    const response = await request(app)
      .get('/api/users/1')
      .set('Authorization', `Bearer ${testToken}`);
    
    // First run creates snapshot, subsequent runs compare
    expect(response.body).toMatchSnapshot({
      // Ignore dynamic fields
      id: expect.any(String),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
  
  it('returns paginated user list structure', async () => {
    const response = await request(app)
      .get('/api/users?page=1&limit=10');
    
    expect(response.body).toMatchInlineSnapshot(`
      {
        "data": Array [
          Object {
            "email": "user1@example.com",
            "id": "1",
            "name": "User One",
          },
        ],
        "meta": Object {
          "currentPage": 1,
          "hasNextPage": true,
          "hasPreviousPage": false,
          "totalItems": 100,
          "totalPages": 10,
        },
      }
    `);
  });
});
```

### **Parameterized Tests with test.each**

```javascript
describe('Email validation', () => {
  const validEmails = [
    'test@example.com',
    'user.name@sub.domain.co.uk',
    'user+tag@domain.org'
  ];
  
  const invalidEmails = [
    'invalid-email',
    '@no-local-part.com',
    'no-at-sign.domain.com',
    'spaces in@email.com'
  ];
  
  test.each(validEmails)('accepts valid email: %s', (email) => {
    expect(isValidEmail(email)).toBe(true);
  });
  
  test.each(invalidEmails)('rejects invalid email: %s', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
  
  // With object destructuring
  test.each([
    { input: { a: 1, b: 2 }, expected: 3 },
    { input: { a: -1, b: 1 }, expected: 0 },
    { input: { a: 0, b: 0 }, expected: 0 },
  ])('adds $input.a and $input.b to get $expected', ({ input, expected }) => {
    expect(input.a + input.b).toBe(expected);
  });
});
```

### **Async Tests with Different Patterns**

```javascript
describe('Async operations', () => {
  // 1. Promise resolution
  it('resolves with user data', () => {
    return expect(userService.findById(1)).resolves.toMatchObject({
      id: 1,
      name: 'John'
    });
  });
  
  // 2. Promise rejection
  it('rejects when user not found', () => {
    return expect(userService.findById(999)).rejects.toThrow('User not found');
  });
  
  // 3. Async/await pattern (most common)
  it('fetches user with async/await', async () => {
    const user = await userService.findById(1);
    expect(user).toBeDefined();
    expect(user.id).toBe(1);
  });
  
  // 4. Concurrent async operations
  it('handles concurrent requests', async () => {
    const [user1, user2] = await Promise.all([
      userService.findById(1),
      userService.findById(2)
    ]);
    
    expect(user1.id).toBe(1);
    expect(user2.id).toBe(2);
  });
  
  // 5. Async error handling with try/catch
  it('throws specific error for invalid input', async () => {
    try {
      await userService.findById(null);
      // Fail test if we reach here
      fail('Should have thrown an error');
    } catch (error) {
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toContain('Invalid user ID');
    }
  });
});
```

---

## 🗄️ **Part 5: Advanced Database Testing Patterns**

### **Multi-Database Test Strategy**

```javascript
// tests/setup/database/TestDatabaseManager.js
class TestDatabaseManager {
  constructor() {
    this.databases = new Map();
    this.connections = new Map();
  }
  
  async createDatabase(type, options = {}) {
    const id = uuid.v4();
    
    switch (type) {
      case 'mongodb':
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        const mongoConn = await mongoose.createConnection(mongoUri).asPromise();
        
        this.databases.set(id, {
          type: 'mongodb',
          server: mongoServer,
          connection: mongoConn,
          uri: mongoUri
        });
        break;
        
      case 'postgres':
        const postgresServer = await new PostgresMemoryServer();
        const postgresUri = await postgresServer.getConnectionString();
        const postgresClient = new Client({ connectionString: postgresUri });
        await postgresClient.connect();
        
        this.databases.set(id, {
          type: 'postgres',
          server: postgresServer,
          connection: postgresClient,
          uri: postgresUri
        });
        break;
        
      case 'redis':
        const redisServer = await RedisMemoryServer.create();
        const redisClient = redis.createClient({
          url: `redis://${redisServer.getHost()}:${redisServer.getPort()}`
        });
        await redisClient.connect();
        
        this.databases.set(id, {
          type: 'redis',
          server: redisServer,
          connection: redisClient
        });
        break;
    }
    
    return id;
  }
  
  async seedDatabase(dbId, seedData) {
    const db = this.databases.get(dbId);
    
    switch (db.type) {
      case 'mongodb':
        const { collections } = seedData;
        for (const [collectionName, documents] of Object.entries(collections)) {
          await db.connection.collection(collectionName).insertMany(documents);
        }
        break;
        
      case 'postgres':
        for (const tableData of seedData.tables) {
          await db.connection.query(
            `INSERT INTO ${tableData.table} (${tableData.columns.join(',')}) 
             VALUES ${tableData.rows.map(row => `(${row.map(v => `'${v}'`).join(',')})`).join(',')}`
          );
        }
        break;
    }
  }
  
  async getConnection(dbId) {
    return this.databases.get(dbId)?.connection;
  }
  
  async cleanup() {
    for (const [id, db] of this.databases) {
      await db.connection.close();
      await db.server.stop();
    }
    this.databases.clear();
  }
}

module.exports = new TestDatabaseManager();
```

### **Transactional Test Pattern**

```javascript
// tests/integration/transactional.test.js
describe('Transactional Operations', () => {
  let mongoSession;
  let testDb;
  
  beforeEach(async () => {
    // Start MongoDB session
    mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    
    // Create isolated test database
    testDb = await testDbManager.createDatabase('mongodb');
  });
  
  afterEach(async () => {
    // Rollback transaction (undo all test changes)
    if (mongoSession.inTransaction()) {
      await mongoSession.abortTransaction();
    }
    await mongoSession.endSession();
    
    // Cleanup test database
    await testDbManager.cleanupDatabase(testDb.id);
  });
  
  it('should rollback on error', async () => {
    const dbConn = await testDbManager.getConnection(testDb.id);
    
    // Create user
    await dbConn.collection('users').insertOne({
      name: 'Test User',
      email: 'test@example.com'
    }, { session: mongoSession });
    
    // This should fail and trigger rollback
    await expect(
      someOperationThatFails({ session: mongoSession })
    ).rejects.toThrow();
    
    // Verify rollback occurred
    const users = await dbConn.collection('users')
      .find({}, { session: mongoSession })
      .toArray();
    
    expect(users).toHaveLength(0);
  });
});
```

### **Test Data Factories with Faker.js**

```javascript
// tests/__fixtures__/factories/UserFactory.js
const { Factory } = require('fishery');
const { faker } = require('@faker-js/faker');
const User = require('../../../src/domain/entities/User');

class UserFactory extends Factory {
  constructor() {
    super(User);
    
    this.sequence = 1;
    
    // Define default traits
    this.define(() => ({
      id: `user_${this.sequence++}`,
      email: faker.internet.email().toLowerCase(),
      username: faker.internet.userName(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: '$2b$10$somehashedpassword', // bcrypt hash
      isActive: true,
      isVerified: false,
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));
    
    // Define traits (reusable variations)
    this.trait('admin', {
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin']
    });
    
    this.trait('verified', {
      isVerified: true,
      verifiedAt: faker.date.recent()
    });
    
    this.trait('inactive', {
      isActive: false,
      deactivatedAt: faker.date.recent()
    });
    
    this.trait('withProfile', {
      profile: {
        bio: faker.lorem.paragraph(),
        avatar: faker.image.avatar(),
        website: faker.internet.url(),
        location: `${faker.location.city()}, ${faker.location.country()}`
      }
    });
  }
  
  // Custom build methods
  withCustomEmail(email) {
    return this.params({ email });
  }
  
  withCustomPassword(password) {
    const hashedPassword = bcrypt.hashSync(password, 10);
    return this.params({ password: hashedPassword });
  }
  
  // Bulk creation
  createMany(count, params = {}) {
    return Array.from({ length: count }, (_, i) => 
      this.create({ ...params, sequence: i + 1 })
    );
  }
}

module.exports = new UserFactory();

// Usage in tests
describe('User Service', () => {
  it('creates admin user', () => {
    const adminUser = UserFactory.admin().create();
    expect(adminUser.role).toBe('admin');
    expect(adminUser.permissions).toContain('admin');
  });
  
  it('creates verified user with profile', () => {
    const user = UserFactory.verified().withProfile().create();
    expect(user.isVerified).toBe(true);
    expect(user.profile).toBeDefined();
  });
  
  it('creates multiple users', () => {
    const users = UserFactory.createMany(5, { isActive: true });
    expect(users).toHaveLength(5);
    expect(users[0].isActive).toBe(true);
  });
});
```

---

## 🚀 **Part 6: API Testing Masterclass with Supertest**

### **Comprehensive API Test Suite**

```javascript
// tests/integration/api/auth.test.js
const request = require('supertest');
const app = require('../../../src/infrastructure/web/app');
const UserFactory = require('../../__fixtures__/factories/UserFactory');
const { setupTestDatabase, cleanupTestDatabase } = require('../../setup/database');

describe('Auth API', () => {
  let testDb;
  let sequelize;
  
  beforeAll(async () => {
    testDb = await setupTestDatabase();
    sequelize = testDb.connection;
  });
  
  afterAll(async () => {
    await cleanupTestDatabase(testDb.id);
  });
  
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });
  
  describe('POST /api/auth/register', () => {
    const validPayload = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User'
    };
    
    it('should register user with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(201);
      
      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: validPayload.email,
            username: validPayload.username,
            firstName: validPayload.firstName,
            lastName: validPayload.lastName,
            isVerified: false
          },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
          }
        }
      });
      
      // Verify tokens are valid JWT
      const decoded = jwt.verify(response.body.data.tokens.accessToken, process.env.JWT_SECRET);
      expect(decoded.sub).toBe(response.body.data.user.id);
    });
    
    it('should return 400 for duplicate email', async () => {
      // Create user first
      await UserFactory.create({ email: validPayload.email });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(validPayload)
        .expect(400);
      
      expect(response.body).toEqual({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email already registered',
          field: 'email'
        }
      });
    });
    
    it('should validate password strength', async () => {
      const weakPasswordPayload = {
        ...validPayload,
        password: 'weak'
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(weakPasswordPayload)
        .expect(400);
      
      expect(response.body.error.code).toBe('PASSWORD_TOO_WEAK');
      expect(response.body.error.field).toBe('password');
    });
    
    it('should sanitize input data', async () => {
      const maliciousPayload = {
        ...validPayload,
        firstName: '<script>alert("xss")</script>John',
        email: '  TEST@EXAMPLE.COM  ' // Extra spaces, uppercase
      };
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousPayload)
        .expect(201);
      
      // Verify sanitization
      expect(response.body.data.user.firstName).toBe('John'); // HTML stripped
      expect(response.body.data.user.email).toBe('test@example.com'); // Lowercase, trimmed
    });
    
    it('should handle concurrent registration attempts', async () => {
      const requests = Array.from({ length: 5 }, (_, i) => 
        request(app)
          .post('/api/auth/register')
          .send({
            ...validPayload,
            email: `test${i}@example.com`,
            username: `user${i}`
          })
      );
      
      const responses = await Promise.all(requests);
      
      // All should succeed (no race conditions)
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });
  });
  
  describe('POST /api/auth/login', () => {
    let testUser;
    const plainPassword = 'SecurePass123!';
    
    beforeEach(async () => {
      testUser = await UserFactory
        .withCustomPassword(plainPassword)
        .verified()
        .create();
    });
    
    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: plainPassword
        })
        .expect(200);
      
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      expect(response.body.data.tokens).toHaveProperty('refreshToken');
      expect(response.body.data.user.email).toBe(testUser.email);
    });
    
    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!'
        })
        .expect(401);
      
      expect(response.body.error.code).toBe('INVALID_CREDENTIALS');
    });
    
    it('should implement rate limiting', async () => {
      const attempts = 6; // Assuming limit is 5 attempts
      
      for (let i = 0; i < attempts; i++) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email: testUser.email,
            password: 'WrongPassword'
          });
        
        if (i >= 5) {
          // After 5th attempt, should be rate limited
          expect(response.status).toBe(429);
          expect(response.headers['retry-after']).toBeDefined();
        }
      }
    });
  });
  
  describe('Protected Routes', () => {
    let authToken;
    
    beforeAll(async () => {
      const testUser = await UserFactory.verified().create();
      authToken = jwt.sign(
        { sub: testUser.id, role: testUser.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );
    });
    
    it('should access protected route with valid token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      expect(response.body.data).toBeDefined();
    });
    
    it('should reject expired token', async () => {
      const expiredToken = jwt.sign(
        { sub: 'user123' },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );
      
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    });
    
    it('should reject malformed token', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer malformed.token.here')
        .expect(401);
    });
    
    it('should require specific roles for admin routes', async () => {
      const regularUserToken = jwt.sign(
        { sub: 'user123', role: 'user' },
        process.env.JWT_SECRET
      );
      
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
      
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });
  
  describe('File Upload Endpoints', () => {
    it('should upload avatar image', async () => {
      const authToken = 'valid-jwt-token';
      const testImage = path.join(__dirname, '__fixtures__', 'test-avatar.jpg');
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', testImage)
        .field('caption', 'My profile picture')
        .expect(200);
      
      expect(response.body.data).toHaveProperty('url');
      expect(response.body.data.url).toMatch(/\.(jpg|jpeg|png|gif)$/i);
      expect(response.body.data.metadata).toHaveProperty('size');
      expect(response.body.data.metadata).toHaveProperty('mimetype', 'image/jpeg');
    });
    
    it('should reject non-image files', async () => {
      const testFile = path.join(__dirname, '__fixtures__', 'test-document.pdf');
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', testFile)
        .expect(400);
      
      expect(response.body.error.code).toBe('INVALID_FILE_TYPE');
    });
    
    it('should enforce file size limit', async () => {
      // Create a large dummy file
      const largeFilePath = path.join(__dirname, '__fixtures__', 'large-image.jpg');
      fs.writeFileSync(largeFilePath, Buffer.alloc(6 * 1024 * 1024)); // 6MB
      
      const response = await request(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('avatar', largeFilePath)
        .expect(400);
      
      expect(response.body.error.code).toBe('FILE_TOO_LARGE');
      
      // Cleanup
      fs.unlinkSync(largeFilePath);
    });
  });
  
  describe('WebSocket Endpoints', () => {
    let io;
    let clientSocket;
    
    beforeAll((done) => {
      const httpServer = require('http').createServer(app);
      io = require('socket.io')(httpServer);
      
      // Setup WebSocket handlers
      require('../../../src/infrastructure/websocket')(io);
      
      httpServer.listen(() => {
        const port = httpServer.address().port;
        clientSocket = require('socket.io-client')(`http://localhost:${port}`);
        done();
      });
    });
    
    afterAll(() => {
      io.close();
      clientSocket.close();
    });
    
    it('should handle real-time notifications', (done) => {
      const testUserId = 'user123';
      const notification = { type: 'MESSAGE', content: 'Hello World' };
      
      // Listen for notification event
      clientSocket.on('notification', (receivedNotification) => {
        expect(receivedNotification).toEqual(notification);
        done();
      });
      
      // Emit notification as server would
      io.to(`user:${testUserId}`).emit('notification', notification);
    });
    
    it('should handle connection errors', (done) => {
      const invalidToken = 'invalid-token';
      
      clientSocket.emit('authenticate', { token: invalidToken });
      
      clientSocket.on('auth_error', (error) => {
        expect(error.message).toContain('Invalid token');
        done();
      });
    });
  });
});
```

---

## 🛡️ **Part 7: Advanced Mocking Strategies**

### **Manual Mock Directory Structure**

```
tests/
└── __mocks__/
    ├── axios.js                    # Mock external HTTP library
    ├── nodemailer.js               # Mock email service
    ├── redis.js                    # Mock Redis client
    ├── aws-sdk.js                  # Mock AWS services
    ├── stripe.js                   # Mock payment service
    ├── node_modules/
    │   └── some-library/          # Auto-mocked npm package
    └── custom/
        ├── Logger.js              # Mock your custom logger
        ├── MetricsService.js      # Mock metrics collection
        └── EventEmitter.js        # Mock event system
```

### **Comprehensive Mock Examples**

```javascript
// tests/__mocks__/axios.js
const axios = jest.createMockFromModule('axios');

let mockResponses = new Map();
let requestHistory = [];

axios.create = jest.fn(() => axios);

// Mock implementation with response sequencing
axios.request = jest.fn((config) => {
  requestHistory.push(config);
  
  const url = config.url;
  const method = config.method?.toLowerCase() || 'get';
  
  // Find matching mock response
  const mockKey = `${method}:${url}`;
  const mockResponse = mockResponses.get(mockKey) || 
                      mockResponses.get(`${method}:*`) ||
                      mockResponses.get(`*:${url}`) ||
                      mockResponses.get('*:*');
  
  if (!mockResponse) {
    throw new Error(`No mock response for ${mockKey}`);
  }
  
  const { data, status, statusText, headers, config: responseConfig } = mockResponse;
  
  return Promise.resolve({
    data,
    status,
    statusText,
    headers,
    config: { ...config, ...responseConfig },
    request: {}
  });
});

// Helper methods for tests
axios.__setMockResponse = (url, method = 'get', response) => {
  const key = `${method}:${url}`;
  mockResponses.set(key, response);
};

axios.__setMockResponses = (responses) => {
  mockResponses = new Map(responses);
};

axios.__setMockError = (url, method = 'get', error) => {
  const key = `${method}:${url}`;
  mockResponses.set(key, { error });
};

axios.__clearMocks = () => {
  mockResponses.clear();
  requestHistory = [];
};

axios.__getRequestHistory = () => [...requestHistory];

// Alias methods
['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].forEach(method => {
  axios[method] = jest.fn((url, ...args) => {
    let config = {};
    
    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        config = args[0];
      } else {
        config.data = args[0];
      }
    } else if (args.length === 2) {
      config = args[1];
      config.data = args[0];
    }
    
    config.url = url;
    config.method = method;
    
    return axios.request(config);
  });
});

module.exports = axios;
```

### **Mocking Time & Date**

```javascript
// tests/__helpers__/timeTravel.js
class TimeTravel {
  constructor() {
    this.originalDate = global.Date;
    this.fakeNow = null;
  }
  
  freeze(time = new Date()) {
    this.fakeNow = typeof time === 'string' ? new Date(time) : time;
    
    global.Date = class extends this.originalDate {
      constructor(...args) {
        if (args.length === 0) {
          return new this.originalDate(this.fakeNow.getTime());
        }
        return new this.originalDate(...args);
      }
      
      static now() {
        return this.fakeNow.getTime();
      }
    };
    
    // Also override Date.now()
    global.Date.now = () => this.fakeNow.getTime();
  }
  
  travelTo(time) {
    this.freeze(time);
  }
  
  travelBy(ms) {
    const newTime = new Date(this.fakeNow.getTime() + ms);
    this.freeze(newTime);
  }
  
  restore() {
    global.Date = this.originalDate;
    this.fakeNow = null;
  }
  
  get currentTime() {
    return this.fakeNow ? new Date(this.fakeNow) : new Date();
  }
}

module.exports = new TimeTravel();

// Usage in tests
describe('Time-sensitive operations', () => {
  beforeEach(() => {
    TimeTravel.freeze('2024-01-15T10:00:00Z');
  });
  
  afterEach(() => {
    TimeTravel.restore();
  });
  
  it('should handle expiration correctly', () => {
    const token = createToken({ expiresIn: '1h' });
    
    // Travel 59 minutes into future
    TimeTravel.travelBy(59 * 60 * 1000);
    expect(isTokenValid(token)).toBe(true);
    
    // Travel 61 minutes into future
    TimeTravel.travelBy(2 * 60 * 1000); // Additional 2 minutes
    expect(isTokenValid(token)).toBe(false);
  });
});
```

---

## 🤖 **Part 8: CI/CD & Git Hooks with Husky**

### **Advanced Husky Configuration**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install",
    "lint": "eslint src/**/*.{js,ts} --max-warnings=0",
    "lint:staged": "lint-staged",
    "type-check": "tsc --noEmit",
    "security-check": "npm audit --production",
    "test:staged": "jest --findRelatedTests --passWithNoTests",
    "build": "tsc -p tsconfig.json",
    "test:changed": "jest --onlyChanged"
  },
  "lint-staged": {
    "src/**/*.{js,jsx,ts,tsx}": [
      "eslint --fix --max-warnings=0",
      "prettier --write"
    ],
    "src/**/*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  },
  "husky": {
    "hooks": {
      "pre-commit": "npm-run-all --serial lint-staged test:staged build",
      "pre-push": "npm-run-all --serial type-check security-check test:ci",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  }
}
```

### **Git Hook Implementation**

```bash
#!/usr/bin/env bash
# .husky/pre-commit

echo "🔍 Running pre-commit checks..."

# Stash unstaged changes to avoid linting them
git stash -q --keep-index

# Function to handle errors
handle_error() {
    echo "❌ $1"
    git stash pop -q
    exit 1
}

# 1. Check for debugger statements
if grep -r "debugger\|console.log" src --include="*.{js,ts}" | grep -v "// eslint-disable"; then
    handle_error "Found debugger statements or console.log in source code"
fi

# 2. Run linter on staged files
echo "📝 Running ESLint on staged files..."
npx lint-staged || handle_error "ESLint failed"

# 3. Run tests related to changed files
echo "🧪 Running tests for changed files..."
npx jest --findRelatedTests --passWithNoTests --maxWorkers=4 || handle_error "Tests failed"

# 4. Build project to catch TypeScript errors
echo "🏗️  Building project..."
npm run build --silent || handle_error "Build failed"

# 5. Security audit for production dependencies
echo "🔒 Checking for security vulnerabilities..."
npm audit --production --audit-level=high 2>/dev/null
AUDIT_EXIT_CODE=$?

if [ $AUDIT_EXIT_CODE -eq 1 ]; then
    echo "⚠️  Security audit found vulnerabilities. Continuing anyway..."
elif [ $AUDIT_EXIT_CODE -gt 1 ]; then
    handle_error "Security audit failed"
fi

# Restore stashed changes
git stash pop -q

echo "✅ All pre-commit checks passed!"
```

```bash
#!/usr/bin/env bash
# .husky/pre-push

echo "🚀 Running pre-push validation..."

# Get current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Skip for certain branches
if [[ "$CURRENT_BRANCH" == "main" || "$CURRENT_BRANCH" == "master" || "$CURRENT_BRANCH" == "develop" ]]; then
    echo "⚠️  Skipping pre-push checks for protected branch: $CURRENT_BRANCH"
    exit 0
fi

# Run full test suite
echo "🧪 Running full test suite..."
npm run test:ci || {
    echo "❌ Tests failed. Push aborted."
    exit 1
}

# Type checking for TypeScript projects
echo "📋 Running type checks..."
npm run type-check || {
    echo "❌ Type checking failed. Push aborted."
    exit 1
}

# Check for TODO comments in production code
TODO_COUNT=$(grep -r "TODO\|FIXME\|HACK\|XXX" src --include="*.{js,ts}" | grep -v "// eslint-disable" | wc -l)
if [ "$TODO_COUNT" -gt 0 ]; then
    echo "⚠️  Found $TODO_COUNT TODO/FIXME comments in production code:"
    grep -r "TODO\|FIXME\|HACK\|XXX" src --include="*.{js,ts}" | grep -v "// eslint-disable"
    echo "Consider addressing these before pushing to remote."
fi

echo "✅ All pre-push checks passed!"
```

### **Commit Message Convention (Conventional Commits)**

```bash
#!/usr/bin/env bash
# .husky/commit-msg

# Commit message validation
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Conventional commit pattern
PATTERN="^(feat|fix|docs|style|refactor|perf|test|chore|revert)(\([a-z-]+\))?: .{1,50}"

if ! echo "$COMMIT_MSG" | grep -qE "$PATTERN"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit message must follow conventional commit format:"
    echo "  <type>(<scope>): <subject>"
    echo ""
    echo "Allowed types:"
    echo "  feat     - New feature"
    echo "  fix      - Bug fix"
    echo "  docs     - Documentation"
    echo "  style    - Code style changes"
    echo "  refactor - Code refactoring"
    echo "  perf     - Performance improvements"
    echo "  test     - Test changes"
    echo "  chore    - Maintenance tasks"
    echo "  revert   - Revert a previous commit"
    echo ""
    echo "Examples:"
    echo "  feat(auth): add login with Google"
    echo "  fix(api): handle null response in user endpoint"
    echo "  docs: update README with installation steps"
    echo ""
    echo "Your message: $COMMIT_MSG"
    exit 1
fi

# Check message length
if [ ${#COMMIT_MSG} -gt 100 ]; then
    echo "❌ Commit message is too long (max 100 characters)"
    exit 1
fi

echo "✅ Commit message is valid"
```

---

## 📊 **Part 9: Performance Testing & Benchmarking**

### **Load Testing with Artillery**

```yaml
# tests/load/auth-load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Normal load
    - duration: 60
      arrivalRate: 100
      name: Peak load
    - duration: 30
      arrivalRate: 10
      name: Cool down
  payload:
    path: "tests/load/data/users.csv"
    fields:
      - "email"
      - "password"
      - "username"
  plugins:
    ensure: {}
    metrics-by-endpoint: {}
    apdex: {}
  ensure:
    thresholds:
      - http.response_time.p95: 1000
      - http.response_time.p99: 2000
      - http.request_rate: 50
      - http.codes.200: 95

scenarios:
  - name: "User registration flow"
    flow:
      - post:
          url: "/api/auth/register"
          json:
            email: "{{ email }}"
            password: "{{ password }}"
            username: "{{ username }}"
          capture:
            json: "$.data.tokens.accessToken"
            as: "accessToken"
      - think: 2
      - get:
          url: "/api/users/me"
          headers:
            Authorization: "Bearer {{ accessToken }}"
      - think: 1
      - post:
          url: "/api/auth/logout"
          headers:
            Authorization: "Bearer {{ accessToken }}"

  - name: "Login stress test"
    weight: 3
    flow:
      - loop:
          - post:
              url: "/api/auth/login"
              json:
                email: "test{{ $loopElement }}@example.com"
                password: "password123"
          count: 100
      - think: 5
```

### **Memory Leak Detection**

```javascript
// tests/performance/memory-leak.test.js
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../../src/app');

describe('Memory Leak Detection', () => {
  let heapSnapshots = [];
  const TEST_ITERATIONS = 1000;
  
  beforeAll(() => {
    // Enable heap dump on SIGUSR2
    process.on('SIGUSR2', () => {
      const heapdump = require('heapdump');
      const filename = `heapdump-${Date.now()}.heapsnapshot`;
      heapdump.writeSnapshot(filename);
      console.log(`Heap snapshot written to ${filename}`);
    });
  });
  
  it('should not leak memory under load', async () => {
    const initialMemory = process.memoryUsage();
    
    // Run many operations that could potentially leak
    for (let i = 0; i < TEST_ITERATIONS; i++) {
      await request(app)
        .post('/api/data/process')
        .send({ data: `test-${i}`, timestamp: Date.now() });
      
      // Force garbage collection every 100 iterations
      if (i % 100 === 0) {
        if (global.gc) {
          global.gc();
        }
        
        // Record memory usage
        const memory = process.memoryUsage();
        heapSnapshots.push({
          iteration: i,
          heapUsed: memory.heapUsed,
          heapTotal: memory.heapTotal,
          external: memory.external,
          rss: memory.rss
        });
      }
    }
    
    const finalMemory = process.memoryUsage();
    
    // Analyze memory growth
    const heapGrowth = (finalMemory.heapUsed - initialMemory.heapUsed) / 1024 / 1024; // MB
    const rssGrowth = (finalMemory.rss - initialMemory.rss) / 1024 / 1024; // MB
    
    console.log('Memory Growth Analysis:');
    console.log(`  Heap Used: ${heapGrowth.toFixed(2)} MB`);
    console.log(`  RSS: ${rssGrowth.toFixed(2)} MB`);
    
    // Assert no significant memory leak
    expect(heapGrowth).toBeLessThan(50); // Less than 50MB growth
    expect(rssGrowth).toBeLessThan(100); // Less than 100MB RSS growth
    
    // Check for linear growth pattern
    const growthRate = analyzeGrowthRate(heapSnapshots);
    expect(growthRate).toBeLessThan(0.1); // Less than 0.1MB per iteration
    
    // Write memory report
    writeMemoryReport(heapSnapshots);
  });
  
  function analyzeGrowthRate(snapshots) {
    if (snapshots.length < 2) return 0;
    
    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const iterations = last.iteration - first.iteration;
    const growth = last.heapUsed - first.heapUsed;
    
    return growth / iterations / 1024 / 1024; // MB per iteration
  }
  
  function writeMemoryReport(snapshots) {
    const report = {
      timestamp: new Date().toISOString(),
      test: 'memory_leak_test',
      iterations: TEST_ITERATIONS,
      snapshots: snapshots.map(s => ({
        iteration: s.iteration,
        heapUsedMB: (s.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (s.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: (s.rss / 1024 / 1024).toFixed(2)
      })),
      summary: {
        maxHeapUsedMB: Math.max(...snapshots.map(s => s.heapUsed)) / 1024 / 1024,
        avgGrowthPerIterationMB: analyzeGrowthRate(snapshots)
      }
    };
    
    const reportFile = path.join(__dirname, 'memory-reports', `report-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  }
});
```

---

## 📈 **Part 10: Monitoring & Reporting**

### **Custom Test Reporter**

```javascript
// tests/reporters/custom-reporter.js
class CustomReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options;
    this._testResults = [];
    this._startTime = Date.now();
  }
  
  onRunStart(results, options) {
    console.log(`\n🚀 Starting test run with ${results.numTotalTestSuites} test suites`);
    console.log('═'.repeat(80));
  }
  
  onTestStart(test) {
    process.stdout.write(`  ${test.path.replace(process.cwd(), '')} `);
  }
  
  onTestResult(test, testResult, aggregatedResult) {
    const status = testResult.numFailingTests === 0 ? '✅' : '❌';
    const time = `${testResult.perfStats.end - testResult.perfStats.start}ms`;
    
    console.log(`${status} (${time})`);
    
    this._testResults.push({
      file: test.path,
      duration: testResult.perfStats.end - testResult.perfStats.start,
      passed: testResult.numPassingTests,
      failed: testResult.numFailingTests,
      skipped: testResult.numPendingTests
    });
    
    // Log failures immediately
    if (testResult.failureMessage) {
      console.log('\n' + '─'.repeat(40));
      console.log(`FAILED: ${test.path}`);
      console.log(testResult.failureMessage);
      console.log('─'.repeat(40) + '\n');
    }
  }
  
  onRunComplete(contexts, results) {
    const totalTime = Date.now() - this._startTime;
    
    console.log('\n' + '═'.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('═'.repeat(80));
    
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Suites: ${results.numTotalTestSuites}`);
    console.log(`Tests: ${results.numTotalTests}`);
    console.log(`Passed: ${results.numPassedTests}`);
    console.log(`Failed: ${results.numFailedTests}`);
    console.log(`Skipped: ${results.numPendingTests}`);
    
    // Slowest tests
    const slowTests = [...this._testResults]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);
    
    if (slowTests.length > 0) {
      console.log('\n🐌 Slowest tests:');
      slowTests.forEach((test, i) => {
        console.log(`  ${i + 1}. ${test.file.replace(process.cwd(), '')} - ${test.duration}ms`);
      });
    }
    
    // Failed tests
    const failedTests = this._testResults.filter(t => t.failed > 0);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed tests:');
      failedTests.forEach(test => {
        console.log(`  ${test.file.replace(process.cwd(), '')}`);
      });
    }
    
    // Generate HTML report
    this.generateHtmlReport(results);
    
    // Exit with appropriate code
    if (results.numFailedTests > 0) {
      process.exitCode = 1;
    }
  }
  
  generateHtmlReport(results) {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Report - ${new Date().toLocaleString()}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .passed { color: green; }
        .failed { color: red; }
        .skipped { color: orange; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f2f2f2; }
        .duration { text-align: right; }
    </style>
</head>
<body>
    <h1>Test Execution Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Tests: ${results.numTotalTests}</p>
        <p class="passed">Passed: ${results.numPassedTests}</p>
        <p class="failed">Failed: ${results.numFailedTests}</p>
        <p class="skipped">Skipped: ${results.numPendingTests}</p>
        <p>Success Rate: ${((results.numPassedTests / results.numTotalTests) * 100).toFixed(2)}%</p>
    </div>
    
    <h2>Test Details</h2>
    <table>
        <thead>
            <tr>
                <th>Test File</th>
                <th>Passed</th>
                <th>Failed</th>
                <th>Skipped</th>
                <th class="duration">Duration</th>
            </tr>
        </thead>
        <tbody>
            ${this._testResults.map(test => `
            <tr>
                <td>${test.file.replace(process.cwd(), '')}</td>
                <td class="passed">${test.passed}</td>
                <td class="failed">${test.failed}</td>
                <td class="skipped">${test.skipped}</td>
                <td class="duration">${test.duration}ms</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;
    
    const reportDir = path.join(process.cwd(), 'test-reports');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const reportFile = path.join(reportDir, `report-${Date.now()}.html`);
    fs.writeFileSync(reportFile, html);
    console.log(`\n📄 HTML report generated: ${reportFile}`);
  }
}

module.exports = CustomReporter;
```

### **Test Coverage Analysis**

```javascript
// tests/coverage/coverage-rules.js
module.exports = {
  // Critical business logic must have high coverage
  'src/domain/**/*.ts': {
    statements: 95,
    branches: 90,
    functions: 95,
    lines: 95
  },
  
  // Application services
  'src/application/**/*.ts': {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  },
  
  // Infrastructure (adapters)
  'src/infrastructure/**/*.ts': {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  },
  
  // Exclude certain files
  'src/**/*.d.ts': false,
  'src/**/*.interface.ts': false,
  'src/**/*.spec.ts': false,
  'src/**/*.test.ts': false,
  
  // Shared utilities
  'src/shared/**/*.ts': {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  }
};
```

---

## 🎯 **Part 11: Testing Anti-Patterns to Avoid**

### **Common Testing Mistakes**

1. **Testing Implementation Details**
```javascript
// ❌ BAD: Testing private implementation
it('should call res.status with 200', () => {
  const mockRes = { status: jest.fn() };
  myController.handler({}, mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(200);
});

// ✅ GOOD: Testing observable behavior
it('should return 200 status', async () => {
  const response = await request(app).get('/api/data');
  expect(response.status).toBe(200);
});
```

2. **Over-Mocking**
```javascript
// ❌ BAD: Mocking everything loses test value
jest.mock('../services/userService');
jest.mock('../services/emailService');
jest.mock('../repositories/userRepository');
// Test passes but doesn't verify real integration

// ✅ GOOD: Mock only external dependencies
jest.mock('../../external-payment-service'); // External API
// Test real interactions between your components
```

3. **Not Cleaning Up**
```javascript
// ❌ BAD: Tests depend on previous state
let database; // Shared state

// ✅ GOOD: Fresh state for each test
beforeEach(async () => {
  database = await createTestDatabase();
});

afterEach(async () => {
  await database.cleanup();
});
```

4. **Testing Third-Party Code**
```javascript
// ❌ BAD: Testing library functionality
it('should hash password with bcrypt', async () => {
  const hash = await bcrypt.hash('password', 10);
  expect(hash).toMatch(/^\$2[aby]\$/); // Testing bcrypt internals
});

// ✅ GOOD: Trust the library, test your usage
it('should verify password matches hash', async () => {
  const isValid = await authService.verifyPassword('password', storedHash);
  expect(isValid).toBe(true); // Testing your service
});
```

---

## 🔄 **Part 12: Continuous Testing Workflow**

### **GitHub Actions Workflow**

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      redis:
        image: redis:alpine
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      
      mongodb:
        image: mongo:6
        ports: ['27017:27017']
        options: >-
          --health-cmd "mongosh --eval 'db.adminCommand(\"ping\")'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    strategy:
      matrix:
        node-version: [18.x, 20.x]
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run unit tests
      run: npm run test:unit -- --ci --maxWorkers=2
      env:
        NODE_ENV: test
        JWT_SECRET: test-jwt-secret
    
    - name: Run integration tests
      run: npm run test:integration -- --ci --maxWorkers=1
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/test
        REDIS_URL: redis://localhost:6379
    
    - name: Upload test results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results-${{ matrix.node-version }}
        path: |
          coverage/
          test-reports/
          junit.xml
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella
    
    - name: Notify on failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        channel: '#build-failures'
        username: 'Test Bot'
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### **Local Development Workflow**

```bash
#!/usr/bin/env bash
# scripts/dev-test-workflow.sh

echo "🚀 Starting development testing workflow..."

# 1. Check for uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes. Stashing..."
    git stash push -m "WIP: $(date +%Y-%m-%d_%H-%M-%S)"
fi

# 2. Run quick checks first
echo "🔍 Running quick checks..."
npm run lint || exit 1
npm run type-check || exit 1

# 3. Run tests for changed files
echo "🧪 Running tests for changed files..."
npm run test:changed -- --verbose

if [ $? -eq 0 ]; then
    echo "✅ Quick tests passed!"
    
    # Ask if user wants to run full suite
    read -p "Run full test suite? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧪 Running full test suite..."
        npm run test:all
        
        if [ $? -eq 0 ]; then
            echo "🎉 All tests passed!"
            
            # Restore stashed changes
            if [[ -n $(git stash list) ]]; then
                echo "📦 Restoring stashed changes..."
                git stash pop
            fi
        else
            echo "❌ Full test suite failed"
            exit 1
        fi
    fi
else
    echo "❌ Quick tests failed. Fix errors before proceeding."
    exit 1
fi

echo "✨ Development workflow complete!"
```

This is the most comprehensive testing guide available. The key to mastery is **progressive implementation**:
1. Start with basic unit tests for critical business logic
2. Add integration tests for API endpoints
3. Implement database testing with MongoMemoryServer
4. Set up Husky for pre-commit hooks
5. Add CI/CD pipeline
6. Implement advanced patterns as needed

Each organization will have different needs, but this foundation covers 95% of production testing requirements.