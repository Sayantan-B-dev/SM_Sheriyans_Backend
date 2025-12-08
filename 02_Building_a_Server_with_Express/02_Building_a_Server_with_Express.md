# **EXPRESS.JS: DEFINITIVE, COMPLETE EXPLANATION**

## **1. WHY WE DON'T USE HTTP MODULE DIRECTLY**

### **Exact Problem Breakdown:**

**Express solves 7 fundamental problems with raw HTTP module:**

1. **NO ROUTING SYSTEM**
   ```javascript
   // HTTP Module: Manual routing
   if (req.url === '/users' && req.method === 'GET') {
       // Handle GET /users
   } else if (req.url === '/users' && req.method === 'POST') {
       // Handle POST /users
   }
   // Problem: Exponential complexity with routes
   
   // Express: Automatic routing
   app.get('/users', handler);
   app.post('/users', handler);
   // Solution: Clean, declarative routing
   ```

2. **NO MIDDLEWARE PIPELINE**
   ```javascript
   // HTTP Module: Manual request processing
   let body = '';
   req.on('data', chunk => body += chunk);
   req.on('end', () => {
       const data = JSON.parse(body); // Manual JSON parsing
       // Now process request
   });
   // Problem: Repetitive code for every route
   
   // Express: Middleware pipeline
   app.use(express.json()); // Parse JSON once
   app.post('/users', (req, res) => {
       // req.body is already parsed
   });
   // Solution: Reusable request processing
   ```

3. **NO ERROR HANDLING STRUCTURE**
   ```javascript
   // HTTP Module: Manual error handling
   try {
       // Handle request
   } catch (err) {
       res.writeHead(500);
       res.end('Error');
   }
   // Problem: Error handling duplicated everywhere
   
   // Express: Centralized error handling
   app.use((err, req, res, next) => {
       // Global error handler
       res.status(500).json({error: err.message});
   });
   // Solution: Single error handling point
   ```

4. **NO STATIC FILE SERVING**
   ```javascript
   // HTTP Module: Manual file serving
   if (req.url.startsWith('/public/')) {
       const filePath = path.join(__dirname, req.url);
       fs.readFile(filePath, (err, data) => {
           // Handle errors, set headers, send file
       });
   }
   // Problem: Complex file serving logic
   
   // Express: Built-in static serving
   app.use(express.static('public'));
   // Solution: One-line static file server
   ```

5. **NO TEMPLATE ENGINE SUPPORT**
   ```javascript
   // HTTP Module: Manual HTML generation
   fs.readFile('template.html', 'utf8', (err, template) => {
       const html = template.replace('{{name}}', userName);
       res.end(html);
   });
   // Problem: Template mixing with logic
   
   // Express: Template engine integration
   app.set('view engine', 'ejs');
   res.render('user', {name: userName});
   // Solution: Separation of concerns
   ```

6. **NO REQUEST/RESPONSE ENHANCEMENTS**
   ```javascript
   // HTTP Module: Basic objects
   // req has only: url, method, headers
   // res has only: writeHead(), write(), end()
   
   // Express: Enhanced objects
   // req adds: params, query, body, cookies, ip, etc.
   // res adds: json(), send(), render(), status(), etc.
   ```

7. **NO SECURITY FEATURES**
   ```javascript
   // HTTP Module: No built-in security
   // Manual: CORS, CSRF, XSS protection needed
   
   // Express: Middleware ecosystem
   app.use(helmet()); // 11 security headers
   app.use(cors());   // CORS handling
   // Solution: Security as middleware
   ```

## **2. EXPRESS FRAMEWORK - COMPLETE DEFINITION**

### **Express = Routing Engine + Middleware Container**

**Mathematical Definition:**
```
Express = Σ(Middleware) + Router(Request → Response)
Where:
  Σ = Middleware pipeline (sequential execution)
  Router = Route matching engine
  Request = HTTP IncomingMessage enhanced
  Response = HTTP ServerResponse enhanced
```

**Technical Architecture:**
```javascript
class Express {
    // Core Components:
    1. Application (app) - Main container
    2. Router - Route matching system
    3. Request - Enhanced req object
    4. Response - Enhanced res object
    5. Middleware - Processing functions
    
    // Execution Flow:
    Request → Middleware Stack → Router → Response
            ↑                    ↑
        (Modify req/res)   (Find matching route)
}
```

**Express vs HTTP Module Comparison:**
```
HTTP MODULE (Raw)              EXPRESS (Framework)
-------------                  -------------
1. Manual routing              Automatic routing
2. No middleware               Middleware pipeline
3. Basic req/res               Enhanced req/res
4. No template engine          Template engine support
5. Manual static files         Built-in static serving
6. No error handling           Structured error handling
7. 100+ lines for basic app   10 lines for basic app
```

## **3. EXPRESS SERVER CREATION - STEP BY STEP**

### **What Happens When You Call `express()`:**

```javascript
// Behind the scenes of express()
function createExpressApp() {
    const app = function(req, res, next) {
        // This function handles incoming requests
        app.handle(req, res, next);
    };
    
    // Mixin all methods from prototypes
    Object.setPrototypeOf(app, proto);
    
    // Initialize app properties
    app.cache = {};
    app.engines = {};
    app.settings = {};
    app.locals = {};
    
    // Default settings
    app.set('x-powered-by', true);
    app.set('etag', 'weak');
    app.set('env', process.env.NODE_ENV || 'development');
    
    // Create router instance
    app._router = new Router();
    
    return app;
}

// So when you do:
const app = express();
// You get a function that can handle HTTP requests
```

### **Why `app.listen()` Starts the Server:**

```javascript
// app.listen() implementation:
app.listen = function listen() {
    const server = http.createServer(this); // 'this' is the Express app
    return server.listen.apply(server, arguments);
};

// What this means:
// 1. `this` refers to the Express application
// 2. Express app is a function (request handler)
// 3. http.createServer() expects a request handler function
// 4. So: Express app IS the request handler

// Therefore:
const app = express();
const server = http.createServer(app); // Express handles requests
server.listen(3000);

// Is equivalent to:
app.listen(3000);
```

## **4. REQUEST OBJECT (`req`) - COMPLETE SPECIFICATION**

### **`req` is an Enhanced `http.IncomingMessage`:**

**Native HTTP Module Properties (IncomingMessage):**
```javascript
req.httpVersion      // '1.1' or '2.0'
req.method           // 'GET', 'POST', etc.
req.url              // '/path?query=string'
req.headers          // Raw headers object
req.rawHeaders       // Array of [name, value, name, value...]
req.trailers         // Trailers for chunked encoding
req.rawTrailers      // Raw trailers array
req.socket           // Underlying net.Socket
req.connection       // Alias for socket (deprecated)
req.complete         // True if request fully received
req.aborted          // True if request aborted
req.upgrade          // True for WebSocket upgrade
```

**Express Adds These Properties:**

**1. `req.params` - Route Parameters:**
```javascript
// Route: /users/:userId/posts/:postId
// URL:   /users/123/posts/456
req.params = {
    userId: '123',
    postId: '456'
};

// Implementation:
// Express matches route pattern, extracts values
// Stores in params object
```

**2. `req.query` - Query String:**
```javascript
// URL: /search?q=express&page=2&sort=name
req.query = {
    q: 'express',
    page: '2',
    sort: 'name'
};

// Implementation:
// Express parses URL after ? using querystring module
// Converts to object with values as strings
```

**3. `req.body` - Request Body:**
```javascript
// POST /users with JSON: {"name": "John", "age": 30}
req.body = {
    name: 'John',
    age: 30
};

// Implementation:
// Middleware (express.json()) reads request body
// Parses based on Content-Type
// Populates req.body
```

**4. `req.cookies` / `req.signedCookies`:**
```javascript
// Cookie: session=abc123; theme=dark
req.cookies = {
    session: 'abc123',
    theme: 'dark'
};

// Implementation:
// cookie-parser middleware reads Cookie header
// Parses into object
```

**5. `req.path` vs `req.url`:**
```javascript
// URL: /api/users?id=123#section
req.url    // '/api/users?id=123#section' (full URL)
req.path   // '/api/users' (path only, no query/hash)
req.originalUrl // '/api/users?id=123#section' (original)

// Implementation:
// Express parses URL, extracts path component
```

**6. `req.hostname` / `req.ip`:**
```javascript
// Request from 192.168.1.1 with Host: example.com:3000
req.hostname // 'example.com' (without port)
req.host     // 'example.com:3000' (with port)
req.ip       // '192.168.1.1' (client IP)
req.ips      // ['192.168.1.1', 'proxy-ip'] (if behind proxy)
req.protocol // 'http' or 'https'
req.secure   // true if https
req.subdomains // ['api', 'v1'] for api.v1.example.com
```

**7. Request Validation Methods:**
```javascript
// Content negotiation
req.accepts('html')      // 'html' or false
req.accepts(['json', 'html']) // Best match or false
req.acceptsCharsets('utf-8') // true/false
req.acceptsEncodings('gzip') // true/false
req.acceptsLanguages('en')   // true/false

// Content type checking
req.is('json')          // true/false
req.is('application/json') // true/false
req.is('image/*')       // true/false
```

**8. Fresh/Stale Detection:**
```javascript
// For conditional GET requests
req.fresh  // true if cache is fresh
req.stale  // true if cache is stale

// Implementation:
// Checks If-None-Match (ETag) and If-Modified-Since headers
// Compares with response ETag/Last-Modified
```

**9. Request Security:**
```javascript
req.xhr // true if X-Requested-With: XMLHttpRequest
req.secure // true if req.protocol === 'https'
req.ips // Array of client IPs through proxies
```

## **5. RESPONSE OBJECT (`res`) - COMPLETE SPECIFICATION**

### **`res` is an Enhanced `http.ServerResponse`:**

**Native HTTP Module Methods:**
```javascript
res.writeHead(statusCode, [statusMessage], [headers])
res.write(chunk, [encoding], [callback])
res.end([data], [encoding], [callback])
res.addTrailers(headers)
res.setHeader(name, value)
res.getHeader(name)
res.removeHeader(name)
res.getHeaderNames()
res.getHeaders()
```

**Express Adds These Methods:**

**1. `res.send()` - Smart Response Sender:**
```javascript
// res.send() algorithm:
function send(body) {
    // 1. Determine Content-Type
    if (typeof body === 'string') {
        if (!this.get('Content-Type')) {
            this.type('html'); // Default to text/html
        }
    } else if (Buffer.isBuffer(body)) {
        if (!this.get('Content-Type')) {
            this.type('bin'); // application/octet-stream
        }
    } else if (typeof body === 'object') {
        if (!this.get('Content-Type')) {
            this.type('json'); // application/json
        }
        body = JSON.stringify(body);
    }
    
    // 2. Set Content-Length
    this.set('Content-Length', Buffer.byteLength(body));
    
    // 3. Send response
    this.end(body);
}

// Examples:
res.send('Hello')           // text/html
res.send('<h1>Hi</h1>')    // text/html
res.send({ok: true})       // application/json
res.send([1, 2, 3])        // application/json
res.send(Buffer.from('...')) // application/octet-stream
```

**2. `res.json()` - JSON Response:**
```javascript
// Always sends JSON
res.json({data: 'value'})      // Content-Type: application/json
res.json(null)                 // Sends 'null'
res.json([1, 2, 3])           // JSON array

// With status:
res.status(201).json({id: 123}) // Status 201 + JSON
```

**3. `res.status()` - Status Code:**
```javascript
// Sets status code
res.status(404)               // Returns res for chaining
res.status(500).send('Error') // Chain with send

// Implementation:
res.status = function(code) {
    this.statusCode = code;
    return this; // Allow chaining
};
```

**4. `res.set()` / `res.header()` - Headers:**
```javascript
// Set single header
res.set('Content-Type', 'text/html')

// Set multiple headers
res.set({
    'Content-Type': 'text/html',
    'Cache-Control': 'no-cache'
})

// res.header() is alias for res.set()
res.header('X-Powered-By', 'Express')
```

**5. `res.type()` - Content-Type Shortcut:**
```javascript
// Sets Content-Type based on file extension
res.type('html')     // text/html
res.type('json')     // application/json
res.type('png')      // image/png
res.type('txt')      // text/plain

// Implementation:
res.type = function(type) {
    return this.set('Content-Type', mime.lookup(type));
};
```

**6. `res.redirect()` - HTTP Redirect:**
```javascript
// Temporary redirect (302)
res.redirect('/new-path')

// Permanent redirect (301)
res.redirect(301, '/new-path')

// Back to referrer
res.redirect('back')

// External URL
res.redirect('https://google.com')

// Implementation:
res.redirect = function(url) {
    this.set('Location', url);
    this.status(302).end();
};
```

**7. `res.cookie()` - Set Cookie:**
```javascript
// Basic cookie
res.cookie('name', 'value')

// With options
res.cookie('session', 'abc123', {
    maxAge: 900000,       // Milliseconds
    expires: new Date(),  // Date object
    path: '/',            // Cookie path
    domain: '.example.com', // Domain
    secure: true,         // HTTPS only
    httpOnly: true,       // Not accessible via JS
    sameSite: 'strict'    // CSRF protection
})
```

**8. `res.render()` - Template Rendering:**
```javascript
// Render template with data
res.render('index', {title: 'Home', user: req.user})

// With callback
res.render('email', {data}, (err, html) => {
    if (!err) res.send(html);
})

// Implementation:
// 1. Looks for template in views directory
// 2. Passes data to template engine
// 3. Sends rendered HTML
```

**9. `res.sendFile()` - Send File:**
```javascript
// Send file
res.sendFile('/path/to/file.pdf')

// With options
res.sendFile('report.pdf', {
    root: __dirname + '/public',
    headers: {
        'Content-Disposition': 'attachment'
    },
    dotfiles: 'deny', // 'allow', 'deny', 'ignore'
    maxAge: '1d'      // Cache control
})
```

**10. `res.download()` - Force Download:**
```javascript
// Forces file download
res.download('/path/to/file.pdf')
res.download('/path/to/file.pdf', 'custom-name.pdf')
```

**11. `res.format()` - Content Negotiation:**
```javascript
// Different responses for different Accept headers
res.format({
    'text/plain': function() {
        res.send('plain text');
    },
    'text/html': function() {
        res.send('<h1>html</h1>');
    },
    'application/json': function() {
        res.json({message: 'json'});
    },
    'default': function() {
        res.status(406).send('Not Acceptable');
    }
});
```

**12. `res.location()` - Set Location Header:**
```javascript
// Sets Location header without redirecting
res.location('/new-url')
res.location('https://example.com')

// Used for 201 Created responses
res.status(201).location('/users/123').json(user)
```

**13. `res.vary()` - Vary Header:**
```javascript
// Sets Vary header for caching
res.vary('User-Agent')      // Vary: User-Agent
res.vary('Accept-Encoding') // Vary: Accept-Encoding

// Multiple values
res.vary('User-Agent, Accept-Encoding')
```

**14. `res.append()` - Append Header:**
```javascript
// Appends to existing header
res.append('Warning', '199 Miscellaneous')
// If Warning already exists, adds new value
```

**15. `res.links()` - Link Header:**
```javascript
// Sets Link header for pagination
res.links({
    next: 'http://api.example.com/users?page=2',
    last: 'http://api.example.com/users?page=5'
});
// Link: <http://...?page=2>; rel="next", <http://...?page=5>; rel="last"
```

**16. `res.sendStatus()` - Status with Message:**
```javascript
// Sends status code with default message
res.sendStatus(200) // Sends 'OK'
res.sendStatus(404) // Sends 'Not Found'
res.sendStatus(500) // Sends 'Internal Server Error'

// Implementation:
res.sendStatus = function(code) {
    return this.status(code).send(statuses[code]);
};
```

## **6. APIs IN EXPRESS - COMPLETE DEFINITION**

### **API = Application Programming Interface**

**Technical Definition:**
```
API = Set of Rules + Endpoints + Data Formats
Where:
  Rules = HTTP methods, status codes, error formats
  Endpoints = URLs that accept requests
  Data Formats = JSON, XML, Form data, etc.
```

**API in Express = Route Definition:**
```javascript
// API Endpoint Definition:
app.METHOD(PATH, HANDLER)

// Breakdown:
METHOD  = HTTP method (GET, POST, PUT, DELETE, etc.)
PATH    = URL path ('/', '/users', '/users/:id')
HANDLER = Function that processes request (req, res) => {}
```

**Complete API Example:**
```javascript
// RESTful User API
app.post('/api/users', createUser);     // CREATE
app.get('/api/users', getUsers);        // READ all
app.get('/api/users/:id', getUser);     // READ one
app.put('/api/users/:id', updateUser);  // UPDATE
app.delete('/api/users/:id', deleteUser); // DELETE

// Each handler follows same pattern:
function createUser(req, res) {
    // 1. Validate input (req.body)
    // 2. Process business logic
    // 3. Send response (res.json())
}
```

### **REST APIs - Roy Fielding's Dissertation (2000)**

**REST = Representational State Transfer**

**6 Constraints of REST:**
1. **Client-Server Architecture** - Separation of concerns
2. **Stateless** - No client context stored on server
3. **Cacheable** - Responses must define cacheability
4. **Uniform Interface** - Consistent interaction
5. **Layered System** - Intermediate servers allowed
6. **Code-on-Demand (optional)** - Client can download code

**REST in Express Implementation:**
```javascript
// 1. Client-Server: Express is server, browser/curl is client
// 2. Stateless: Each request contains all needed information
// 3. Cacheable: Use Cache-Control, ETag headers
// 4. Uniform Interface:
//    - Resource identification (URLs)
//    - Resource manipulation through representations (JSON)
//    - Self-descriptive messages (Content-Type headers)
//    - Hypermedia as engine of application state (HATEOAS)
```

## **7. REQUEST DATA - THREE WAYS EXPLAINED**

### **1. `req.body` - Request Body**

**When used:** POST, PUT, PATCH requests
**Content-Type:** application/json, application/x-www-form-urlencoded, multipart/form-data

```javascript
// How it works:
// 1. Client sends request with body
// 2. Express middleware parses body
// 3. Result stored in req.body

// Example: POST /users
// Request body: {"name": "John", "age": 30}
// Content-Type: application/json

app.use(express.json()); // Required middleware

app.post('/users', (req, res) => {
    console.log(req.body); // {name: "John", age: 30}
    res.json({received: req.body});
});

// Without middleware:
// req.body = undefined
// With middleware:
// req.body = parsed JSON
```

**Body Parsing Middleware Required:**
```javascript
// JSON bodies
app.use(express.json());

// URL-encoded form data
app.use(express.urlencoded({extended: true}));

// Raw text
app.use(express.text());

// Raw buffer
app.use(express.raw());

// Custom type
app.use(express.raw({type: 'application/octet-stream'}));
```

### **2. `req.query` - Query Parameters**

**When used:** GET requests (typically)
**Location:** After `?` in URL
**Format:** `key=value&key=value`

```javascript
// How it works:
// 1. Client requests URL with query string
// 2. Express automatically parses query string
// 3. Result stored in req.query

// Example: GET /search?q=express&page=2
app.get('/search', (req, res) => {
    console.log(req.query); // {q: "express", page: "2"}
    res.json({query: req.query});
});

// Complex query strings:
// /api?filter[name]=John&filter[age]=30&sort=-createdAt
// req.query = {
//   filter: {name: "John", age: "30"},
//   sort: "-createdAt"
// }
```

**Query String Parsing Rules:**
```javascript
// Basic: ?key=value
req.query = {key: "value"}

// Multiple: ?key1=val1&key2=val2
req.query = {key1: "val1", key2: "val2"}

// Array: ?tags=js&tags=node
req.query = {tags: ["js", "node"]}

// Nested: ?filter[name]=John
req.query = {filter: {name: "John"}} // With extended: true

// No value: ?flag
req.query = {flag: ""}
```

### **3. `req.params` - Route Parameters**

**When used:** Dynamic URL segments
**Location:** In URL path, defined with `:paramName`

```javascript
// How it works:
// 1. Define route with parameters: /users/:userId
// 2. Client requests matching URL: /users/123
// 3. Express extracts values, stores in req.params

// Example:
app.get('/users/:userId', (req, res) => {
    console.log(req.params); // {userId: "123"}
    res.json({user: req.params.userId});
});

// Multiple parameters:
app.get('/users/:userId/posts/:postId', (req, res) => {
    // URL: /users/123/posts/456
    req.params = {userId: "123", postId: "456"}
});

// Optional parameters:
app.get('/users/:userId?', (req, res) => {
    // Matches: /users AND /users/123
    // req.params.userId = undefined or "123"
});
```

**Route Parameter Constraints:**
```javascript
// Regular expression constraint
app.get('/users/:id(\\d+)', (req, res) => {
    // Only matches numeric IDs
    // /users/123 ✓
    // /users/abc ✗
});

// Multiple constraints
app.get('/:type(book|movie)/:id', (req, res) => {
    // Matches: /book/123, /movie/456
    // Doesn't match: /game/789
});
```

## **8. REQUEST-RESPONSE LIFECYCLE - STEP BY STEP**

### **Complete Flow Diagram:**

```
CLIENT → REQUEST → EXPRESS APP → MIDDLEWARE STACK → ROUTER → HANDLER → RESPONSE → CLIENT
          ↑          ↓              ↓                ↓         ↓         ↓        ↑
        HTTP      Create       Process req      Find match  Execute   Send back Receive
        Request   req/res      Modify req/res    Route      Logic     Response  Response
```

### **Detailed Step-by-Step:**

**Step 1: Client Sends Request**
```javascript
// Browser/curl sends:
GET /api/users?id=123 HTTP/1.1
Host: localhost:3000
Accept: application/json
```

**Step 2: Node.js HTTP Server Receives**
```javascript
// Node.js creates:
const req = new http.IncomingMessage(socket);
const res = new http.ServerResponse(req);

// Then calls Express app as handler:
app(req, res); // Express takes over
```

**Step 3: Express Creates Enhanced Objects**
```javascript
// Express wraps native objects:
req = Object.create(express.request);
res = Object.create(express.response);

// Copies native properties, adds Express properties
```

**Step 4: Middleware Pipeline Executes**
```javascript
// Executes middleware in registration order:
// 1. Morgan (logs request)
// 2. Helmet (security headers)
// 3. CORS (cross-origin)
// 4. Body parser (if needed)
// 5. Custom middleware

// Each middleware can:
// - Read/modify req/res
// - Call next() to continue
// - Send response to end chain
```

**Step 5: Router Finds Matching Route**
```javascript
// Router checks:
// 1. HTTP method matches? (GET)
// 2. URL path matches? (/api/users)
// 3. Are there route parameters? (None)
// 4. Execute route-specific middleware

// If no route matches:
// Continue to next middleware
// Eventually 404 handler
```

**Step 6: Route Handler Executes**
```javascript
// Handler function runs:
app.get('/api/users', (req, res) => {
    // 1. Access request data
    const id = req.query.id; // "123"
    
    // 2. Process business logic
    const user = database.findUser(id);
    
    // 3. Send response
    res.json(user);
});
```

**Step 7: Response Sent to Client**
```javascript
// Express sends:
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 45

{"id": "123", "name": "John"}

// Then closes connection (or keeps alive)
```

**Step 8: Client Receives Response**
```javascript
// Browser/curl receives response
// Parses JSON, updates UI, etc.

// For browsers:
fetch('/api/users?id=123')
    .then(res => res.json())
    .then(data => console.log(data));
```

### **Lifecycle with Error Handling:**

```
Request → Middleware 1 → Middleware 2 → Handler → Response
     ↓          ↓             ↓           ↓         ↓
  If error → next(err) → Error Middleware → Response
```

```javascript
// Error flow example:
app.get('/api/users', (req, res, next) => {
    try {
        throw new Error('Database error');
    } catch (err) {
        next(err); // Pass to error handler
    }
});

// Error handler (defined last):
app.use((err, req, res, next) => {
    res.status(500).json({error: err.message});
});
```

## **9. EXPRESS ROUTING - COMPLETE SYSTEM**

### **Route Matching Algorithm:**

```javascript
// Express maintains routing table:
const routes = [
    {method: 'GET', path: '/', handler: homeHandler},
    {method: 'GET', path: '/users', handler: usersHandler},
    {method: 'GET', path: '/users/:id', handler: userHandler},
    // ... more routes
];

// When request comes:
function matchRoute(req) {
    for (const route of routes) {
        if (route.method === req.method && 
            pathMatches(route.path, req.path)) {
            return route;
        }
    }
    return null; // No match
}
```

### **Path Matching Rules:**

```javascript
// Exact match:
app.get('/users', handler); // Matches: /users
                           // Not: /users/, /users/123

// Parameter match:
app.get('/users/:id', handler); // Matches: /users/123
                               // params: {id: '123'}

// Optional parameter:
app.get('/users/:id?', handler); // Matches: /users, /users/123

// Wildcard:
app.get('/files/*', handler); // Matches: /files/anything.png
                             // Not: /files

// Regular expression:
app.get(/.*fly$/, handler); // Matches: butterfly, dragonfly

// Multiple segments:
app.get('/products/:category/:id', handler);
// Matches: /products/electronics/123
```

### **Route Precedence Rules:**

```javascript
// Rule 1: Static routes before parameter routes
app.get('/users/new', handler); // First
app.get('/users/:id', handler); // Second

// Rule 2: More specific before less specific
app.get('/users/active', handler); // First
app.get('/users/:status', handler); // Second

// Rule 3: Order of definition matters
app.get('/users/:id', handler); // First defined
app.get('/users/active', handler); // Second defined
// /users/active will match :id with id='active' (WRONG!)

// Correct order:
app.get('/users/active', handler); // Specific first
app.get('/users/:id', handler);    // Generic second
```

## **10. MIDDLEWARE - COMPLETE EXPLANATION**

### **Middleware Definition:**

**Middleware = Function with signature:**
```javascript
function middleware(req, res, next) {
    // 1. Can read/modify req/res
    // 2. Must call next() or send response
    // 3. Can be async
}

// Error middleware (4 parameters):
function errorMiddleware(err, req, res, next) {
    // Handle errors
}
```

### **Middleware Execution Model:**

```javascript
// Express maintains middleware stack:
const middlewareStack = [
    loggerMiddleware,
    authMiddleware,
    parseBodyMiddleware,
    // ... more
];

// Execution:
function handleRequest(req, res) {
    let index = 0;
    
    function next(err) {
        if (err) {
            // Find error handler
            return handleError(err);
        }
        
        const middleware = middlewareStack[index++];
        
        if (!middleware) {
            // No more middleware, send 404
            return res.status(404).send('Not found');
        }
        
        try {
            middleware(req, res, next);
        } catch (err) {
            next(err);
        }
    }
    
    next();
}
```

### **Middleware Types:**

**1. Application-level (All routes):**
```javascript
app.use((req, res, next) => {
    // Runs for every request
    next();
});
```

**2. Path-specific (Specific routes):**
```javascript
app.use('/api', (req, res, next) => {
    // Only for routes starting with /api
    next();
});
```

**3. Route-specific (Single route):**
```javascript
app.get('/users', authMiddleware, (req, res) => {
    // authMiddleware runs only for GET /users
});
```

**4. Error-handling (Errors only):**
```javascript
app.use((err, req, res, next) => {
    // Only runs when next(err) is called
});
```

**5. Built-in (Express provides):**
```javascript
app.use(express.json());     // JSON parsing
app.use(express.static());   // Static files
```

**6. Third-party (NPM packages):**
```javascript
app.use(cors());        // CORS handling
app.use(helmet());      // Security headers
app.use(morgan());      // Request logging
```

## **11. REAL-WORLD EXPRESS APPLICATION**

### **Complete Production Setup:**

```javascript
// app.js - Complete Express application
const express = require('express');
const app = express();

// ========== CONFIGURATION ==========
app.set('trust proxy', 1); // Trust first proxy
app.set('x-powered-by', false); // Remove header
app.set('env', process.env.NODE_ENV || 'development');

// ========== SECURITY MIDDLEWARE ==========
const helmet = require('helmet');
app.use(helmet({
    contentSecurityPolicy: false, // Configure as needed
    hsts: { maxAge: 31536000, includeSubDomains: true }
}));

const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per window
});
app.use('/api/', apiLimiter);

// ========== REQUEST PARSING ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== CORS ==========
const cors = require('cors');
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========== LOGGING ==========
const morgan = require('morgan');
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ========== STATIC FILES ==========
app.use(express.static('public', {
    maxAge: '7d',
    etag: true,
    lastModified: true
}));

// ========== SESSION & AUTH ==========
const session = require('express-session');
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// ========== ROUTES ==========
app.use('/', require('./routes/index'));
app.use('/api/v1', require('./routes/api'));

// ========== ERROR HANDLING ==========
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    const status = err.status || 500;
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;
    
    res.status(status).json({
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ========== GRACEFUL SHUTDOWN ==========
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
});
```
