# Complete Authentication System with Detailed Explanations

## **Core Concepts Explained:**

### **1. Validation - Check Data Format**
```javascript
// Validation = Checking if data follows expected format/rules
const validateRegistration = (data) => {
    // Check if email follows email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Check if password meets complexity requirements
    const hasUpperCase = /[A-Z]/.test(data.password);
    const hasLowerCase = /[a-z]/.test(data.password);
    const hasNumbers = /\d/.test(data.password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(data.password);
    
    // Validate structure before processing
    return emailRegex.test(data.email) && 
           data.password.length >= 8 &&
           hasUpperCase && hasLowerCase && hasNumbers;
    // PURPOSE: Prevent malformed data from reaching database
    // EXAMPLE: "user@domain" ❌ (no .com)
    // EXAMPLE: "password123" ❌ (no uppercase/special char)
}
```

### **2. Verification - Check Data Truthiness**
```javascript
// Verification = Confirming data is genuine/accurate
const verifyUserCredentials = async (email, password) => {
    // 1. Check if user exists in database
    const user = await User.findOne({ email });
    
    if (!user) {
        // Verification failed - user doesn't exist
        return { verified: false, reason: "User not found" };
    }
    
    // 2. Compare provided password with stored hash
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    
    // 3. Check if account is active/not locked
    if (user.accountLocked) {
        return { verified: false, reason: "Account locked" };
    }
    
    // 4. Check if email is verified
    if (!user.emailVerified) {
        return { verified: false, reason: "Email not verified" };
    }
    
    // PURPOSE: Confirm the provided information is true/accurate
    // EXAMPLE: Right email but wrong password ❌
    // EXAMPLE: Right credentials but account locked ❌
}
```

### **3. Authentication - Confirm Who the User Is**
```javascript
// Authentication = Confirming identity ("WHO are you?")
const authenticateUser = async (req, res, next) => {
    try {
        // STEP 1: Get token from request (multiple sources)
        const token = req.cookies?.access_token || 
                     req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Authentication required',
                message: 'No token provided. Please login first.'
            });
        }
        
        // STEP 2: Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'], // Specify allowed algorithms
            issuer: 'myapp.com',   // Must match token issuer
            audience: 'web-client' // Must match token audience
        });
        
        // STEP 3: Check if token was issued before password change
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                error: 'Invalid user',
                message: 'User account no longer exists'
            });
        }
        
        if (decoded.iat < user.passwordChangedAt.getTime() / 1000) {
            // Token was issued before password change - invalid
            return res.status(401).json({
                error: 'Token expired',
                message: 'Password was changed. Please login again.'
            });
        }
        
        // STEP 4: Attach authenticated user to request
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role
        };
        
        next(); // User is authenticated, proceed to next middleware
        
    } catch (error) {
        // Handle different JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                message: 'Your session has expired. Please login again.'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Malformed or tampered token detected'
            });
        }
        
        return res.status(401).json({
            error: 'Authentication failed',
            message: 'Unable to verify your identity'
        });
    }
};
// PURPOSE: Prove "I am really John Doe"
// EXAMPLE: Valid token = ✅, Expired token = ❌
// EXAMPLE: Tampered token = ❌, Missing token = ❌
```

### **4. Authorization - Check User Permissions**
```javascript
// Authorization = Checking permissions ("WHAT can you do?")
const authorize = (requiredPermissions) => {
    return (req, res, next) => {
        // STEP 1: Get user from request (set by authentication middleware)
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'User not authenticated'
            });
        }
        
        // STEP 2: Check user role
        const userRole = user.role; // 'admin', 'user', 'moderator'
        
        // Define role-based permissions
        const rolePermissions = {
            'user': ['read:own_profile', 'update:own_profile'],
            'moderator': ['read:any_profile', 'delete:comments'],
            'admin': ['read:any_profile', 'update:any_profile', 'delete:users']
        };
        
        // STEP 3: Check if user has required permissions
        const userHasPermission = requiredPermissions.every(permission => 
            rolePermissions[userRole]?.includes(permission)
        );
        
        if (!userHasPermission) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to perform this action',
                required: requiredPermissions,
                yourRole: userRole,
                yourPermissions: rolePermissions[userRole]
            });
        }
        
        // STEP 4: Check resource ownership (if applicable)
        if (requiredPermissions.includes('update:own_profile') || 
            requiredPermissions.includes('delete:own_resource')) {
            
            // Check if user owns the resource they're trying to access
            const resourceId = req.params.id;
            if (resourceId !== user.id && userRole !== 'admin') {
                return res.status(403).json({
                    error: 'Access denied',
                    message: 'You can only modify your own resources'
                });
            }
        }
        
        next(); // User is authorized
    };
};

// Usage example:
router.delete('/users/:id', 
    authenticateUser,                 // First: Check WHO they are
    authorize(['delete:users']),      // Then: Check IF they can delete users
    async (req, res) => {
        // User is both authenticated AND authorized
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    }
);
// PURPOSE: Control access to resources/actions
// EXAMPLE: User tries to delete admin account ❌
// EXAMPLE: Admin tries to delete any user ✅
// EXAMPLE: User tries to view own profile ✅
```

## **Complete Secure Authentication System**

### **server.js - Main Application File**
```javascript
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ======================
// SECURITY MIDDLEWARE
// ======================

// 1. HELMET - Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true
    }
}));

// 2. CORS - Cross-Origin Resource Sharing
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie']
}));

// 3. RATE LIMITING - Prevent brute force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: 'Too many login attempts, please try again later',
    skipSuccessfulRequests: true // Don't count successful logins
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

// 4. BODY PARSERS
app.use(express.json({ limit: '10kb' })); // Prevent large payloads
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// 5. Apply rate limiting
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/', apiLimiter);

// ======================
// DATABASE CONNECTION
// ======================
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ======================
// ROUTES
// ======================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
    console.error('🔥 Error:', err);
    
    // Don't expose internal errors in production
    const message = process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : err.message;
    
    res.status(err.status || 500).json({
        error: true,
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});
```

### **models/User.js - User Model with Security**
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    // IDENTITY FIELDS
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                // EMAIL VALIDATION
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    
    // PASSWORD SECURITY
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Never return password in queries
    },
    
    passwordChangedAt: {
        type: Date,
        default: Date.now
    },
    
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // ACCOUNT SECURITY
    loginAttempts: {
        type: Number,
        default: 0,
        select: false
    },
    
    lockUntil: {
        type: Date,
        select: false
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    
    emailVerified: {
        type: Boolean,
        default: false
    },
    
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    
    // USER PROFILE
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    
    role: {
        type: String,
        enum: ['user', 'admin', 'moderator'],
        default: 'user'
    },
    
    lastLogin: {
        type: Date
    },
    
    // SECURITY AUDIT
    createdAt: {
        type: Date,
        default: Date.now
    },
    
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ======================
// MIDDLEWARE
// ======================

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash password if it was modified
    if (!this.isModified('password')) return next();
    
    try {
        // Generate salt (complexity factor 12)
        const salt = await bcrypt.genSalt(12);
        
        // Hash password with salt
        this.password = await bcrypt.hash(this.password, salt);
        
        // Update passwordChangedAt
        this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second for token timing
        
        next();
    } catch (error) {
        next(error);
    }
});

// Update timestamp before save
userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// ======================
// INSTANCE METHODS
// ======================

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Check if password was changed after token was issued
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedTimestamp;
    }
    return false; // Password not changed
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function() {
    // Generate random token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token for storage (security)
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    // Set expiry (10 minutes)
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    return resetToken; // Return unhashed token for email
};

// Generate email verification token
userSchema.methods.createEmailVerificationToken = function() {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    this.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    return verificationToken;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
    // If previous lock expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }
    
    // Otherwise increment
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 15 minutes
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
    }
    
    return this.updateOne(updates);
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
    return this.updateOne({
        $set: { lastLogin: Date.now() },
        $unset: { 
            loginAttempts: 1,
            lockUntil: 1 
        }
    });
};

module.exports = mongoose.model('User', userSchema);
```

### **routes/auth.js - Complete Auth Routes**
```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const router = express.Router();

// ======================
// TOKEN GENERATION UTILITY
// ======================
const generateTokens = (userId) => {
    // ACCESS TOKEN (Short-lived - 15 minutes)
    const accessToken = jwt.sign(
        {
            userId: userId,
            type: 'access'
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: '15m',
            issuer: 'myapp.com',
            audience: 'web-client',
            algorithm: 'HS256'
        }
    );
    
    // REFRESH TOKEN (Long-lived - 7 days)
    const refreshToken = jwt.sign(
        {
            userId: userId,
            type: 'refresh',
            tokenId: crypto.randomBytes(16).toString('hex') // Unique ID for token revocation
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: '7d',
            issuer: 'myapp.com',
            audience: 'web-client',
            algorithm: 'HS256'
        }
    );
    
    return { accessToken, refreshToken };
};

// ======================
// REGISTRATION
// ======================
router.post('/register', async (req, res) => {
    try {
        // STEP 1: INPUT VALIDATION
        const { email, password, name } = req.body;
        
        // Check required fields
        if (!email || !password || !name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['email', 'password', 'name']
            });
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }
        
        // Password strength validation
        if (password.length < 8) {
            return res.status(400).json({
                error: 'Weak password',
                message: 'Password must be at least 8 characters long'
            });
        }
        
        // STEP 2: VERIFICATION - Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        
        if (existingUser) {
            // Security: Don't reveal if user exists to prevent enumeration attacks
            return res.status(400).json({
                error: 'Registration failed',
                message: 'Unable to create account. Please try different credentials.'
            });
        }
        
        // STEP 3: Create user
        const user = await User.create({
            email: email.toLowerCase(),
            password, // Will be hashed by pre-save middleware
            name
        });
        
        // STEP 4: Generate verification token
        const verificationToken = user.createEmailVerificationToken();
        await user.save();
        
        // STEP 5: Generate tokens
        const tokens = generateTokens(user._id);
        
        // STEP 6: Set cookies (HttpOnly, Secure, SameSite)
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true, // Prevent XSS attacks (JavaScript can't access)
            secure: process.env.NODE_ENV === 'production', // HTTPS only
            sameSite: 'strict', // Prevent CSRF attacks
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/'
        });
        
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth/refresh' // Only sent to refresh endpoint
        });
        
        // STEP 7: Send verification email (in production)
        // await sendVerificationEmail(user.email, verificationToken);
        
        // STEP 8: Response (exclude sensitive data)
        res.status(201).json({
            success: true,
            message: 'Registration successful. Please check your email for verification.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An unexpected error occurred'
        });
    }
});

// ======================
// LOGIN
// ======================
router.post('/login', async (req, res) => {
    try {
        // STEP 1: VALIDATION
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }
        
        // STEP 2: Find user with password (select: false needs explicit selection)
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +loginAttempts +lockUntil');
        
        // STEP 3: VERIFICATION
        if (!user) {
            // Security: Generic error to prevent user enumeration
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid credentials'
            });
        }
        
        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                error: 'Account locked',
                message: 'Too many failed attempts. Try again later.'
            });
        }
        
        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({
                error: 'Account disabled',
                message: 'Your account has been disabled'
            });
        }
        
        // STEP 4: Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            // Increment failed login attempts
            await user.incLoginAttempts();
            
            return res.status(401).json({
                error: 'Authentication failed',
                message: 'Invalid credentials'
            });
        }
        
        // STEP 5: Reset login attempts on success
        await user.resetLoginAttempts();
        
        // Update last login
        user.lastLogin = Date.now();
        await user.save();
        
        // STEP 6: Generate tokens
        const tokens = generateTokens(user._id);
        
        // STEP 7: Set secure cookies
        res.cookie('access_token', tokens.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/'
        });
        
        res.cookie('refresh_token', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/api/auth/refresh'
        });
        
        // STEP 8: Response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An unexpected error occurred'
        });
    }
});

// ======================
// TOKEN REFRESH
// ======================
router.post('/refresh', async (req, res) => {
    try {
        // STEP 1: Get refresh token from cookies
        const refreshToken = req.cookies?.refresh_token;
        
        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
                message: 'No refresh token provided'
            });
        }
        
        // STEP 2: Verify refresh token
        const decoded = jwt.verify(
            refreshToken, 
            process.env.JWT_REFRESH_SECRET,
            {
                issuer: 'myapp.com',
                audience: 'web-client',
                algorithms: ['HS256']
            }
        );
        
        // STEP 3: Check token type
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: 'Invalid token type',
                message: 'Not a refresh token'
            });
        }
        
        // STEP 4: Check if user exists and is active
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                error: 'User not found',
                message: 'User account is disabled or deleted'
            });
        }
        
        // STEP 5: Generate new access token
        const newAccessToken = jwt.sign(
            {
                userId: user._id,
                type: 'access'
            },
            process.env.JWT_ACCESS_SECRET,
            {
                expiresIn: '15m',
                issuer: 'myapp.com',
                audience: 'web-client',
                algorithm: 'HS256'
            }
        );
        
        // STEP 6: Set new access token cookie
        res.cookie('access_token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
            path: '/'
        });
        
        // STEP 7: Response
        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully'
        });
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            // Clear expired tokens
            res.clearCookie('access_token');
            res.clearCookie('refresh_token');
            
            return res.status(401).json({
                error: 'Session expired',
                message: 'Please login again'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                message: 'Malformed refresh token'
            });
        }
        
        res.status(500).json({
            error: 'Token refresh failed',
            message: 'An unexpected error occurred'
        });
    }
});

// ======================
// LOGOUT
// ======================
router.post('/logout', (req, res) => {
    // Clear all auth cookies
    res.clearCookie('access_token', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.clearCookie('refresh_token', {
        path: '/api/auth/refresh',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
});

// ======================
// FORGOT PASSWORD
// ======================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                error: 'Email required',
                message: 'Please provide your email address'
            });
        }
        
        // Find user (don't reveal if user exists)
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (user) {
            // Generate reset token (valid for 10 minutes)
            const resetToken = user.createPasswordResetToken();
            await user.save();
            
            // In production: Send email with reset link
            // const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
            // await sendPasswordResetEmail(user.email, resetURL);
        }
        
        // Always return same response for security
        res.status(200).json({
            success: true,
            message: 'If an account exists, a password reset link has been sent'
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            error: 'Request failed',
            message: 'An unexpected error occurred'
        });
    }
});

// ======================
// RESET PASSWORD
// ======================
router.patch('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!password || password.length < 8) {
            return res.status(400).json({
                error: 'Weak password',
                message: 'Password must be at least 8 characters'
            });
        }
        
        // Hash token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid reset token
        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired token',
                message: 'Password reset token is invalid or has expired'
            });
        }
        
        // Update password
        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        
        // Invalidate all existing sessions (optional)
        // Add token to blacklist or update passwordChangedAt
        
        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            error: 'Password reset failed',
            message: 'An unexpected error occurred'
        });
    }
});

module.exports = router;
```

### **middleware/auth.js - Authentication Middleware**
```javascript
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication Middleware
 * 
 * This middleware:
 * 1. Extracts token from cookies/headers
 * 2. Verifies JWT validity
 * 3. Checks token expiration
 * 4. Validates user exists and is active
 * 5. Checks if password was changed after token issued
 * 6. Attaches user to request object
 */

const authenticate = async (req, res, next) => {
    try {
        console.log('🔐 Authentication started for:', req.method, req.path);
        
        // STEP 1: Extract token from multiple sources
        let token;
        
        // 1A: Check cookies first (HttpOnly cookies are most secure)
        if (req.cookies && req.cookies.access_token) {
            token = req.cookies.access_token;
            console.log('📦 Token found in cookies');
        }
        // 1B: Check Authorization header (Bearer token)
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('📦 Token found in Authorization header');
        }
        // 1C: Check query parameters (less secure, for specific cases)
        else if (req.query.token) {
            token = req.query.token;
            console.log('⚠️ Token found in query parameters (less secure)');
        }
        
        // STEP 2: If no token found
        if (!token) {
            console.log('❌ No authentication token provided');
            return res.status(401).json({
                error: 'Authentication required',
                message: 'Please login to access this resource',
                code: 'NO_TOKEN'
            });
        }
        
        // STEP 3: Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
                algorithms: ['HS256'], // Only accept HS256 algorithm
                issuer: 'myapp.com',   // Must match token issuer
                audience: 'web-client' // Must match token audience
            });
            console.log('✅ Token verified successfully. User ID:', decoded.userId);
        } catch (jwtError) {
            console.log('❌ JWT verification failed:', jwtError.name);
            
            // Handle specific JWT errors
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error: 'Session expired',
                    message: 'Your session has expired. Please login again.',
                    code: 'TOKEN_EXPIRED',
                    // Provide refresh endpoint if available
                    refreshUrl: '/api/auth/refresh'
                });
            }
            
            if (jwtError.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    error: 'Invalid token',
                    message: 'Authentication token is malformed or tampered',
                    code: 'INVALID_TOKEN'
                });
            }
            
            throw jwtError; // Re-throw unexpected errors
        }
        
        // STEP 4: Check token type
        if (decoded.type !== 'access') {
            console.log('❌ Wrong token type. Expected: access, Got:', decoded.type);
            return res.status(401).json({
                error: 'Invalid token type',
                message: 'Access token required',
                code: 'WRONG_TOKEN_TYPE'
            });
        }
        
        // STEP 5: Find user in database (with security fields)
        const user = await User.findById(decoded.userId)
            .select('+passwordChangedAt +isActive +role');
        
        if (!user) {
            console.log('❌ User not found in database');
            return res.status(401).json({
                error: 'User not found',
                message: 'User account no longer exists',
                code: 'USER_NOT_FOUND'
            });
        }
        
        // STEP 6: Check if user account is active
        if (!user.isActive) {
            console.log('❌ User account is inactive');
            return res.status(403).json({
                error: 'Account disabled',
                message: 'Your account has been disabled. Contact support.',
                code: 'ACCOUNT_DISABLED'
            });
        }
        
        // STEP 7: Check if password was changed after token was issued
        // This invalidates all tokens issued before password change
        if (user.changedPasswordAfter(decoded.iat)) {
            console.log('❌ Password changed after token issued');
            return res.status(401).json({
                error: 'Session invalidated',
                message: 'Password was changed. Please login again.',
                code: 'PASSWORD_CHANGED'
            });
        }
        
        // STEP 8: Check token issuance time (optional additional security)
        // Reject tokens issued more than 24 hours ago (even if not expired)
        const tokenAge = Date.now() / 1000 - decoded.iat;
        const MAX_TOKEN_AGE = 24 * 60 * 60; // 24 hours in seconds
        
        if (tokenAge > MAX_TOKEN_AGE) {
            console.log('❌ Token is too old');
            return res.status(401).json({
                error: 'Token too old',
                message: 'Token was issued too long ago. Please login again.',
                code: 'TOKEN_TOO_OLD'
            });
        }
        
        // STEP 9: Attach user to request object
        // Only include non-sensitive information
        req.user = {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            // Add session-specific data if needed
            session: {
                issuedAt: decoded.iat,
                expiresAt: decoded.exp
            }
        };
        
        console.log('✅ Authentication successful for user:', user.email);
        
        // STEP 10: Proceed to next middleware/route
        next();
        
    } catch (error) {
        console.error('🔥 Authentication middleware error:', error);
        
        // Don't expose internal errors in production
        const message = process.env.NODE_ENV === 'production'
            ? 'Authentication failed'
            : error.message;
        
        res.status(500).json({
            error: 'Authentication error',
            message: message,
            code: 'AUTH_ERROR'
        });
    }
};

/**
 * Authorization Middleware
 * 
 * Checks user permissions based on role
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        // Must be used after authenticate middleware
        if (!req.user) {
            return res.status(500).json({
                error: 'Authorization error',
                message: 'User not authenticated before authorization check'
            });
        }
        
        console.log('🔑 Authorization check for role:', req.user.role);
        console.log('🔑 Allowed roles:', allowedRoles);
        
        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(req.user.role)) {
            console.log('❌ Authorization failed. User role:', req.user.role);
            
            // Log unauthorized access attempt (security audit)
            console.warn(`⚠️ Unauthorized access attempt by ${req.user.email} (${req.user.role}) to ${req.method} ${req.path}`);
            
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to access this resource',
                requiredRoles: allowedRoles,
                yourRole: req.user.role,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }
        
        console.log('✅ Authorization successful');
        next();
    };
};

/**
 * Optional Authentication Middleware
 * 
 * Tries to authenticate but doesn't fail if no token
 * Useful for public routes that have optional user features
 */
const optionalAuth = async (req, res, next) => {
    try {
        let token;
        
        // Try to extract token
        if (req.cookies?.access_token) {
            token = req.cookies.access_token;
        } else if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            // No token, proceed without authentication
            return next();
        }
        
        // Try to authenticate
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
            algorithms: ['HS256'],
            issuer: 'myapp.com',
            audience: 'web-client'
        });
        
        const user = await User.findById(decoded.userId)
            .select('+isActive');
        
        if (user && user.isActive && !user.changedPasswordAfter(decoded.iat)) {
            req.user = {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            };
        }
        
        next();
    } catch (error) {
        // Invalid token, but don't fail - just proceed without authentication
        console.log('Optional auth failed, proceeding as guest');
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
```

### **routes/users.js - Protected User Routes**
```javascript
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// ======================
// GET CURRENT USER PROFILE
// ======================
router.get('/me', authenticate, async (req, res) => {
    try {
        console.log('👤 Fetching profile for user:', req.user.id);
        
        // Find user, exclude sensitive fields
        const user = await User.findById(req.user.id)
            .select('-password -passwordResetToken -passwordResetExpires')
            .lean(); // Convert to plain object
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'Your user account could not be found'
            });
        }
        
        res.status(200).json({
            success: true,
            user: user
        });
        
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Profile fetch failed',
            message: 'Failed to fetch user profile'
        });
    }
});

// ======================
// UPDATE USER PROFILE
// ======================
router.patch('/me', authenticate, async (req, res) => {
    try {
        console.log('✏️ Updating profile for user:', req.user.id);
        
        const { name, email } = req.body;
        const updates = {};
        
        // Validate and prepare updates
        if (name && name.trim().length > 0) {
            updates.name = name.trim();
        }
        
        if (email) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email',
                    message: 'Please provide a valid email address'
                });
            }
            
            // Check if email is already taken
            const existingUser = await User.findOne({ 
                email: email.toLowerCase(),
                _id: { $ne: req.user.id } // Exclude current user
            });
            
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email taken',
                    message: 'This email is already registered'
                });
            }
            
            updates.email = email.toLowerCase();
            updates.emailVerified = false; // Require verification for email change
        }
        
        // If no valid updates
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'No updates',
                message: 'No valid fields to update'
            });
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updates },
            { 
                new: true, // Return updated document
                runValidators: true, // Run schema validators
                select: '-password' // Exclude password
            }
        ).lean();
        
        // If email was changed, send verification email
        if (email && email !== req.user.email) {
            // Generate new verification token
            const verificationToken = updatedUser.createEmailVerificationToken();
            await updatedUser.save();
            
            // In production: send verification email
            // await sendVerificationEmail(updatedUser.email, verificationToken);
        }
        
        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: updatedUser
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({
            error: 'Update failed',
            message: 'Failed to update profile'
        });
    }
});

// ======================
// CHANGE PASSWORD
// ======================
router.patch('/change-password', authenticate, async (req, res) => {
    try {
        console.log('🔑 Changing password for user:', req.user.id);
        
        const { currentPassword, newPassword } = req.body;
        
        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Missing passwords',
                message: 'Current and new password are required'
            });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({
                error: 'Weak password',
                message: 'New password must be at least 8 characters'
            });
        }
        
        if (currentPassword === newPassword) {
            return res.status(400).json({
                error: 'Same password',
                message: 'New password must be different from current password'
            });
        }
        
        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        
        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Wrong password',
                message: 'Current password is incorrect'
            });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        // Invalidate all existing sessions (optional)
        // Could add token to blacklist or update passwordChangedAt
        
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
        
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            error: 'Password change failed',
            message: 'Failed to change password'
        });
    }
});

// ======================
// DELETE ACCOUNT
// ======================
router.delete('/me', authenticate, async (req, res) => {
    try {
        console.log('🗑️ Deleting account for user:', req.user.id);
        
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({
                error: 'Password required',
                message: 'Please confirm your password to delete account'
            });
        }
        
        // Get user with password
        const user = await User.findById(req.user.id).select('+password');
        
        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Wrong password',
                message: 'Password is incorrect'
            });
        }
        
        // Soft delete (mark as inactive) instead of hard delete
        user.isActive = false;
        await user.save();
        
        // Clear authentication cookies
        res.clearCookie('access_token');
        res.clearCookie('refresh_token');
        
        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
        
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Deletion failed',
            message: 'Failed to delete account'
        });
    }
});

// ======================
// VERIFY EMAIL
// ======================
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Hash token to compare with stored hash
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');
        
        // Find user with valid verification token
        const user = await User.findOne({
            emailVerificationToken: hashedToken,
            emailVerificationExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({
                error: 'Invalid or expired token',
                message: 'Email verification token is invalid or has expired'
            });
        }
        
        // Mark email as verified
        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        
        res.status(200).json({
            success: true,
            message: 'Email verified successfully'
        });
        
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: 'Failed to verify email'
        });
    }
});

module.exports = router;
```

### **routes/admin.js - Admin-Only Routes**
```javascript
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// ======================
// GET ALL USERS
// ======================
router.get('/users', async (req, res) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        
        // Build query
        const query = {};
        
        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const users = await User.find(query)
            .select('-password -passwordResetToken -passwordResetExpires')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();
        
        const total = await User.countDocuments(query);
        
        res.status(200).json({
            success: true,
            users: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
        
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            message: 'An unexpected error occurred'
        });
    }
});

// ======================
// UPDATE USER ROLE
// ======================
router.patch('/users/:userId/role', async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin', 'moderator'].includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                message: 'Role must be one of: user, admin, moderator'
            });
        }
        
        // Prevent self-demotion (admin can't remove own admin role)
        if (userId === req.user.id && role !== 'admin') {
            return res.status(400).json({
                error: 'Self-demotion',
                message: 'You cannot remove your own admin role'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role: role },
            { new: true, select: '-password' }
        ).lean();
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            user: user
        });
        
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({
            error: 'Role update failed',
            message: 'Failed to update user role'
        });
    }
});

// ======================
// DEACTIVATE USER
// ======================
router.patch('/users/:userId/deactivate', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Prevent self-deactivation
        if (userId === req.user.id) {
            return res.status(400).json({
                error: 'Self-deactivation',
                message: 'You cannot deactivate your own account'
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: false },
            { new: true, select: '-password' }
        ).lean();
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            user: user
        });
        
    } catch (error) {
        console.error('Deactivate user error:', error);
        res.status(500).json({
            error: 'Deactivation failed',
            message: 'Failed to deactivate user'
        });
    }
});

// ======================
// ACTIVATE USER
// ======================
router.patch('/users/:userId/activate', async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findByIdAndUpdate(
            userId,
            { isActive: true },
            { new: true, select: '-password' }
        ).lean();
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User does not exist'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            user: user
        });
        
    } catch (error) {
        console.error('Activate user error:', error);
        res.status(500).json({
            error: 'Activation failed',
            message: 'Failed to activate user'
        });
    }
});

module.exports = router;
```

## **.env File Configuration**
```env
# ======================
# SERVER CONFIGURATION
# ======================
NODE_ENV=development # or production
PORT=5000
CLIENT_URL=http://localhost:3000

# ======================
# DATABASE CONFIGURATION
# ======================
MONGODB_URI=mongodb://localhost:27017/yourapp

# ======================
# JWT SECRETS
# ======================
JWT_ACCESS_SECRET=your_super_strong_access_secret_key_here_at_least_32_chars
JWT_REFRESH_SECRET=your_super_strong_refresh_secret_key_here_different_from_access

# ======================
# SECURITY
# ======================
# Password hashing complexity
BCRYPT_SALT_ROUNDS=12

# Rate limiting
LOGIN_RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
LOGIN_RATE_LIMIT_MAX=5

# Session security
SESSION_MAX_AGE=604800000 # 7 days in milliseconds
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# ======================
# EMAIL SERVICE (Optional)
# ======================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
EMAIL_FROM=noreply@yourapp.com
```

## **Session Hijacking Prevention Summary**

### **1. Token Expiry Strategy**
```javascript
// Short-lived access tokens + Long-lived refresh tokens
const tokenStrategy = {
    accessToken: {
        expiresIn: '15m',     // Short expiry limits damage if stolen
        useCase: 'API calls'
    },
    refreshToken: {
        expiresIn: '7d',      // Longer expiry for user convenience
        useCase: 'Get new access tokens'
    }
};

// Implementation: Auto-refresh tokens before they expire
setInterval(refreshAccessToken, 14 * 60 * 1000); // Refresh 1 minute before expiry
```

### **2. Cookie Security Flags**
```javascript
res.cookie('token', token, {
    httpOnly: true,      // ❌ Prevents JavaScript access (XSS protection)
    secure: true,        // ❌ HTTPS only (prevents MITM attacks)
    sameSite: 'strict',  // ❌ Prevents CSRF attacks
    path: '/',           // Cookie scope
    maxAge: 900000,      // 15 minutes
    domain: '.yourapp.com' // For subdomains
});
```

### **3. Additional Protection Layers**
```javascript
const advancedProtection = {
    // 1. Token Binding
    tokenBinding: {
        ipAddress: req.ip,           // Bind token to IP
        userAgent: req.get('User-Agent'), // Bind to browser
        deviceFingerprint: generateFingerprint(req)
    },
    
    // 2. Token Rotation
    tokenRotation: {
        rotateOnUse: true,      // Issue new refresh token on each use
        revokeOldTokens: true   // Invalidate previous refresh tokens
    },
    
    // 3. Suspicious Activity Detection
    anomalyDetection: {
        checkLocation: true,     // Alert on login from new location
        checkDevice: true,       // Alert on new device
        rateLimit: true          // Block brute force attempts
    },
    
    // 4. Session Management
    sessionManagement: {
        concurrentSessions: 5,   // Max simultaneous sessions
        revokeAllOnPasswordChange: true
    }
};
```

### **4. Real-time Monitoring**
```javascript
// Log and alert on suspicious activities
const securityLogger = {
    logFailedAttempt: (ip, email, reason) => {
        console.warn(`⚠️ Failed login attempt from ${ip} for ${email}: ${reason}`);
        // Send alert if multiple failures
    },
    
    logNewDevice: (user, deviceInfo) => {
        console.log(`🆕 New device login for ${user.email}:`, deviceInfo);
        // Send email notification to user
    },
    
    logTokenTheft: (token, suspiciousActivity) => {
        console.error(`🚨 Possible token theft detected:`, suspiciousActivity);
        // Revoke all tokens for that user immediately
    }
};
```

This complete system provides enterprise-grade security with detailed explanations for each component. The key principles are:

1. **Defense in depth** - Multiple security layers
2. **Least privilege** - Users get minimum necessary permissions
3. **Secure defaults** - Everything is secure by default
4. **Audit logging** - Track all security events
5. **Regular rotation** - Frequent token refresh
6. **Proper error handling** - Don't leak information

Remember to:
- Use HTTPS in production
- Regularly update dependencies
- Monitor security advisories
- Conduct penetration testing
- Implement proper logging and monitoring