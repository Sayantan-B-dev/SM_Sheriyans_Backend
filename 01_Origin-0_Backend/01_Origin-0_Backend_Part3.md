# **SERVERS: COMPLETE ATOMIC ANALYSIS**

## **1. WHAT IS A SERVER? - COMPLETE FUNDAMENTAL ANALYSIS**

### **1.1 Core Definition - Multi-Layered Perspective**

**Literal Definition:**
```
Server (noun): A computational entity that provides services or resources to other entities (clients).

Etymology: From "to serve" (Old French: servir, Latin: servire)
```

**Technical Definition at Multiple Levels:**

**Physical Layer (Hardware):**
```
A physical computer with specialized components:
├── High-Reliability Components:
│   ├── ECC RAM (Error-Correcting Code memory)
│   ├── RAID Configurations (Redundant Array of Independent Disks)
│   │   - RAID 1: Mirroring
│   │   - RAID 5: Striping with parity
│   │   - RAID 10: Mirroring + Striping
│   ├── Redundant Power Supplies (1+1, 2+1 configurations)
│   └── Hot-swappable components (drives, fans, PSUs)
├── Server Form Factors:
│   ├── Rackmount (1U, 2U, 4U heights)
│   ├── Tower (standalone)
│   ├── Blade (modular, shared infrastructure)
│   └── Microservers (low-power, dense)
├── Network Connectivity:
│   ├── Multiple NICs (Network Interface Cards)
│   ├── Bonding/LACP (Link Aggregation)
│   ├── 10GbE, 40GbE, 100GbE interfaces
│   └── Remote Management (IPMI, iDRAC, iLO)
└── Specialized Hardware:
    ├── TPU (Tensor Processing Units) - AI servers
    ├── GPU Clusters - Rendering/ML servers
    └── ASICs (Application-Specific ICs) - Crypto/network servers
```

**Logical Layer (Software):**
```
Server Process = Program + Network Socket + Service Logic

Software Server Components:
├── Network Stack Implementation:
│   ├── TCP/IP Protocol Stack (OSI Layers 3-4)
│   ├── Socket API (Berkeley sockets, Winsock)
│   ├── Connection Management
│   └── Security Layer (TLS/SSL)
├── Service Logic:
│   ├── Request Parsing
│   ├── Business Logic Execution
│   ├── Data Access (Database, Filesystem)
│   └── Response Generation
├── Resource Management:
│   ├── Memory Pooling
│   ├── Connection Pooling
│   ├── Thread/Process Management
│   └── Cache Management
└── Administration:
    ├── Logging (Structured logging, log levels)
    ├── Monitoring (Metrics collection)
    ├── Configuration Management
    └── Health Checks
```

**Conceptual Layer (Role-Based):**
```
Server Roles in Client-Server Architecture:
┌─────────────────┐     Request      ┌─────────────────┐
│    CLIENT       │─────────────────▶│    SERVER       │
│                 │◀─────────────────│                 │
│ - Initiates     │    Response      │ - Listens       │
│ - Makes demands │                  │ - Waits         │
│ - Temporary     │                  │ - Permanent     │
│ - Many clients  │                  │ - Few servers   │
│ - User-facing   │                  │ - Backend       │
└─────────────────┘                  └─────────────────┘

Key Characteristics:
1. Passive: Waits for client requests (listening state)
2. Shared: Serves multiple clients concurrently
3. Centralized: Single point of service provision
4. Persistent: Runs continuously (daemon process)
```

### **1.2 Historical Evolution of Servers**

**Chronological Development:**
```
1960s: Mainframe Era
  - IBM System/360: One server, many dumb terminals
  - Time-sharing systems: Multiple users share single computer
  - Protocol: Proprietary terminal protocols (3270, VT100)

1970s: Minicomputer Era  
  - DEC PDP-11, VAX: Departmental servers
  - Client-server model emerges
  - Early networking: ARPANET (TCP/IP development)

1980s: File Server Era
  - Novell NetWare, Banyan VINES
  - Dedicated file/print servers
  - PC networks with server-centric design

1990s: Web Server Revolution
  - 1991: First web server (CERN httpd)
  - 1994: Apache HTTP Server (open source)
  - 1995: Internet Information Services (IIS)
  - LAMP Stack: Linux, Apache, MySQL, PHP

2000s: Application Server Era
  - Java EE application servers (WebLogic, WebSphere)
  - .NET Framework with IIS
  - Service-Oriented Architecture (SOA)

2010s: Cloud & Microservices
  - AWS EC2 (2006), Azure (2010), Google Cloud (2011)
  - Containerization: Docker (2013)
  - Orchestration: Kubernetes (2014)
  - Serverless: AWS Lambda (2014)

2020s: Edge & Specialized Servers
  - Edge computing servers (CDN edges)
  - Serverless platforms maturation
  - AI/ML inference servers
  - WebAssembly runtime servers
```

### **1.3 Server Classification Matrix**

**By Service Type:**
```
Web Server:
  - Protocols: HTTP/1.1, HTTP/2, HTTP/3 (QUIC)
  - Examples: Nginx, Apache, Caddy, Node.js http module
  - Purpose: Serve web pages, REST APIs, static files

Application Server:
  - Function: Execute business logic, connect to databases
  - Examples: Tomcat, JBoss, Node.js with Express
  - Features: Session management, connection pooling

Database Server:
  - Function: Store, retrieve, manipulate data
  - Examples: MySQL, PostgreSQL, MongoDB, Redis
  - Protocols: SQL over TCP, wire protocols

File Server:
  - Function: Centralized file storage
  - Protocols: SMB/CIFS, NFS, FTP, SFTP
  - Examples: Windows File Server, Samba, vsftpd

Mail Server:
  - Protocols: SMTP, IMAP, POP3
  - Examples: Postfix, Exchange, Dovecot
  - Functions: Send, receive, store emails

DNS Server:
  - Protocol: DNS (UDP port 53)
  - Examples: BIND, PowerDNS, dnsmasq
  - Function: Domain name to IP resolution

Proxy Server:
  - Types: Forward proxy, reverse proxy
  - Examples: Squid, HAProxy, Nginx
  - Functions: Caching, load balancing, security

Game Server:
  - Real-time multiplayer synchronization
  - Examples: Custom UDP-based protocols
  - Challenges: Low latency, state synchronization
```

**By Architecture:**
```
Monolithic Server:
  - Single process handles all functions
  - Pros: Simple deployment, easier debugging
  - Cons: Scaling limitations, single point of failure

Microservices Server:
  - Multiple specialized servers
  - Pros: Independent scaling, technology diversity
  - Cons: Complex orchestration, network overhead

Serverless:
  - Function-as-a-Service (FaaS)
  - Examples: AWS Lambda, Azure Functions
  - Pros: No server management, auto-scaling
  - Cons: Cold starts, vendor lock-in

Edge Server:
  - Deployed at network edge (close to users)
  - Examples: Cloudflare Workers, AWS Lambda@Edge
  - Purpose: Reduce latency, distribute load

Peer-to-Peer:
  - No central server, nodes act as both client and server
  - Examples: BitTorrent, WebRTC (partially)
  - Characteristics: Decentralized, resilient
```

### **1.4 Server Lifecycle - Complete Process**

**Server Startup Sequence:**
```
Phase 1: Initialization
  1. Binary Loading: OS loads server executable into memory
  2. Memory Allocation:
     - Text segment (code)
     - Data segment (global/static variables)
     - Heap (dynamic memory)
     - Stack (function calls)
  3. Module Loading: Load shared libraries (DLLs, .so files)

Phase 2: Configuration
  1. Read Configuration Files:
     - Command-line arguments
     - Environment variables
     - Configuration files (JSON, YAML, .ini, .conf)
     - Database configuration
  2. Validate Configuration:
     - Port availability check
     - File permission verification
     - Dependency validation

Phase 3: Resource Acquisition
  1. Network Setup:
     - Create socket: socket()
     - Bind to address/port: bind()
     - Set socket options: setsockopt()
     - Start listening: listen()
  2. Database Connections:
     - Connection pool initialization
     - Authentication and session setup
  3. File Handles:
     - Log files open
     - Configuration files read
     - Cache directories created

Phase 4: Service Initialization
  1. Internal State Setup:
     - Cache warming (if applicable)
     - In-memory data structures
     - Worker thread/process creation
  2. Signal Handler Setup:
     - SIGTERM (graceful shutdown)
     - SIGINT (interrupt)
     - SIGHUP (reload configuration)
  3. Health Check Endpoints:
     - /health, /ready, /live endpoints

Phase 5: Main Loop Entry
  1. Event Loop Start:
     - epoll/kqueue/IOCP setup
     - Accept connection loop begins
  2. Service Announcement:
     - Log "Server started on port X"
     - Service discovery registration (if applicable)
  3. Ready State:
     - Accepting client connections
     - Processing requests
```

**Server Shutdown Sequence:**
```
Phase 1: Shutdown Initiation
  Trigger: SIGTERM, SIGINT, /shutdown endpoint, service stop

Phase 2: Graceful Shutdown
  1. Stop accepting new connections:
     - Close listening socket
     - Return 503 Service Unavailable for new requests
  2. Complete in-flight requests:
     - Allow existing requests to complete
     - Timeout enforcement (e.g., 30 seconds)
  3. Connection cleanup:
     - Send TCP FIN packets
     - Wait for ACKs (TCP graceful close)

Phase 3: Resource Cleanup
  1. Database connections:
     - Return connections to pool
     - Rollback active transactions
     - Close pool
  2. File handles:
     - Flush buffers to disk
     - Close open files
  3. Memory cleanup:
     - Free allocated memory
     - Clear caches
  4. Child processes:
     - Send SIGTERM to child processes
     - Wait for termination

Phase 4: Process Termination
  1. Exit code determination:
     - 0: Successful shutdown
     - 1-255: Error codes
  2. Final logging:
     - "Server shutting down" message
     - Statistics logging (uptime, requests served)
  3. Process exit: exit()
```

## **2. HTTP MODULE - COMPLETE IMPLEMENTATION ANALYSIS**

### **2.1 HTTP Module Architecture**

**Module Structure:**
```
http module source (Node.js lib/http.js):
├── Core Classes:
│   ├── Server (extends net.Server)
│   ├── ClientRequest (extends stream.Writable)
│   ├── ServerResponse (extends stream.Writable)
│   ├── IncomingMessage (extends stream.Readable)
│   └── Agent (connection management)
├── Constants:
│   ├── HTTP methods (GET, POST, etc.)
│   ├── Status codes (200, 404, 500, etc.)
│   └── HTTP versions
├── Parser:
│   ├── HTTP request parser (C++ binding)
│   ├── HTTP response parser
│   └── Chunked encoding handler
└── Utilities:
    ├── request() - Create client request
    ├── createServer() - Create HTTP server
    ├── get() - Convenience for GET requests
    └── globalAgent - Default connection agent
```

**TCP/IP Layer Integration:**
```javascript
// Underlying TCP socket relationship
const net = require('net');
const http = require('http');

// HTTP server is essentially a TCP server with HTTP parsing
const tcpServer = net.createServer((socket) => {
  // Raw TCP socket
  socket.on('data', (data) => {
    // Manually parse HTTP
    console.log('Raw TCP data:', data.toString());
  });
});

// HTTP server adds parsing layer
const httpServer = http.createServer((req, res) => {
  // Already parsed HTTP request
  console.log('Parsed HTTP method:', req.method);
  console.log('Parsed HTTP headers:', req.headers);
});
```

### **2.2 Creating Server with HTTP - Complete Process**

**Detailed Server Creation Process:**

```javascript
// Complete HTTP server with all options
const http = require('http');

// Option 1: Basic server
const server = http.createServer((request, response) => {
  // Request handler
});

// Option 2: Server with options
const serverWithOptions = http.createServer({
  // Socket/Server options
  keepAlive: true,
  keepAliveInitialDelay: 1000,
  
  // Connection timeout (milliseconds)
  timeout: 120000,
  
  // Maximum header size (default: 16KB)
  maxHeaderSize: 16384,
  
  // Require Host header (HTTP/1.1 requirement)
  requireHostHeader: true,
  
  // Allow half-open sockets
  allowHalfOpen: false,
  
  // Pause on connect (for rate limiting)
  pauseOnConnect: false,
  
  // No delay (disable Nagle's algorithm)
  noDelay: true,
  
  // Keep-alive timeout
  keepAliveTimeout: 5000,
  
  // Maximum requests per socket
  maxRequestsPerSocket: 0, // 0 = unlimited
  
  // High water mark for sockets
  highWaterMark: 64 * 1024, // 64KB
  
  // Insecure HTTP parser (for leniency)
  insecureHTTPParser: false
}, (request, response) => {
  // Request handler
});

// Listening with all options
server.listen({
  port: 3000,
  host: 'localhost',
  backlog: 511, // Maximum queue length for pending connections
  exclusive: false, // Share port with other servers?
  reuseAddress: true, // Allow address reuse
  ipv6Only: false, // IPv6-only socket
  // TCP-specific options
  // (passed to socket.setOption())
}, () => {
  console.log('Server listening on:', server.address());
  
  // Server properties after listening
  console.log('Server properties:');
  console.log('- Listening:', server.listening); // true
  console.log('- Max headers count:', server.maxHeadersCount); // 2000
  console.log('- Headers timeout:', server.headersTimeout); // 60000ms
  console.log('- Timeout:', server.timeout); // 0 (disabled)
  console.log('- Keep-alive timeout:', server.keepAliveTimeout); // 5000ms
  console.log('- Request timeout:', server.requestTimeout); // 300000ms
});

// Alternative listening methods
server.listen(3000); // Port only
server.listen(3000, 'localhost'); // Port and host
server.listen(3000, 'localhost', () => {
  console.log('Server started');
});
server.listen('/tmp/server.sock'); // Unix domain socket
server.listen({
  path: '/tmp/server.sock',
  readableAll: true, // Unix socket permissions
  writableAll: true
});

// Handle server events
server.on('request', (req, res) => {
  // Already handled by createServer callback
  // But can also be handled here for additional processing
});

server.on('connection', (socket) => {
  // Raw TCP socket - can modify socket options
  socket.setTimeout(30000); // 30 second socket timeout
  socket.setNoDelay(true); // Disable Nagle's algorithm
  
  console.log('New connection from:', socket.remoteAddress);
  console.log('Socket buffer size:', socket.bufferSize);
});

server.on('close', () => {
  console.log('Server closed');
});

server.on('error', (err) => {
  console.error('Server error:', err);
  
  // Handle specific errors
  if (err.code === 'EADDRINUSE') {
    console.log('Port already in use');
    // Retry with different port
    server.listen(0); // Random port
  }
});

server.on('checkContinue', (req, res) => {
  // Handle HTTP 100 Continue
  // Client sent Expect: 100-continue header
  console.log('Client wants to continue');
  
  // Check if we should allow request body
  if (shouldAcceptRequest(req)) {
    res.writeContinue(); // Send 100 Continue
    // Request handler will be called with body
  } else {
    res.writeHead(417, { 'Expect': '100-continue' });
    res.end();
  }
});

server.on('checkExpectation', (req, res) => {
  // Handle other Expect headers
  console.log('Expect header:', req.headers.expect);
});

server.on('clientError', (err, socket) => {
  // Handle client errors (malformed requests, etc.)
  console.error('Client error:', err);
  
  if (socket.writable) {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
  }
  socket.destroy(); // Close connection
});
```

**HTTP/2 and HTTPS Integration:**
```javascript
// HTTPS server
const https = require('https');
const fs = require('fs');

const httpsOptions = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem'),
  
  // TLS options
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: [
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES128-GCM-SHA256'
  ].join(':'),
  honorCipherOrder: true,
  
  // HTTP/2
  allowHTTP1: true, // Allow HTTP/1.1 fallback
  // ALPN protocols: ['h2', 'http/1.1']
};

const httpsServer = https.createServer(httpsOptions, (req, res) => {
  console.log('Protocol:', req.httpVersion); // '2.0' or '1.1'
  console.log('Socket:', req.socket.alpnProtocol); // 'h2' or 'http/1.1'
  
  // HTTP/2 specific features
  if (req.httpVersion === '2.0') {
    // Stream priority, server push available
    // but Node.js HTTP/2 API is different
  }
  
  res.writeHead(200);
  res.end('HTTPS response');
});

httpsServer.listen(443);
```

## **3. REQUEST OBJECT - COMPLETE ANALYSIS**

### **3.1 Request Object Anatomy**

**IncomingMessage Class Structure:**
```javascript
// Simplified representation of http.IncomingMessage class
class IncomingMessage extends stream.Readable {
  constructor(socket) {
    super();
    
    // Connection properties
    this.socket = socket;           // net.Socket instance
    this.connection = socket;       // Alias for socket
    
    // HTTP properties
    this.httpVersion = null;        // '1.1', '2.0'
    this.httpVersionMajor = null;   // 1
    this.httpVersionMinor = null;   // 1
    
    // Request line
    this.method = null;             // 'GET', 'POST', etc.
    this.url = null;                // '/path?query=string'
    
    // Headers (lowercased keys)
    this.headers = {};              // { 'content-type': 'application/json' }
    this.rawHeaders = [];           // ['Content-Type', 'application/json', ...]
    this.trailers = {};             // Trailers (for chunked encoding)
    this.rawTrailers = [];
    
    // Timing
    this.complete = false;          // True when request fully received
    this.aborted = false;           // True if request aborted
    this.upgrade = false;           // True for WebSocket upgrade
    
    // Security
    this.socket = {
      remoteAddress: '192.168.1.1',
      remotePort: 54321,
      localAddress: '127.0.0.1',
      localPort: 3000,
      encrypted: false,             // true for HTTPS
      authorized: undefined,        // TLS client certificate
      getPeerCertificate: function() {},
      getCipher: function() {}
    };
    
    // URL components (populated by url.parse() if called)
    this._parsedUrl = null;
  }
  
  // Methods
  setTimeout(msecs, callback) { /* ... */ }
  destroy(error) { /* ... */ }
}
```

### **3.2 Request Properties - Complete Reference**

**URL Processing:**
```javascript
const http = require('http');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
  // URL Analysis - Multiple Approaches:
  
  // Approach 1: Manual parsing
  const parsedUrl = url.parse(req.url, true); // true = parse query string
  
  console.log('Full URL analysis:');
  console.log('- Raw URL:', req.url); // '/api/users?id=123&page=2#section'
  console.log('- Pathname:', parsedUrl.pathname); // '/api/users'
  console.log('- Query:', parsedUrl.query); // { id: '123', page: '2' }
  console.log('- Search:', parsedUrl.search); // '?id=123&page=2'
  console.log('- Hash:', parsedUrl.hash); // '#section'
  console.log('- Protocol:', parsedUrl.protocol); // null (not full URL)
  console.log('- Host:', parsedUrl.host); // null
  console.log('- Hostname:', parsedUrl.hostname); // null
  
  // Approach 2: WhatWG URL API (modern)
  const baseUrl = `http://${req.headers.host}`;
  const whatwgUrl = new URL(req.url, baseUrl);
  
  console.log('WhatWG URL:');
  console.log('- Origin:', whatwgUrl.origin); // 'http://localhost:3000'
  console.log('- Full href:', whatwgUrl.href);
  console.log('- URL.searchParams:', whatwgUrl.searchParams);
  
  // Query parameter access
  const id = whatwgUrl.searchParams.get('id'); // '123'
  const page = whatwgUrl.searchParams.get('page'); // '2'
  const allParams = Object.fromEntries(whatwgUrl.searchParams); // {id: '123', page: '2'}
  
  // Approach 3: Manual query string parsing
  const queryIndex = req.url.indexOf('?');
  if (queryIndex !== -1) {
    const queryString = req.url.substring(queryIndex + 1);
    const parsedQuery = querystring.parse(queryString);
    console.log('Manual query:', parsedQuery);
  }
  
  // URL path segments
  const pathSegments = parsedUrl.pathname.split('/').filter(Boolean);
  console.log('Path segments:', pathSegments); // ['api', 'users']
  
  // Handle different routes
  if (pathSegments[0] === 'api') {
    if (pathSegments[1] === 'users') {
      if (req.method === 'GET') {
        // GET /api/users
        if (pathSegments[2]) {
          // GET /api/users/:id
          const userId = pathSegments[2];
          console.log('Get user:', userId);
        } else {
          console.log('Get all users');
        }
      } else if (req.method === 'POST') {
        console.log('Create user');
      }
    } else if (pathSegments[1] === 'products') {
      console.log('Products API');
    }
  }
});
```

**Headers Analysis:**
```javascript
const server = http.createServer((req, res) => {
  // Headers are always lowercased in Node.js
  console.log('=== HEADERS ANALYSIS ===');
  
  // Common headers with examples
  console.log('Request Headers:');
  
  // Identity & Authentication
  console.log('- Host:', req.headers.host); // 'example.com:3000'
  console.log('- User-Agent:', req.headers['user-agent']); // 'Mozilla/5.0...'
  console.log('- Authorization:', req.headers.authorization); // 'Bearer token'
  console.log('- Cookie:', req.headers.cookie); // 'session=abc123'
  
  // Content Information
  console.log('- Content-Type:', req.headers['content-type']); // 'application/json'
  console.log('- Content-Length:', req.headers['content-length']); // '1024'
  console.log('- Content-Encoding:', req.headers['content-encoding']); // 'gzip'
  
  // Cache & Conditional Requests
  console.log('- If-Modified-Since:', req.headers['if-modified-since']);
  console.log('- If-None-Match:', req.headers['if-none-match']);
  console.log('- Cache-Control:', req.headers['cache-control']);
  
  // CORS & Security
  console.log('- Origin:', req.headers.origin); // 'http://localhost:8080'
  console.log('- Access-Control-Request-Method:', req.headers['access-control-request-method']);
  console.log('- Access-Control-Request-Headers:', req.headers['access-control-request-headers']);
  
  // Accept Headers
  console.log('- Accept:', req.headers.accept); // 'application/json, text/html'
  console.log('- Accept-Encoding:', req.headers['accept-encoding']); // 'gzip, deflate, br'
  console.log('- Accept-Language:', req.headers['accept-language']); // 'en-US,en;q=0.9'
  
  // Connection Management
  console.log('- Connection:', req.headers.connection); // 'keep-alive'
  console.log('- Upgrade:', req.headers.upgrade); // 'websocket'
  
  // Rate Limiting
  console.log('- X-RateLimit-Limit:', req.headers['x-ratelimit-limit']);
  console.log('- X-RateLimit-Remaining:', req.headers['x-ratelimit-remaining']);
  
  // Custom Headers
  console.log('- X-API-Key:', req.headers['x-api-key']);
  console.log('- X-Request-ID:', req.headers['x-request-id']);
  
  // Raw headers (preserve original casing)
  console.log('Raw headers array:');
  for (let i = 0; i < req.rawHeaders.length; i += 2) {
    console.log(`  ${req.rawHeaders[i]}: ${req.rawHeaders[i + 1]}`);
  }
  
  // Check for specific headers
  const hasJsonContent = req.headers['content-type']?.includes('application/json');
  const isAjaxRequest = req.headers['x-requested-with'] === 'XMLHttpRequest';
  const isMobile = /mobile/i.test(req.headers['user-agent'] || '');
  
  console.log('Derived info:');
  console.log('- Is JSON:', hasJsonContent);
  console.log('- Is AJAX:', isAjaxRequest);
  console.log('- Is Mobile:', isMobile);
});
```

### **3.3 Request Body Handling - Complete Methods**

**Stream-Based Body Reading:**
```javascript
const server = http.createServer((req, res) => {
  console.log('=== REQUEST BODY HANDLING ===');
  
  // Method 1: Event-based streaming (for large bodies)
  let bodyChunks = [];
  let totalBytes = 0;
  const maxBodySize = 10 * 1024 * 1024; // 10MB limit
  
  req.on('data', (chunk) => {
    totalBytes += chunk.length;
    
    // Check size limit
    if (totalBytes > maxBodySize) {
      req.destroy(); // Kill connection
      res.writeHead(413, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request body too large' }));
      return;
    }
    
    bodyChunks.push(chunk);
    console.log(`Received chunk: ${chunk.length} bytes (total: ${totalBytes})`);
  });
  
  req.on('end', () => {
    if (totalBytes === 0) {
      console.log('No request body');
      handleRequest(req, res, null);
      return;
    }
    
    // Combine chunks
    const bodyBuffer = Buffer.concat(bodyChunks);
    
    // Parse based on content type
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('application/json')) {
      try {
        const jsonBody = JSON.parse(bodyBuffer.toString('utf8'));
        console.log('Parsed JSON:', jsonBody);
        handleRequest(req, res, jsonBody);
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = querystring.parse(bodyBuffer.toString('utf8'));
      console.log('Parsed form data:', formData);
      handleRequest(req, res, formData);
    } else if (contentType.includes('multipart/form-data')) {
      // For multipart, use a library like busboy or formidable
      console.log('Multipart form data - use specialized library');
      handleRequest(req, res, { raw: bodyBuffer });
    } else {
      // Raw text/binary
      console.log('Raw body:', bodyBuffer.toString('utf8').substring(0, 100));
      handleRequest(req, res, bodyBuffer);
    }
  });
  
  req.on('error', (error) => {
    console.error('Request error:', error);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Request processing failed' }));
    }
  });
  
  // Method 2: Using async iterators (Node.js 10+)
  if (typeof req[Symbol.asyncIterator] === 'function') {
    async function readBodyAsync() {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    
    // Can be called but conflicts with event-based approach
  }
  
  // Method 3: Using pipe to write to file or other stream
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    const fs = require('fs');
    const writeStream = fs.createWriteStream('upload.bin');
    req.pipe(writeStream);
    
    writeStream.on('finish', () => {
      console.log('File upload complete');
      res.writeHead(200);
      res.end('Upload received');
    });
  }
});

function handleRequest(req, res, body) {
  // Process request with body
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    method: req.method,
    url: req.url,
    bodyReceived: body !== null
  }));
}
```

### **3.4 Request Methods - Complete Reference**

**HTTP Methods Implementation:**
```javascript
const server = http.createServer((req, res) => {
  console.log(`Method: ${req.method}, URL: ${req.url}`);
  
  // HTTP Method Routing Table
  switch (req.method) {
    case 'GET':
      handleGet(req, res);
      break;
      
    case 'POST':
      handlePost(req, res);
      break;
      
    case 'PUT':
      handlePut(req, res);
      break;
      
    case 'DELETE':
      handleDelete(req, res);
      break;
      
    case 'PATCH':
      handlePatch(req, res);
      break;
      
    case 'HEAD':
      handleHead(req, res);
      break;
      
    case 'OPTIONS':
      handleOptions(req, res);
      break;
      
    case 'TRACE':
      handleTrace(req, res);
      break;
      
    case 'CONNECT':
      handleConnect(req, res);
      break;
      
    default:
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
  }
});

// GET - Retrieve resource
function handleGet(req, res) {
  // GET should be idempotent and safe (no side effects)
  console.log('GET request characteristics:');
  console.log('- Should be cacheable');
  console.log('- Should not modify server state');
  console.log('- Can have query parameters');
  console.log('- Should return same result for same input');
  
  // Example: Return user data
  const userId = getUserIdFromUrl(req.url);
  if (userId) {
    // GET /users/123
    const user = getUserFromDatabase(userId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(user));
  } else {
    // GET /users
    const users = getAllUsers();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }
}

// POST - Create resource
function handlePost(req, res) {
  // POST is NOT idempotent - multiple identical POSTs create multiple resources
  console.log('POST request characteristics:');
  console.log('- Creates new resource');
  console.log('- Not idempotent (multiple POSTs = multiple creations)');
  console.log('- Usually has request body');
  console.log('- Returns 201 Created on success');
  
  readRequestBody(req, (body) => {
    const newUser = createUser(body);
    res.writeHead(201, {
      'Content-Type': 'application/json',
      'Location': `/users/${newUser.id}` // Standard for created resource
    });
    res.end(JSON.stringify(newUser));
  });
}

// PUT - Update/replace resource
function handlePut(req, res) {
  // PUT is idempotent - multiple identical PUTs have same effect as one
  console.log('PUT request characteristics:');
  console.log('- Updates entire resource (full replacement)');
  console.log('- Idempotent (multiple PUTs = same as one)');
  console.log('- Returns 200 OK or 204 No Content');
  
  readRequestBody(req, (body) => {
    const userId = getUserIdFromUrl(req.url);
    if (userId) {
      updateUser(userId, body);
      res.writeHead(204); // No Content
      res.end();
    } else {
      res.writeHead(400);
      res.end('User ID required');
    }
  });
}

// DELETE - Remove resource
function handleDelete(req, res) {
  console.log('DELETE request characteristics:');
  console.log('- Removes resource');
  console.log('- Idempotent (deleting already deleted = same result)');
  console.log('- Returns 204 No Content or 200 OK');
  
  const userId = getUserIdFromUrl(req.url);
  deleteUser(userId);
  res.writeHead(204);
  res.end();
}

// PATCH - Partial update
function handlePatch(req, res) {
  console.log('PATCH request characteristics:');
  console.log('- Partial update (not full replacement)');
  console.log('- Not necessarily idempotent (depends on operation)');
  console.log('- Returns 200 OK');
  
  readRequestBody(req, (body) => {
    const userId = getUserIdFromUrl(req.url);
    patchUser(userId, body);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ updated: true }));
  });
}

// HEAD - GET without body
function handleHead(req, res) {
  console.log('HEAD request characteristics:');
  console.log('- Same as GET but no response body');
  console.log('- Used to check resource existence/metadata');
  console.log('- Returns headers only');
  
  // Check if resource exists
  const userId = getUserIdFromUrl(req.url);
  const userExists = checkUserExists(userId);
  
  if (userExists) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': '1024', // Should match actual GET response length
      'Last-Modified': new Date().toUTCString()
    });
  } else {
    res.writeHead(404);
  }
  res.end(); // No body
}

// OPTIONS - Get allowed methods
function handleOptions(req, res) {
  console.log('OPTIONS request characteristics:');
  console.log('- Returns allowed HTTP methods');
  console.log('- Used for CORS preflight');
  
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'];
  
  res.writeHead(200, {
    'Allow': allowedMethods.join(', '),
    'Access-Control-Allow-Methods': allowedMethods.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400', // 24 hours cache
    'Content-Length': '0'
  });
  res.end();
}

// TRACE - Echo request (for debugging)
function handleTrace(req, res) {
  console.log('TRACE request characteristics:');
  console.log('- Echoes received request (for debugging)');
  console.log('- Often disabled for security');
  
  // Security: Should validate Max-Forwards header
  const maxForwards = req.headers['max-forwards'] || '0';
  
  res.writeHead(200, {
    'Content-Type': 'message/http'
  });
  
  // Echo back the request
  res.write(`${req.method} ${req.url} HTTP/${req.httpVersion}\r\n`);
  
  // Echo headers
  for (const [key, value] of Object.entries(req.headers)) {
    res.write(`${key}: ${value}\r\n`);
  }
  
  res.write('\r\n');
  res.end();
}

// CONNECT - Establish tunnel (for proxies)
function handleConnect(req, res) {
  console.log('CONNECT request characteristics:');
  console.log('- Establishes tunnel to another server');
  console.log('- Used for HTTPS proxying');
  console.log('- Returns 200 Connection Established on success');
  
  // Parse target host:port
  const target = req.url; // Format: hostname:port
  const [hostname, port] = target.split(':');
  
  // Create tunnel
  const net = require('net');
  const proxySocket = net.connect(port || 443, hostname, () => {
    res.writeHead(200, { 'Connection': 'keep-alive' });
    res.end('\r\n');
    
    // Pipe data between client and target
    req.socket.pipe(proxySocket);
    proxySocket.pipe(req.socket);
  });
  
  proxySocket.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(500);
    res.end();
  });
}
```

## **4. RESPONSE OBJECT - COMPLETE ANALYSIS**

### **4.1 Response Object Anatomy**

**ServerResponse Class Structure:**
```javascript
// Simplified representation of http.ServerResponse class
class ServerResponse extends stream.Writable {
  constructor(req) {
    super();
    
    // Request reference
    this.req = req; // The IncomingMessage that triggered this response
    
    // Status properties
    this.statusCode = 200;           // Default status code
    this.statusMessage = '';         // Status message ('OK', 'Not Found', etc.)
    
    // Headers
    this._headers = {};              // Internal headers storage
    this._headerNames = {};          // Map lowercase to actual case
    this._removedHeader = {};        // Track removed headers
    
    // State
    this.headersSent = false;        // True after writeHead() called
    this.sendDate = true;            // Automatically send Date header
    this.finished = false;           // True after end() called
    this.writableEnded = false;      // True after end() called
    this.writableFinished = false;   // True after all data flushed
    
    // Chunked encoding
    this.useChunkedEncodingByDefault = true;
    
    // Connection
    this.connection = null;          // Reference to socket
    this.socket = null;
    
    // Timing
    this._startAt = undefined;       // High-resolution timer start
    this._sendDate = undefined;      // Date header value
  }
  
  // Core methods
  writeHead(statusCode, statusMessage, headers) { /* ... */ }
  write(chunk, encoding, callback) { /* ... */ }
  end(data, encoding, callback) { /* ... */ }
  
  // Header methods
  setHeader(name, value) { /* ... */ }
  getHeader(name) { /* ... */ }
  getHeaderNames() { /* ... */ }
  getHeaders() { /* ... */ }
  hasHeader(name) { /* ... */ }
  removeHeader(name) { /* ... */ }
  
  // Advanced methods
  addTrailers(headers) { /* ... */ }
  flushHeaders() { /* ... */ }
  setTimeout(msecs, callback) { /* ... */ }
  writeContinue() { /* ... */ }
  assignSocket(socket) { /* ... */ }
  detachSocket(socket) { /* ... */ }
  
  // Event emitters
  emit(event, ...args) { /* ... */ }
  on(event, listener) { /* ... */ }
}
```

### **4.2 Response Methods - Complete Reference**

**Status Codes and Headers:**
```javascript
const server = http.createServer((req, res) => {
  console.log('=== RESPONSE CONSTRUCTION ===');
  
  // Method 1: writeHead() - Full control
  res.writeHead(200, 'OK', {
    'Content-Type': 'application/json',
    'X-Powered-By': 'Node.js',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    
    // CORS headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    
    // Security headers
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    
    // Custom headers
    'Server-Timing': 'db;dur=53, app;dur=47.2',
    'X-Response-Time': '100ms',
    
    // Cookie
    'Set-Cookie': [
      'sessionId=abc123; HttpOnly; Secure; SameSite=Strict',
      'theme=dark; Max-Age=86400'
    ]
  });
  
  // Method 2: Incremental header setting
  res.statusCode = 404;
  res.statusMessage = 'Not Found';
  
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('X-Custom-Header', 'value');
  
  // Multiple values for same header
  res.setHeader('Set-Cookie', ['first=value', 'second=value']);
  
  // Check headers
  console.log('Header "Content-Type":', res.getHeader('content-type'));
  console.log('All headers:', res.getHeaders());
  console.log('Header names:', res.getHeaderNames());
  console.log('Has "X-Custom-Header":', res.hasHeader('x-custom-header'));
  
  // Remove header
  res.removeHeader('X-Custom-Header');
  
  // Flush headers early (without body)
  res.flushHeaders(); // Sends headers immediately
  
  // Common status codes with explanations
  const statusCodes = {
    // 2xx Success
    200: 'OK - Request succeeded',
    201: 'Created - Resource created',
    202: 'Accepted - Request accepted for processing',
    204: 'No Content - Success but no body',
    
    // 3xx Redirection
    301: 'Moved Permanently',
    302: 'Found (Temporary Redirect)',
    304: 'Not Modified - Use cached version',
    
    // 4xx Client Errors
    400: 'Bad Request - Malformed request',
    401: 'Unauthorized - Authentication required',
    403: 'Forbidden - No permission',
    404: 'Not Found - Resource doesn\'t exist',
    405: 'Method Not Allowed',
    409: 'Conflict - Resource state conflict',
    429: 'Too Many Requests - Rate limiting',
    
    // 5xx Server Errors
    500: 'Internal Server Error',
    501: 'Not Implemented',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
    504: 'Gateway Timeout'
  };
  
  // Set appropriate status based on operation
  const operation = determineOperation(req);
  switch (operation.status) {
    case 'success':
      if (operation.created) {
        res.statusCode = 201; // Created
        res.setHeader('Location', `/resources/${operation.id}`);
      } else if (operation.noContent) {
        res.statusCode = 204; // No Content
      } else {
        res.statusCode = 200; // OK
      }
      break;
      
    case 'client-error':
      if (operation.notFound) {
        res.statusCode = 404;
      } else if (operation.badRequest) {
        res.statusCode = 400;
      } else if (operation.unauthorized) {
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Bearer realm="API"');
      }
      break;
      
    case 'server-error':
      res.statusCode = 500;
      break;
  }
  
  // Write body
  res.write('<h1>Hello World</h1>');
  res.write('<p>This is chunked response</p>');
  
  // End response
  res.end('</body></html>');
  
  // After end(), check state
  console.log('Response finished:', res.finished);
  console.log('Headers sent:', res.headersSent);
  console.log('Writable ended:', res.writableEnded);
});
```

**Response Body Writing Methods:**
```javascript
const server = http.createServer((req, res) => {
  // Method 1: Single end() call
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World\n');
  
  // Method 2: Multiple write() calls + end()
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.write('<html>');
  res.write('<head><title>Page</title></head>');
  res.write('<body>');
  res.write('<h1>Streaming Response</h1>');
  for (let i = 0; i < 10; i++) {
    res.write(`<p>Chunk ${i}</p>`);
  }
  res.write('</body></html>');
  res.end(); // No argument needed if all data written
  
  // Method 3: Using pipe() for streaming
  const fs = require('fs');
  const fileStream = fs.createReadStream('large-file.txt');
  
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Disposition': 'attachment; filename="download.txt"'
  });
  
  fileStream.pipe(res);
  
  // Handle pipe events
  fileStream.on('end', () => {
    console.log('File stream ended');
  });
  
  fileStream.on('error', (err) => {
    console.error('File stream error:', err);
    if (!res.headersSent) {
      res.writeHead(500);
    }
    res.end('Error reading file');
  });
  
  // Method 4: JSON response (common API pattern)
  const data = { message: 'Success', data: { id: 123, name: 'John' } };
  
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8'
  });
  
  res.end(JSON.stringify(data, null, 2)); // Pretty print with 2-space indent
  
  // Method 5: Binary data
  const buffer = Buffer.from([0x48, 0x65, 0x6c, 0x6c, 0x6f]); // "Hello"
  
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': buffer.length
  });
  
  res.end(buffer);
  
  // Method 6: Chunked encoding (automatic when Content-Length not set)
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked' // Node.js sets this automatically
  });
  
  // Write chunks with delay
  let count = 0;
  const interval = setInterval(() => {
    res.write(`Chunk ${count}\n`);
    count++;
    
    if (count >= 5) {
      clearInterval(interval);
      res.end(); // Final chunk (0-length)
    }
  }, 1000);
  
  // Method 7: Trailers (headers sent after body in chunked encoding)
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Trailer': 'X-MD5-Hash, X-Final-Count'
  });
  
  res.write('Some data...\n');
  res.write('More data...\n');
  
  // Add trailers before ending
  res.addTrailers({
    'X-MD5-Hash': 'd41d8cd98f00b204e9800998ecf8427e',
    'X-Final-Count': '42'
  });
  
  res.end();
});
```

### **4.3 Advanced Response Features**

**Response Compression:**
```javascript
const http = require('http');
const zlib = require('zlib');

const server = http.createServer((req, res) => {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  
  const responseBody = JSON.stringify({
    message: 'This is a large response that benefits from compression',
    data: Array(1000).fill({ id: 1, name: 'Item' })
  });
  
  // Check what compression client supports
  if (acceptEncoding.includes('br')) {
    // Brotli compression (most efficient)
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Encoding': 'br'
    });
    
    zlib.brotliCompress(responseBody, (err, compressed) => {
      if (err) {
        res.writeHead(500);
        res.end('Compression error');
        return;
      }
      res.end(compressed);
    });
    
  } else if (acceptEncoding.includes('gzip')) {
    // Gzip compression
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Encoding': 'gzip'
    });
    
    zlib.gzip(responseBody, (err, compressed) => {
      if (err) {
        res.writeHead(500);
        res.end('Compression error');
        return;
      }
      res.end(compressed);
    });
    
  } else if (acceptEncoding.includes('deflate')) {
    // Deflate compression
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Encoding': 'deflate'
    });
    
    zlib.deflate(responseBody, (err, compressed) => {
      if (err) {
        res.writeHead(500);
        res.end('Compression error');
        return;
      }
      res.end(compressed);
    });
    
  } else {
    // No compression
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(responseBody)
    });
    res.end(responseBody);
  }
});
```

**Response Streaming with Backpressure:**
```javascript
const server = http.createServer((req, res) => {
  // Create a custom readable stream
  const { Readable } = require('stream');
  
  class DataStream extends Readable {
    constructor(options) {
      super(options);
      this.count = 0;
      this.maxCount = 100;
    }
    
    _read(size) {
      const chunk = `Data chunk ${this.count}\n`;
      
      setTimeout(() => {
        if (this.count >= this.maxCount) {
          this.push(null); // End stream
        } else {
          this.count++;
          // Check if we should push based on backpressure
          if (this.push(chunk)) {
            console.log('Pushed chunk', this.count);
          } else {
            console.log('Backpressure - waiting');
            // Stream will call _read again when ready
          }
        }
      }, 100);
    }
  }
  
  const dataStream = new DataStream();
  
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Transfer-Encoding': 'chunked'
  });
  
  // Pipe with backpressure handling
  dataStream.pipe(res);
  
  // Monitor backpressure
  dataStream.on('data', (chunk) => {
    console.log('Generated:', chunk.toString().trim());
  });
  
  res.on('drain', () => {
    console.log('Response buffer drained, ready for more data');
  });
  
  res.on('finish', () => {
    console.log('Response finished');
  });
  
  res.on('error', (err) => {
    console.error('Response error:', err);
  });
});
```

**Complete HTTP Server with All Features:**
```javascript
const http = require('http');
const url = require('url');
const querystring = require('querystring');

class HTTPServer {
  constructor() {
    this.server = http.createServer(this.handleRequest.bind(this));
    this.routes = new Map();
    this.middleware = [];
    
    // Default error handler
    this.errorHandler = (err, req, res) => {
      console.error('Server error:', err);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
      }
      res.end(JSON.stringify({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      }));
    };
  }
  
  // Middleware support
  use(middleware) {
    this.middleware.push(middleware);
  }
  
  // Route registration
  get(path, handler) {
    this.routes.set(`GET ${path}`, handler);
  }
  
  post(path, handler) {
    this.routes.set(`POST ${path}`, handler);
  }
  
  put(path, handler) {
    this.routes.set(`PUT ${path}`, handler);
  }
  
  delete(path, handler) {
    this.routes.set(`DELETE ${path}`, handler);
  }
  
  // Request handling
  async handleRequest(req, res) {
    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    req.parsedUrl = parsedUrl;
    
    // Add response helper methods
    res.json = (data, status = 200) => {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8'
      });
      res.end(JSON.stringify(data));
    };
    
    res.html = (html, status = 200) => {
      res.writeHead(status, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      res.end(html);
    };
    
    res.redirect = (location, status = 302) => {
      res.writeHead(status, {
        'Location': location
      });
      res.end();
    };
    
    res.sendFile = (filePath) => {
      const fs = require('fs');
      const path = require('path');
      
      const ext = path.extname(filePath);
      const contentType = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml'
      }[ext] || 'application/octet-stream';
      
      fs.readFile(filePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.writeHead(404);
            res.end('File not found');
          } else {
            res.writeHead(500);
            res.end('Server error');
          }
        } else {
          res.writeHead(200, {
            'Content-Type': contentType,
            'Content-Length': data.length
          });
          res.end(data);
        }
      });
    };
    
    try {
      // Run middleware
      for (const middleware of this.middleware) {
        await new Promise((resolve, reject) => {
          middleware(req, res, (err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      }
      
      // Parse request body if needed
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        await this.parseBody(req);
      }
      
      // Find and execute route handler
      const routeKey = `${req.method} ${parsedUrl.pathname}`;
      const handler = this.routes.get(routeKey);
      
      if (handler) {
        await handler(req, res);
      } else {
        // No route found
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
      
    } catch (err) {
      this.errorHandler(err, req, res);
    }
  }
  
  // Parse request body
  parseBody(req) {
    return new Promise((resolve, reject) => {
      if (!req.headers['content-type']) {
        req.body = {};
        return resolve();
      }
      
      let body = '';
      
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          if (req.headers['content-type'].includes('application/json')) {
            req.body = JSON.parse(body);
          } else if (req.headers['content-type'].includes('application/x-www-form-urlencoded')) {
            req.body = querystring.parse(body);
          } else {
            req.body = body;
          }
          resolve();
        } catch (err) {
          reject(new Error('Invalid request body'));
        }
      });
      
      req.on('error', reject);
    });
  }
  
  // Start server
  listen(port, hostname, callback) {
    this.server.listen(port, hostname, callback);
    
    // Graceful shutdown
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());
  }
  
  // Graceful shutdown
  shutdown() {
    console.log('Shutting down server...');
    
    this.server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  }
}

// Usage example
const app = new HTTPServer();

// Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

app.use((req, res, next) => {
  // CORS middleware
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Routes
app.get('/', (req, res) => {
  res.html('<h1>Welcome to the API</h1>');
});

app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const id = req.parsedUrl.query.id;
  res.json({ id, name: 'John' });
});

app.post('/api/users', (req, res) => {
  console.log('Creating user:', req.body);
  res.json({ id: 3, ...req.body }, 201);
});

// Start server
app.listen(3000, 'localhost', () => {
  console.log('Server running at http://localhost:3000/');
});
```