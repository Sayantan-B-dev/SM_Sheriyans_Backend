# **REST APIs & HTTP METHODS: DEFINITIVE GUIDE**

## **1. REST APIs - COMPLETE ARCHITECTURAL EXPLANATION**

### **REST = Representational State Transfer**

**Historical Context:**
- **2000**: Roy Fielding's PhD dissertation introduces REST
- **Problem**: Web needed scalable, stateless, cacheable architecture
- **Solution**: REST as architectural style for distributed systems

**Core REST Principles (6 Constraints):**

**1. Client-Server Architecture:**
```
Client (Browser/App) ↔ Server (API)
    Request → 
        GET /api/users
        POST /api/users
    ← Response
        Status Code
        Headers
        Body (JSON/XML)
```
- **Separation of concerns**: Client handles UI, Server handles data/storage
- **Independent evolution**: Client and server can be updated separately

**2. Statelessness:**
```javascript
// RESTful (Stateless):
GET /api/users/123
Authorization: Bearer token123  // Every request contains auth
GET /api/users/456  
Authorization: Bearer token123  // Must send auth again

// vs Stateful (Session-based):
GET /api/users/123
Cookie: session=abc123          // Server stores session state
GET /api/users/456              // Server remembers who you are
```
- **Each request contains all necessary information**
- **Server doesn't store client context between requests**
- **Benefits**: Scalability, reliability, simplicity

**3. Cacheability:**
```javascript
// Server indicates cacheability
HTTP/1.1 200 OK
Cache-Control: max-age=3600    // Cache for 1 hour
ETag: "abc123"                 // Entity tag for validation
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT

// Client can send conditional requests
GET /api/users/123
If-None-Match: "abc123"       // If ETag matches, return 304
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT
```
- **Responses must be explicitly cacheable or non-cacheable**
- **Reduces client-server interactions**
- **Improves performance, scalability, user-perceived performance**

**4. Uniform Interface:**
```javascript
// 1. Resource Identification (URLs)
GET    /api/users/123          // User resource
GET    /api/users/123/posts    // User's posts sub-resource

// 2. Resource Manipulation through Representations
PUT    /api/users/123
Content-Type: application/json
{"name": "John", "age": 30}    // JSON representation of user

// 3. Self-descriptive Messages
GET /api/users/123
Accept: application/json       // Client wants JSON
Accept-Language: en-US         // Client wants English

// 4. Hypermedia as Engine of Application State (HATEOAS)
{
  "id": 123,
  "name": "John",
  "_links": {
    "self": { "href": "/api/users/123" },
    "posts": { "href": "/api/users/123/posts" }
  }
}
```

**5. Layered System:**
```
Client → Load Balancer → Server 1 → Database
                    ↘ Server 2 ↗
```
- **Client doesn't know if it's talking to end server or intermediate**
- **Layers improve scalability, security, load balancing**
- **Proxies, gateways, firewalls can be inserted**

**6. Code on Demand (Optional):**
```html
<!-- Server can send executable code -->
<script src="/api/users/script.js"></script>
<!-- Client downloads and executes -->
```

### **REST in Practice - API Design Rules:**

**1. Resource-Based URLs:**
```javascript
// Resources (nouns), not actions (verbs)
// WRONG:
GET    /getUser/123
POST   /createUser
PUT    /updateUser/123
DELETE /deleteUser/123

// RIGHT:
GET    /users/123      // Get user
POST   /users          // Create user
PUT    /users/123      // Update user
DELETE /users/123      // Delete user

// Sub-resources:
GET    /users/123/posts     // User's posts
GET    /users/123/posts/456 // Specific post
```

**2. HTTP Methods Map to CRUD Operations:**
```javascript
// CREATE = POST
POST   /users          // Create new user
// Returns: 201 Created + Location header

// READ   = GET  
GET    /users          // List users (collection)
GET    /users/123      // Get specific user (item)
// Returns: 200 OK

// UPDATE = PUT (replace) / PATCH (partial)
PUT    /users/123      // Replace entire user
PATCH  /users/123      // Update specific fields
// Returns: 200 OK or 204 No Content

// DELETE = DELETE
DELETE /users/123      // Delete user
// Returns: 204 No Content
```

**3. Stateless Communication:**
```javascript
// Each request must contain all necessary data
// NO server-side sessions

// Authentication via tokens:
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// NOT via cookies/sessions
GET /api/users
Cookie: session=abc123  // NOT RESTful (stateful)
```

**4. Standard Status Codes:**
```javascript
// 2xx Success
200 OK                    // GET, PUT, PATCH success
201 Created               // POST success (resource created)
204 No Content            // DELETE success, no body

// 3xx Redirection
301 Moved Permanently     // Resource moved permanently
304 Not Modified          // Cache validation success

// 4xx Client Errors
400 Bad Request           // Malformed request
401 Unauthorized          // Authentication required
403 Forbidden             // Authenticated but no permission
404 Not Found             // Resource doesn't exist
405 Method Not Allowed    // HTTP method not supported
409 Conflict              // Resource state conflict

// 5xx Server Errors
500 Internal Server Error // Generic server error
503 Service Unavailable   // Server down for maintenance
```

## **2. REQUEST DATA TRANSMISSION - THREE METHODS EXPLAINED**

### **Comparison Matrix:**
```
| CRITERIA          | req.body          | req.query         | req.params        |
|-------------------|-------------------|-------------------|-------------------|
| Location          | Request body      | URL after ?       | URL path segment  |
| Visibility        | Hidden            | Visible in URL    | Visible in URL    |
| Size Limit        | Large (MBs)       | Small (2KB-8KB)   | Small             |
| Security          | More secure       | Less secure       | Less secure       |
| Caching           | Not cacheable     | Cacheable         | Cacheable         |
| Use Case          | Create/Update     | Filtering/Search  | Resource IDs      |
| HTTP Methods      | POST, PUT, PATCH  | GET (mainly)      | All methods       |
| Example           | User registration | Search filters    | User profile      |
```

### **1. req.body - Request Body Data**

**Technical Implementation:**
```javascript
// HTTP Request Structure:
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 45

{"name":"John","email":"john@example.com"}  // ← req.body

// In Express:
app.use(express.json());  // Required middleware

app.post('/api/users', (req, res) => {
    console.log(req.body);  // {name: "John", email: "john@example.com"}
    // Process data...
});
```

**When to Use req.body:**

**A. Creating Resources (POST):**
```javascript
// User Registration
POST /api/users
{
    "username": "johndoe",
    "password": "secure123",  // Sensitive - must be in body
    "email": "john@example.com",
    "profile": {
        "bio": "Software developer...",
        "interests": ["coding", "reading"]
    }
}
// Reason: Sensitive data, complex nested structure
```

**B. Updating Resources (PUT/PATCH):**
```javascript
// Update User Profile
PUT /api/users/123
{
    "name": "John Updated",
    "settings": {
        "theme": "dark",
        "notifications": true,
        "language": "en"
    }
}
// Reason: Complex object, multiple fields
```

**C. Authentication:**
```javascript
// User Login
POST /api/login
{
    "username": "johndoe",
    "password": "secret123"  // Never in URL!
}
```

**D. File Uploads:**
```javascript
// Multipart Form Data
POST /api/upload
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="file"; filename="photo.jpg"
Content-Type: image/jpeg

[binary file data]
--boundary
```

**Security Considerations:**
```javascript
// 1. Always validate and sanitize
const { body, validationResult } = require('express-validator');

app.post('/api/users', 
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Process valid data
    }
);

// 2. Set size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. Use HTTPS (TLS encryption)
// Body is encrypted in transit
```

### **2. req.query - Query String Parameters**

**Technical Implementation:**
```javascript
// URL Structure:
https://api.example.com/search?q=express&page=2&limit=10
//           Path: /search  ↑ Query String
//                         ?key=value&key=value...

// In Express (automatic parsing):
app.get('/search', (req, res) => {
    console.log(req.query);
    // { q: 'express', page: '2', limit: '10' }
    
    // Type conversion needed (all values are strings)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
});
```

**When to Use req.query:**

**A. Filtering/Searching:**
```javascript
// E-commerce Product Search
GET /api/products?category=electronics&brand=apple&minPrice=500&maxPrice=2000&sort=price&order=asc

// req.query = {
//   category: 'electronics',
//   brand: 'apple',
//   minPrice: '500',
//   maxPrice: '2000',
//   sort: 'price',
//   order: 'asc'
// }
```

**B. Pagination:**
```javascript
// Paginated User List
GET /api/users?page=3&limit=20&sort=name&order=asc

// Implementation:
app.get('/api/users', (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.query) || 20;
    const offset = (page - 1) * limit;
    
    // Database query: SELECT * FROM users LIMIT ? OFFSET ?
    db.query('SELECT * FROM users LIMIT ? OFFSET ?', [limit, offset]);
});
```

**C. Optional Parameters:**
```javascript
// Optional filters
GET /api/articles?author=john&year=2023&tags=tech,ai

// Some parameters might be optional
if (req.query.author) {
    // Filter by author
}
if (req.query.tags) {
    const tags = req.query.tags.split(',');
    // Filter by multiple tags
}
```

**D. API Versioning/Features:**
```javascript
// Feature flags, API version
GET /api/data?apiVersion=2&includeMetadata=true&format=json
```

**Query String Syntax Rules:**
```javascript
// 1. Basic key-value pairs
?key=value&another=value2

// 2. Arrays (multiple same keys)
?tags=javascript&tags=nodejs&tags=express
// req.query = { tags: ['javascript', 'nodejs', 'express'] }

// 3. Nested objects (with extended parsing)
?filter[name]=John&filter[age]=30&sort=name
// With extended: true in urlencoded middleware
// req.query = { filter: { name: 'John', age: '30' }, sort: 'name' }

// 4. Special characters (URL encoded)
?q=hello%20world&price=%24100
// Decoded: q="hello world", price="$100"

// 5. Boolean values
?active=true&featured=false
// Note: All values are strings! "true" not true
```

**Limitations and Security:**
```javascript
// 1. Size limits (browser dependent)
// Chrome: ~64KB, Internet Explorer: ~2KB

// 2. Visible in:
// - Browser address bar
// - Server logs
// - Referrer headers
// - Browser history

// 3. NEVER put sensitive data in query:
// WRONG: GET /api/login?username=johndoe&password=secret123
// RIGHT: POST /api/login with body

// 4. Cache implications:
// Different query = Different cache entry
GET /api/users?page=1  // Cached separately from
GET /api/users?page=2  // Each page has own cache
```

### **3. req.params - URL Path Parameters**

**Technical Implementation:**
```javascript
// Route definition with parameters
app.get('/users/:userId/posts/:postId', (req, res) => {
    console.log(req.params);
    // { userId: '123', postId: '456' }
});

// URL that matches:
GET /users/123/posts/456
//      ↑      ↑
//   :userId :postId
```

**When to Use req.params:**

**A. Resource Identification:**
```javascript
// User Profile
GET    /users/:username          // ankur_bit_io
GET    /products/:productId      // iphone-15-pro
GET    /articles/:slug          /getting-started-with-nodejs

// vs query approach (less RESTful):
GET    /users?username=ankur_bit_io
GET    /products?id=iphone-15-pro
```

**B. Hierarchical/Nested Resources:**
```javascript
// Blog post comments
GET    /posts/:postId/comments          // All comments for post
GET    /posts/:postId/comments/:commentId  // Specific comment
POST   /posts/:postId/comments          // Add comment to post

// vs flat structure (less intuitive):
GET    /comments?postId=123
GET    /comments/456
POST   /comments?postId=123
```

**C. Clean, Readable URLs:**
```javascript
// RESTful (clean, readable):
GET    /departments/it/employees/john-doe
// req.params = { dept: 'it', employee: 'john-doe' }

// Non-RESTful (less readable):
GET    /employees?dept=it&name=john-doe
```

**Parameter Constraints and Validation:**
```javascript
// 1. Regex constraints in route definition
app.get('/users/:id(\\d+)', (req, res) => {
    // Only matches numeric IDs
    // /users/123 ✓
    // /users/abc ✗ (404)
});

// 2. Multiple parameter types
app.get('/:resource(users|products)/:id(\\d+)', (req, res) => {
    // Matches: /users/123, /products/456
    // Doesn't match: /orders/123, /users/abc
});

// 3. Optional parameters
app.get('/users/:id?', (req, res) => {
    // /users → req.params.id = undefined
    // /users/123 → req.params.id = '123'
});

// 4. Wildcard parameters
app.get('/files/*', (req, res) => {
    // /files/documents/report.pdf
    // req.params[0] = 'documents/report.pdf'
});
```

**Best Practices for req.params:**
```javascript
// 1. Use for required identifiers
// Good: GET /api/users/:id
// Bad:  GET /api/users?id=:id (use query instead)

// 2. Keep URLs hierarchical
// Organization structure
GET    /org/:orgId/departments/:deptId/employees/:empId

// 3. Use slugs for readability
// Instead of IDs, use human-readable identifiers
GET    /blog/why-nodejs-is-awesome
// vs
GET    /blog/123

// 4. Validate parameters
app.param('userId', (req, res, next, userId) => {
    // Custom validation for userId parameter
    if (!isValidUserId(userId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }
    req.user = findUser(userId);
    next();
});

// Now all routes with :userId get automatic validation
app.get('/users/:userId', (req, res) => {
    // req.user is already populated
    res.json(req.user);
});
```

## **3. HTTP METHODS - COMPLETE SPECIFICATION**

### **HTTP Method Taxonomy:**

```
HTTP METHODS
├── SAFE METHODS (Read-only)
│   ├── GET     - Retrieve resource
│   └── HEAD    - Get headers only
│
├── IDEMPOTENT METHODS (Same effect if repeated)
│   ├── GET     - Safe + Idempotent
│   ├── HEAD    - Safe + Idempotent  
│   ├── PUT     - Replace resource (idempotent)
│   ├── DELETE  - Delete resource (idempotent)
│   └── OPTIONS - Get allowed methods (idempotent)
│
├── NON-IDEMPOTENT METHODS
│   ├── POST    - Create resource (not idempotent)
│   └── PATCH   - Partial update (may not be idempotent)
│
└── OTHER METHODS
    ├── CONNECT - Establish tunnel
    ├── TRACE   - Echo request
    └── TRACK   - Debugging
```

### **1. GET - Retrieve Resource**

**Definition:** Safe, idempotent method to retrieve resource representation

**Technical Specification:**
```javascript
// Request
GET /api/users/123 HTTP/1.1
Host: api.example.com
Accept: application/json
If-None-Match: "abc123"      // Conditional GET

// Successful Response
HTTP/1.1 200 OK
Content-Type: application/json
ETag: "def456"
Cache-Control: max-age=3600

{"id": 123, "name": "John"}

// Conditional Response (cache hit)
HTTP/1.1 304 Not Modified
ETag: "abc123"               // Same as If-None-Match
// No body - use cached version
```

**When to Use GET:**
```javascript
// 1. Retrieve single resource
GET /api/users/123

// 2. List resources (with optional query)
GET /api/users?page=2&limit=20

// 3. Search/filter resources
GET /api/products?category=electronics&minPrice=100

// 4. Related resources
GET /api/users/123/posts
GET /api/users/123/followers
```

**GET Best Practices:**
```javascript
// 1. Always idempotent
// 5 GETs = Same as 1 GET

// 2. Never modify server state
// GET should be read-only

// 3. Use query parameters for filtering
// Not for creating/updating

// 4. Support conditional requests
app.get('/api/users/:id', (req, res) => {
    const user = getUser(req.params.id);
    const etag = generateETag(user);
    
    // Check If-None-Match
    if (req.headers['if-none-match'] === etag) {
        return res.status(304).end(); // Use cache
    }
    
    res.set('ETag', etag);
    res.json(user);
});

// 5. Cacheable responses
res.set('Cache-Control', 'public, max-age=3600');
```

### **2. POST - Create Resource**

**Definition:** Non-idempotent method to submit data to create resource

**Technical Specification:**
```javascript
// Request
POST /api/users HTTP/1.1
Host: api.example.com
Content-Type: application/json
Content-Length: 45

{"name": "John", "email": "john@example.com"}

// Successful Response (Resource Created)
HTTP/1.1 201 Created
Location: /api/users/123              // URI of created resource
Content-Type: application/json

{"id": 123, "name": "John", "email": "john@example.com"}

// Alternative Response (Asynchronous processing)
HTTP/1.1 202 Accepted
Location: /api/queue/job-456          // Check status here
Retry-After: 120                      // Check back in 2 minutes
```

**When to Use POST:**
```javascript
// 1. Create new resource
POST /api/users
// Body: User data
// Returns: 201 Created + Location header

// 2. Submit form data
POST /api/contact
// Body: Form fields
// Returns: 200 OK or 201 Created

// 3. Execute operation (non-RESTful but common)
POST /api/users/123/deactivate
// Not RESTful (verb in URL) but practical
// Alternative RESTful: PATCH /api/users/123 {active: false}

// 4. File upload
POST /api/uploads
Content-Type: multipart/form-data
```

**POST Characteristics:**
```javascript
// 1. NOT idempotent
POST /api/users {name: "John"}  // Creates user 123
POST /api/users {name: "John"}  // Creates user 124 (different!)

// 2. Usually has request body
// Unlike GET which shouldn't have body

// 3. Returns 201 Created on success
// With Location header pointing to new resource

// 4. Can return 202 Accepted for async processing
// Resource creation started but not complete
```

**POST Implementation Example:**
```javascript
app.post('/api/users', 
    // Validation middleware
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    
    async (req, res) => {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        
        try {
            // Create user in database
            const user = await User.create(req.body);
            
            // 201 Created with Location header
            res.status(201)
               .location(`/api/users/${user.id}`)
               .json(user);
        } catch (error) {
            // Handle duplicate email, etc.
            if (error.code === 11000) { // MongoDB duplicate key
                return res.status(409).json({ 
                    error: 'Email already exists' 
                });
            }
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);
```

### **3. PUT - Replace Resource**

**Definition:** Idempotent method to completely replace resource

**Technical Specification:**
```javascript
// Request (Replace entire user)
PUT /api/users/123 HTTP/1.1
Content-Type: application/json
Content-Length: 67
If-Match: "abc123"  // Optimistic concurrency control

{"name": "John Updated", "email": "john.new@example.com", "age": 31}

// Successful Response
HTTP/1.1 200 OK  // or 204 No Content
Content-Type: application/json
ETag: "def456"   // New ETag after update

{"id": 123, "name": "John Updated", ...}

// Precondition Failed (ETag mismatch)
HTTP/1.1 412 Precondition Failed
// Someone else modified resource
```

**PUT vs PATCH:**
```javascript
// Original Resource
{
    id: 123,
    name: "John",
    email: "john@example.com",
    age: 30,
    city: "New York"
}

// PUT: Replace entire resource
PUT /users/123
{"name": "John", "email": "john.new@example.com", "age": 31}
// Result: city field is GONE (replaced entirely)

// PATCH: Partial update  
PATCH /users/123
{"email": "john.new@example.com"}
// Result: Only email changed, other fields remain
```

**When to Use PUT:**
```javascript
// 1. Update entire resource (full replacement)
PUT /api/users/123
// Send ALL fields, even unchanged ones

// 2. Create resource at specific URL (if client controls ID)
PUT /api/users/123
// If user 123 doesn't exist, create it
// If exists, replace it

// 3. Upload/replace file
PUT /api/documents/report.pdf
// Replace entire document
```

**PUT Implementation:**
```javascript
app.put('/api/users/:id', 
    // Validate all required fields for replacement
    body('name').notEmpty(),
    body('email').isEmail(),
    body('age').isInt({ min: 0 }),
    
    async (req, res) => {
        const userId = req.params.id;
        
        // Check for optimistic concurrency
        const currentETag = getCurrentETag(userId);
        if (req.headers['if-match'] && req.headers['if-match'] !== currentETag) {
            return res.status(412).json({ error: 'Resource modified by another user' });
        }
        
        try {
            // Replace entire resource
            const updatedUser = await User.findOneAndReplace(
                { _id: userId },
                { ...req.body, _id: userId }, // Preserve ID
                { new: true, upsert: true }   // Create if doesn't exist
            );
            
            const newETag = generateETag(updatedUser);
            res.set('ETag', newETag);
            
            if (updatedUser.wasCreated) {
                res.status(201).location(`/api/users/${userId}`);
            } else {
                res.status(200);
            }
            
            res.json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: 'Update failed' });
        }
    }
);
```

### **4. PATCH - Partial Update**

**Definition:** Method to apply partial modifications to resource

**Technical Specification:**
```javascript
// Request (JSON Patch format)
PATCH /api/users/123 HTTP/1.1
Content-Type: application/json-patch+json

[
    {"op": "replace", "path": "/email", "value": "new@example.com"},
    {"op": "add", "path": "/city", "value": "Boston"},
    {"op": "remove", "path": "/age"}
]

// Request (JSON Merge Patch - simpler)
PATCH /api/users/123 HTTP/1.1
Content-Type: application/merge-patch+json

{"email": "new@example.com", "city": "Boston"}

// Successful Response
HTTP/1.1 200 OK
Content-Type: application/json

{"id": 123, "name": "John", "email": "new@example.com", "city": "Boston"}
// Note: age field removed
```

**PATCH Formats:**

**A. JSON Patch (RFC 6902):**
```javascript
// Standardized patch operations
[
    {"op": "add", "path": "/phone", "value": "123-456-7890"},
    {"op": "remove", "path": "/oldField"},
    {"op": "replace", "path": "/email", "value": "new@example.com"},
    {"op": "move", "from": "/temp", "path": "/permanent"},
    {"op": "copy", "from": "/original", "path": "/backup"},
    {"op": "test", "path": "/status", "value": "active"} // Validate before applying
]
```

**B. JSON Merge Patch (RFC 7396):**
```javascript
// Simpler, but can't explicitly remove fields
{
    "email": "new@example.com",           // Update email
    "address": {                          // Add nested object
        "street": "123 Main St",
        "city": "Boston"
    },
    "tags": ["customer", "vip"],          // Replace entire array
    "oldField": null                      // Remove field (set to null)
}
```

**When to Use PATCH:**
```javascript
// 1. Update specific fields
PATCH /api/users/123
{"email": "new@example.com"}
// Only email changes, other fields unchanged

// 2. Toggle boolean flags
PATCH /api/users/123
{"active": false}

// 3. Add/remove from arrays
PATCH /api/users/123
{
    "$addToSet": {"tags": "vip"},    // MongoDB operator style
    "$pull": {"tags": "inactive"}
}

// 4. Increment/decrement numbers
PATCH /api/products/123
{"stock": {"$inc": -1}}  // Decrement stock by 1
```

**PATCH Implementation Example:**
```javascript
app.patch('/api/users/:id', 
    // More flexible validation than PUT
    body().custom(body => {
        // Validate only fields that are present
        if (body.email && !validator.isEmail(body.email)) {
            throw new Error('Invalid email');
        }
        if (body.age && (body.age < 0 || body.age > 150)) {
            throw new Error('Invalid age');
        }
        return true;
    }),
    
    async (req, res) => {
        try {
            // Partial update (only changes provided fields)
            const updatedUser = await User.findByIdAndUpdate(
                req.params.id,
                { $set: req.body },  // Only set provided fields
                { new: true, runValidators: true }
            );
            
            if (!updatedUser) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            res.json(updatedUser);
        } catch (error) {
            if (error.name === 'ValidationError') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Update failed' });
        }
    }
);
```

### **5. DELETE - Remove Resource**

**Definition:** Idempotent method to delete resource

**Technical Specification:**
```javascript
// Request
DELETE /api/users/123 HTTP/1.1
Host: api.example.com
Authorization: Bearer token123

// Successful Response (No Content)
HTTP/1.1 204 No Content
// No response body

// Alternative Response (With body)
HTTP/1.1 200 OK
Content-Type: application/json

{"message": "User deleted successfully", "deletedId": 123}

// Resource Already Deleted
DELETE /api/users/123  // Already deleted
HTTP/1.1 204 No Content  // Still returns 204 (idempotent)
// OR 404 Not Found (depending on API design)
```

**DELETE Variations:**

**A. Hard Delete (Permanent):**
```javascript
DELETE /api/users/123
// Permanently removes from database
// Returns: 204 No Content
```

**B. Soft Delete (Archive):**
```javascript
DELETE /api/users/123
// Sets deletedAt timestamp
// Resource still exists but marked as deleted
PATCH /api/users/123  // Can restore
{"deletedAt": null}
```

**C. Cascade Delete:**
```javascript
DELETE /api/users/123
// Also deletes user's posts, comments, etc.
// Returns: 200 OK with deletion summary
{
    "message": "User and related data deleted",
    "deleted": {
        "user": true,
        "posts": 15,
        "comments": 42
    }
}
```

**When to Use DELETE:**
```javascript
// 1. Delete single resource
DELETE /api/users/123

// 2. Delete collection (if supported)
DELETE /api/temp-files  // Delete all temp files

// 3. Remove relationship
DELETE /api/users/123/followers/456  // Unfollow
// Alternative: DELETE /api/follows?follower=456&following=123
```

**DELETE Implementation:**
```javascript
app.delete('/api/users/:id', 
    // Authentication/Authorization middleware
    authMiddleware,
    
    async (req, res) => {
        const userId = req.params.id;
        
        try {
            // Option 1: Hard delete
            const result = await User.deleteOne({ _id: userId });
            
            if (result.deletedCount === 0) {
                // Already deleted or never existed
                return res.status(204).end(); // Idempotent: success
                // OR return 404 if you want to distinguish
                // return res.status(404).json({ error: 'User not found' });
            }
            
            // Option 2: Soft delete
            // await User.findByIdAndUpdate(userId, { 
            //     deletedAt: new Date(),
            //     deletedBy: req.user.id 
            // });
            
            // Clean up related resources
            await Post.deleteMany({ authorId: userId });
            await Comment.deleteMany({ userId: userId });
            
            // 204 No Content (standard)
            res.status(204).end();
            
            // OR 200 OK with message (less common)
            // res.json({ 
            //     message: 'User deleted',
            //     deletedPosts: postResult.deletedCount,
            //     deletedComments: commentResult.deletedCount 
            // });
            
        } catch (error) {
            if (error.name === 'CastError') {
                return res.status(400).json({ error: 'Invalid user ID' });
            }
            res.status(500).json({ error: 'Deletion failed' });
        }
    }
);
```

### **6. Other HTTP Methods:**

**HEAD - GET without body:**
```javascript
// Request
HEAD /api/users/123 HTTP/1.1

// Response (Headers only, no body)
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 89
ETag: "abc123"
Last-Modified: Wed, 21 Oct 2023 07:28:00 GMT

// Use case: Check if resource exists, get metadata
```

**OPTIONS - Get allowed methods:**
```javascript
// Request
OPTIONS /api/users/123 HTTP/1.1

// Response
HTTP/1.1 200 OK
Allow: GET, PUT, PATCH, DELETE, HEAD, OPTIONS
Access-Control-Allow-Methods: GET, PUT, PATCH, DELETE

// Use case: CORS preflight, discover API capabilities
```

**CONNECT - Establish tunnel:**
```javascript
// Request (HTTPS proxy)
CONNECT api.example.com:443 HTTP/1.1

// Response
HTTP/1.1 200 Connection Established

// Use case: SSL tunneling through proxy
```

**TRACE - Echo request:**
```javascript
// Request
TRACE /api/users HTTP/1.1
Host: api.example.com

// Response
HTTP/1.1 200 OK
Content-Type: message/http

TRACE /api/users HTTP/1.1
Host: api.example.com

// Use case: Debugging, rarely used in production
```

## **4. REAL-WORLD SOCIAL MEDIA API EXAMPLE**

### **Twitter/X.com API Implementation:**

```javascript
// User Profile (req.params)
GET    /api/users/:username              // @ankur_bit_io
// req.params.username = "ankur_bit_io"

// User Search (req.query)
GET    /api/search/users?q=ankur&limit=10&offset=0
// req.query = {q: "ankur", limit: "10", offset: "0"}

// Post Tweet (req.body)
POST   /api/tweets
// req.body = {
//   content: "Learning Node.js!",
//   mediaUrls: ["image1.jpg"],
//   replySettings: "everyone"
// }

// Update Profile (PATCH with req.body)
PATCH  /api/users/me
// req.body = {
//   name: "Ankur Updated",
//   bio: "Full Stack Developer",
//   location: "India"
// }

// Follow User (req.params)
POST   /api/users/:username/follow
// req.params.username = "elonmusk"

// Unfollow User (DELETE with req.params)
DELETE /api/users/:username/follow
// req.params.username = "elonmusk"

// Like Tweet (req.params)
POST   /api/tweets/:tweetId/like
// req.params.tweetId = "123456"

// Unlike Tweet (DELETE with req.params)
DELETE /api/tweets/:tweetId/like
// req.params.tweetId = "123456"

// Get Timeline (req.query for pagination)
GET    /api/timeline?limit=20&sinceId=123456
// req.query = {limit: "20", sinceId: "123456"}

// Search Tweets (req.query for filters)
GET    /api/search/tweets?q=nodejs&lang=en&result_type=popular
// req.query = {
//   q: "nodejs",
//   lang: "en",
//   result_type: "popular"
// }
```

### **Complete RESTful API Design:**

```javascript
// USERS RESOURCE
GET    /api/users                    // List users (query: page, limit, sort)
POST   /api/users                    // Create user (body: user data)
GET    /api/users/:userId           // Get user (params: userId)
PUT    /api/users/:userId           // Replace user (params: userId, body: full user)
PATCH  /api/users/:userId           // Update user (params: userId, body: partial)
DELETE /api/users/:userId           // Delete user (params: userId)

// NESTED RESOURCES: User's Tweets
GET    /api/users/:userId/tweets    // User's tweets (params: userId, query: page, limit)
POST   /api/users/:userId/tweets    // User posts tweet (params: userId, body: tweet)

// TWEETS RESOURCE  
GET    /api/tweets/:tweetId         // Get tweet (params: tweetId)
DELETE /api/tweets/:tweetId         // Delete tweet (params: tweetId)

// NESTED RESOURCES: Tweet Interactions
POST   /api/tweets/:tweetId/likes   // Like tweet (params: tweetId)
DELETE /api/tweets/:tweetId/likes   // Unlike tweet (params: tweetId)
GET    /api/tweets/:tweetId/likes   // Who liked tweet (params: tweetId, query: page)
POST   /api/tweets/:tweetId/retweets // Retweet (params: tweetId)
GET    /api/tweets/:tweetId/retweets // Retweeters (params: tweetId)

// SEARCH (Special endpoint)
GET    /api/search                  // Search across resources (query: q, type, limit)
```