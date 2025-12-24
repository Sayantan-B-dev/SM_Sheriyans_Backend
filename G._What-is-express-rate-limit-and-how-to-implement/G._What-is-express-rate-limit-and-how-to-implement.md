# Rate Limiting with `express-rate-limit`: Complete Guide

Rate limiting is a **critical security and performance mechanism** that controls how many requests a client can make to your API within a specific time window. Think of it as a **bouncer at a club** - it prevents anyone (legitimate or malicious) from overwhelming your server.

## 🚨 Why You Absolutely Need Rate Limiting

### **Security Protection:**
- **Brute Force Attacks**: Without rate limits, attackers can try millions of password combinations
- **DoS/DDoS Mitigation**: Prevents a single IP from overwhelming your server
- **Credential Stuffing**: Stops automated login attempts with stolen credentials

### **Performance & Stability:**
- **Prevents Resource Exhaustion**: Stops one user from consuming all CPU/RAM
- **Fair Usage**: Ensures all users get equal access to your API
- **Cost Control**: Reduces cloud/server costs by limiting excessive requests

### **Business Reasons:**
- **API Monetization**: Charge different rates for different usage tiers
- **Prevent Scraping**: Stop bots from harvesting your data
- **Compliance**: Some regulations require rate limiting for security

## 📊 Where to Apply Rate Limiting

| **Endpoint Type** | **Rate Limit** | **Why** |
|------------------|---------------|---------|
| **Authentication** (`/login`, `/register`) | 5-10 requests/minute | Prevent credential brute forcing |
| **Password Reset** | 2-3 requests/hour | Prevent email bombing |
| **Public API** | 100 requests/hour per IP | Fair usage and cost control |
| **Payment Processing** | 10 requests/minute | Prevent fraudulent transaction testing |
| **Search Endpoints** | 30 requests/minute | Prevent database exhaustion |
| **File Uploads** | 5 requests/minute | Prevent storage abuse |

## 🛠️ Basic to Professional Implementation

### **Level 1: Absolute Beginner Setup**
```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();

// Basic global limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply to all requests
app.use(globalLimiter);

app.listen(3000, () => console.log('Server running'));
```

### **Level 2: Endpoint-Specific Limiters**
```javascript
// Different limiters for different routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per 15 minutes
    message: {
        status: 429,
        error: 'Too many login attempts. Please try again later.'
    },
    skipSuccessfulRequests: true, // Don't count successful logins
});

const apiLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour
    message: 'Hourly API limit exceeded'
});

const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Only 3 password reset requests per hour
    message: 'Too many password reset attempts'
});

// Apply to specific routes
app.post('/api/auth/login', authLimiter, authController.login);
app.post('/api/auth/register', authLimiter, authController.register);
app.post('/api/auth/reset-password', passwordResetLimiter, authController.resetPassword);
app.use('/api/v1', apiLimiter, apiRouter);
```

## ⚡ Production-Ready Advanced Implementation

### **Level 3: Production Configuration with Redis**
```javascript
const express = require('express');
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const helmet = require('helmet');
const compression = require('compression');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Redis client for distributed rate limiting
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    }
});

// Custom key generator (IP + user agent for better fingerprinting)
const customKeyGenerator = (req) => {
    return `${req.ip}:${req.headers['user-agent']}:${req.path}`;
};

// Trust proxy for accurate IP (when behind nginx/load balancer)
app.set('trust proxy', 1); // For 1 proxy hop

// Dynamic rate limiter based on user tier
const createUserTierLimiter = (userTier) => {
    const limits = {
        free: 100,      // Free tier: 100 requests/hour
        basic: 1000,    // Basic tier: 1000 requests/hour  
        premium: 10000, // Premium: 10,000 requests/hour
        admin: 100000   // Admin: 100,000 requests/hour
    };
    
    return rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redisClient.call(...args),
            prefix: 'rl:', // Redis key prefix
        }),
        windowMs: 60 * 60 * 1000, // 1 hour
        max: (req) => {
            // Get user from request (after authentication middleware)
            const user = req.user || { tier: 'free' };
            return limits[user.tier] || limits.free;
        },
        keyGenerator: (req) => {
            // Use user ID for authenticated users, IP for anonymous
            return req.user ? `user:${req.user.id}` : `ip:${req.ip}`;
        },
        skip: (req) => {
            // Skip rate limiting for certain IPs (webhooks, internal services)
            const whitelist = process.env.RATE_LIMIT_WHITELIST?.split(',') || [];
            return whitelist.includes(req.ip);
        },
        handler: (req, res) => {
            const resetTime = new Date(Date.now() + 60 * 60 * 1000);
            res.status(429).json({
                error: 'Rate limit exceeded',
                message: `You have exceeded your hourly request limit.`,
                retryAt: resetTime.toISOString(),
                limit: req.rateLimit.limit,
                remaining: 0,
                reset: req.rateLimit.resetTime,
                tier: req.user?.tier || 'free'
            });
        },
        standardHeaders: true,
        legacyHeaders: false,
        // Skip failed requests (don't penalize for 4xx/5xx errors)
        skipFailedRequests: true,
        // Don't count HEAD and OPTIONS requests
        skip: (req) => req.method === 'HEAD' || req.method === 'OPTIONS'
    });
};

// Apply rate limiter with user context
app.use('/api', (req, res, next) => {
    // This would run after authentication middleware
    createUserTierLimiter()(req, res, next);
});
```

### **Level 4: Advanced Scenarios**

#### **4.1 Burst vs Sustained Rate Limiting**
```javascript
// Allow short bursts but limit sustained traffic
const burstLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 50, // 50 requests in 10 seconds (burst)
    message: 'Too many requests too quickly'
});

const sustainedLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // 1000 requests per hour (sustained)
    message: 'Hourly limit exceeded'
});

// Apply both: burst check first, then sustained
app.use('/api/chat', burstLimiter, sustainedLimiter, chatController);
```

#### **4.2 Geolocation-Based Rate Limiting**
```javascript
const geoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
        // Use a geolocation service or IP database
        const country = req.geo?.country || 'unknown';
        
        const limits = {
            'US': 200,
            'GB': 200,
            'DE': 200,
            'IN': 50,  // Lower limit for high-abuse regions
            'CN': 50,
            'unknown': 100
        };
        
        return limits[country] || 100;
    },
    keyGenerator: (req) => `${req.ip}:${req.geo?.country || 'unknown'}`,
    message: 'Rate limit exceeded for your region'
});
```

#### **4.3 Request Complexity-Based Limiting**
```javascript
const complexityLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: (req) => {
        // More complex requests = lower limit
        const complexityScore = calculateRequestComplexity(req);
        
        if (complexityScore > 10) return 5;    // 5 complex requests/min
        if (complexityScore > 5) return 20;    // 20 medium requests/min
        return 100;                            // 100 simple requests/min
    },
    skip: (req) => {
        // Don't limit health checks or static assets
        return req.path === '/health' || req.path.startsWith('/static/');
    }
});

function calculateRequestComplexity(req) {
    let score = 1;
    
    // Database queries increase complexity
    if (req.query.includes) score += 2;
    if (req.query.deep) score += 5;
    
    // File uploads are expensive
    if (req.file || req.files) score += 10;
    
    // Search with multiple terms
    if (req.query.search && req.query.search.split(' ').length > 3) score += 3;
    
    return score;
}
```

## 🔧 Monitoring & Analytics Integration

```javascript
// Rate limiting with analytics and monitoring
const monitoredLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res, next, options) => {
        // Log to analytics
        analytics.track('rate_limit_exceeded', {
            ip: req.ip,
            userAgent: req.headers['user-agent'],
            path: req.path,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        
        // Alert if it's a potential attack
        if (req.rateLimit.current > 1000) {
            securityAlert('potential_ddos', {
                ip: req.ip,
                requests: req.rateLimit.current,
                timeframe: '15min'
            });
        }
        
        // Send response
        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(options.windowMs / 1000),
            limit: options.max,
            reset: new Date(Date.now() + options.windowMs).toISOString()
        });
    },
    onLimitReached: (req, res, options) => {
        // First time hitting the limit
        console.warn(`Rate limit first reached for IP: ${req.ip}`);
    }
});
```

## 🚀 Complete Production Setup Example

```javascript
// File: middleware/rateLimiters.js
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

class RateLimitManager {
    constructor() {
        this.redis = new Redis({
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            enableOfflineQueue: false
        });
        
        this.limiters = {};
    }
    
    // Create different limiter configurations
    getLimiter(name, config = {}) {
        if (!this.limiters[name]) {
            const defaults = {
                // Store in Redis for distributed systems
                store: new RedisStore({
                    sendCommand: (...args) => this.redis.call(...args),
                    prefix: `ratelimit:${name}:`
                }),
                standardHeaders: true,
                legacyHeaders: false,
                skipFailedRequests: true,
                skip: (req) => {
                    // Skip for certain user agents (search engines, health checks)
                    const skipAgents = ['Googlebot', 'Bingbot', 'health-check'];
                    return skipAgents.some(agent => 
                        req.headers['user-agent']?.includes(agent)
                    );
                }
            };
            
            this.limiters[name] = rateLimit({
                ...defaults,
                ...config
            });
        }
        
        return this.limiters[name];
    }
    
    // Pre-configured limiters
    get authLimiter() {
        return this.getLimiter('auth', {
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 10, // 10 attempts per 15 minutes
            message: {
                error: 'Too many authentication attempts',
                retryAfter: '15 minutes'
            },
            skipSuccessfulRequests: true
        });
    }
    
    get apiLimiter() {
        return this.getLimiter('api', {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: (req) => {
                // Dynamic limits based on API key tier
                const apiKey = req.headers['x-api-key'];
                const tier = this.getApiKeyTier(apiKey);
                
                const limits = {
                    free: 100,
                    pro: 1000,
                    enterprise: 10000
                };
                
                return limits[tier] || limits.free;
            },
            keyGenerator: (req) => {
                // Use API key if present, otherwise IP
                return req.headers['x-api-key'] || req.ip;
            }
        });
    }
    
    get uploadLimiter() {
        return this.getLimiter('upload', {
            windowMs: 60 * 60 * 1000, // 1 hour
            max: 20, // 20 uploads per hour
            message: 'Too many uploads. Please try again later.'
        });
    }
    
    // Reset limits for a specific key (admin function)
    async resetLimit(key, limiterName) {
        const redisKey = `ratelimit:${limiterName}:${key}`;
        await this.redis.del(redisKey);
    }
}

// File: server.js
const express = require('express');
const RateLimitManager = require('./middleware/rateLimiters');
const { createRequestLogger } = require('./middleware/logger');

const app = express();
const rateLimitManager = new RateLimitManager();

// Request logging (for monitoring rate limits)
app.use(createRequestLogger());

// Global rate limit for all routes (safety net)
app.use(rateLimitManager.getLimiter('global', {
    windowMs: 15 * 60 * 1000,
    max: 300 // 300 requests per 15 minutes per IP
}));

// Specific route limiters
app.post('/api/auth/login', 
    rateLimitManager.authLimiter, 
    authController.login
);

app.post('/api/auth/register',
    rateLimitManager.authLimiter,
    authController.register
);

app.post('/api/upload',
    rateLimitManager.uploadLimiter,
    uploadController.handleUpload
);

// API routes with tier-based limiting
app.use('/api/v1', 
    rateLimitManager.apiLimiter,
    apiRouter
);

// Admin endpoint to reset limits (protected)
app.post('/admin/reset-rate-limit',
    adminAuthMiddleware,
    async (req, res) => {
        const { key, limiter } = req.body;
        await rateLimitManager.resetLimit(key, limiter);
        res.json({ success: true });
    }
);

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handler for rate limit errors
app.use((err, req, res, next) => {
    if (err.status === 429) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Please slow down your requests',
            retryAfter: err.retryAfter,
            documentation: 'https://api.example.com/docs/rate-limiting'
        });
    }
    next(err);
});
```

## 📈 Monitoring Your Rate Limits

```javascript
// File: monitoring/rateLimitMonitor.js
const Redis = require('ioredis');

class RateLimitMonitor {
    constructor() {
        this.redis = new Redis(process.env.REDIS_URL);
    }
    
    async getRateLimitStats() {
        const keys = await this.redis.keys('ratelimit:*');
        const stats = {};
        
        for (const key of keys) {
            const ttl = await this.redis.ttl(key);
            const value = await this.redis.get(key);
            
            const [, limiter, ...identifierParts] = key.split(':');
            const identifier = identifierParts.join(':');
            
            if (!stats[limiter]) {
                stats[limiter] = { total: 0, active: 0, details: [] };
            }
            
            stats[limiter].total++;
            stats[limiter].active += ttl > 0 ? 1 : 0;
            stats[limiter].details.push({
                identifier,
                ttl,
                requests: parseInt(value) || 0,
                key
            });
        }
        
        return stats;
    }
    
    async getTopOffenders(limit = 10) {
        const stats = await this.getRateLimitStats();
        const offenders = [];
        
        for (const [limiter, data] of Object.entries(stats)) {
            for (const detail of data.details) {
                if (detail.ttl > 0) { // Currently rate limited
                    offenders.push({
                        limiter,
                        identifier: detail.identifier,
                        requests: detail.requests,
                        timeRemaining: detail.ttl
                    });
                }
            }
        }
        
        return offenders
            .sort((a, b) => b.requests - a.requests)
            .slice(0, limit);
    }
}
```

## 🎯 Best Practices Summary

1. **Start Strict, Loosen Later**: Begin with conservative limits (10-50 requests/min)
2. **Use Redis in Production**: Essential for distributed systems and accurate limits
3. **Different Limits for Different Endpoints**: Authentication needs stricter limits than public data
4. **Provide Clear Error Messages**: Tell users when they'll be able to retry
5. **Monitor and Adjust**: Watch your logs and adjust limits based on actual usage
6. **Consider User Experience**: Don't rate limit too aggressively for logged-in users
7. **Whitelist Critical Services**: Don't rate limit webhooks or internal services
8. **Use Standard Headers**: Helps API consumers handle limits programmatically

## ⚠️ Common Mistakes to Avoid

- **No Rate Limiting on Auth Endpoints** → Opens you to brute force attacks
- **Using Memory Store in Production** → Limits won't work across multiple servers
- **Too Aggressive Limits** → Frustrates legitimate users
- **No Monitoring** → You won't know when you're under attack
- **Forgetting Trust Proxy** → All requests appear from your load balancer's IP

## 📊 Real-World Examples by Industry

| **Industry** | **Typical Limits** | **Special Considerations** |
|--------------|-------------------|----------------------------|
| **E-commerce** | 100 req/min for browsing, 10/min for checkout | Stricter limits on payment endpoints |
| **Social Media** | 500 req/hour for users, 5000/hour for apps | Per-user limits to prevent scraping |
| **Fintech/Banking** | 30 req/min, 2FA attempts: 5/hour | Extremely strict on transaction endpoints |
| **Healthcare** | 100 req/hour, sensitive data: 10/hour | HIPAA compliance considerations |
| **SaaS Platform** | Free: 100/hour, Paid: 1000/hour, Enterprise: 10000/hour | Tier-based monetization |

## 🔄 When to Increase/Decrease Limits

**Increase Limits When:**
- Legitimate users consistently hit limits
- You've optimized database queries
- Moving to more powerful infrastructure
- Implementing better caching

**Decrease Limits When:**
- Seeing DDoS or brute force attempts
- Server resources are consistently high
- Implementing new, expensive features
- During sales/promotional events

Rate limiting is not "set it and forget it" - it requires **ongoing monitoring and adjustment**. Start with the basics, implement monitoring, and refine as you learn your traffic patterns.