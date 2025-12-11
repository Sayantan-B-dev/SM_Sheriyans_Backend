# Practical Guide: JWT, Middleware, and Project Structure

## 1. 🔐 **JWT.verify() - How It Works**

### **Theory + Code**
JWT has 3 parts separated by dots: `header.payload.signature`

```javascript
const jwt = require('jsonwebtoken');

// 1. TOKEN CREATION (jwt.sign)
const token = jwt.sign(
    { userId: 123, role: 'user' },  // Payload (data)
    'your-secret-key',              // Secret key
    { expiresIn: '1h' }             // Options
);
// Result: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywicm9sZSI6InVzZXIiLCJpYXQiOjE2OTkwNDgwMDB9.XYZabc123..."

// 2. TOKEN VERIFICATION (jwt.verify)
const verifyToken = (token) => {
    try {
        // jwt.verify does 3 things:
        // 1. Decodes token (split by '.')
        // 2. Verifies signature using secret
        // 3. Checks expiration
        const decoded = jwt.verify(token, 'your-secret-key');
        return { valid: true, data: decoded };
    } catch (error) {
        // Common errors:
        if (error.name === 'TokenExpiredError') {
            return { valid: false, error: 'Token expired' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { valid: false, error: 'Invalid token' };
        }
        return { valid: false, error: 'Token verification failed' };
    }
};

console.log(verifyToken(token));
// Output: { valid: true, data: { userId: 123, role: 'user', iat: 1699048000, exp: 1699051600 } }
```

**What happens inside `jwt.verify()`:**
1. **Splits token**: `["header", "payload", "signature"]`
2. **Decodes header**: Checks algorithm (must be HS256/RS256)
3. **Recreates signature**: Uses `secret + header + payload`
4. **Compares signatures**: If they match, token is authentic
5. **Checks expiration**: If `Date.now() > exp`, throws error

## 2. 🛡️ **Creating Protected APIs**

### **Middleware Pattern for Protection**
```javascript
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // 1. Get token from header/cookie
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            error: 'Not authorized, no token' 
        });
    }
    
    try {
        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Attach user to request
        req.user = decoded;
        
        // 4. Continue to next middleware/route
        next();
    } catch (error) {
        return res.status(401).json({ 
            error: 'Not authorized, invalid token' 
        });
    }
};

// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');

// PUBLIC route (no protection)
router.get('/public', (req, res) => {
    res.json({ message: 'Anyone can see this' });
});

// PROTECTED route (requires valid JWT)
router.get('/profile', protect, (req, res) => {
    // Only reaches here if protect() calls next()
    res.json({ 
        message: 'Your profile',
        user: req.user  // From middleware
    });
});

// MULTIPLE MIDDLEWARE
router.post('/admin', 
    protect,                       // 1st: Check auth
    (req, res, next) => {          // 2nd: Check role
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Admin only' });
        }
        next();
    },
    (req, res) => {                // 3rd: Main handler
        res.json({ message: 'Admin action' });
    }
);
```

## 3. 🔄 **Middleware Deep Dive**

### **What is Middleware?**
Middleware are functions that run **between** request and response. They can:
- Modify request/response objects
- End request-response cycle
- Call next middleware

```javascript
// Anatomy of middleware
const myMiddleware = (req, res, next) => {
    // 1. Do something with req/res
    req.timestamp = Date.now();
    
    // 2. Either:
    //    - Call next() to continue
    //    - Send response to end cycle
    
    // Option A: Continue chain
    next();
    
    // Option B: End here
    // res.status(400).json({ error: 'Stop!' });
};

// ORDER MATTERS! Top to bottom execution
app.use((req, res, next) => {
    console.log('1st - Always runs');
    next();
});

app.use('/api', (req, res, next) => {
    console.log('2nd - Only for /api routes');
    next();
});

app.get('/api/users', (req, res) => {
    console.log('3rd - Route handler');
    res.json({ users: [] });
});

// Output for GET /api/users:
// 1st - Always runs
// 2nd - Only for /api routes
// 3rd - Route handler
```

### **Common Middleware Types**
```javascript
// 1. LOGGING middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// 2. CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// 3. ERROR HANDLING middleware (4 parameters!)
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({ error: 'Something broke!' });
});

// 4. NOT FOUND middleware (catch-all)
app.use((req, res, next) => {
    res.status(404).json({ error: 'Route not found' });
});
```

## 4. 📤 **Multer as Middleware**

### **Theory + Code**
Multer handles `multipart/form-data` (file uploads).

```javascript
const multer = require('multer');
const path = require('path');

// OPTION 1: Memory Storage (process in memory, no disk)
const upload = multer({
    storage: multer.memoryStorage(), // File in req.file.buffer
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(
            path.extname(file.originalname).toLowerCase()
        );
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only images allowed'));
    }
});

// OPTION 2: Disk Storage (save to disk)
const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Save to uploads folder
    },
    filename: (req, file, cb) => {
        // Create unique filename
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// USAGE in routes
const express = require('express');
const router = express.Router();

// Single file upload
router.post('/upload', 
    upload.single('image'),  // Middleware: processes file
    (req, res) => {
        // After multer processes:
        console.log(req.file); // Uploaded file info
        console.log(req.body); // Other form fields
        
        // Access file buffer (memoryStorage)
        const imageBuffer = req.file.buffer;
        
        res.json({ 
            success: true, 
            filename: req.file.originalname 
        });
    }
);

// Multiple files
router.post('/upload-multiple',
    upload.array('images', 5), // Max 5 files
    (req, res) => {
        console.log(req.files); // Array of files
        res.json({ count: req.files.length });
    }
);

// Different fields
router.post('/create-post',
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'gallery', maxCount: 5 }
    ]),
    (req, res) => {
        console.log(req.files.cover);     // Single file
        console.log(req.files.gallery);   // Array of files
    }
);
```

## 5. 🗄️ **Mongoose ref Explained**

### **Theory + Code**
`ref` creates relationships between collections (like foreign keys in SQL).

```javascript
const mongoose = require('mongoose');

// USER MODEL
const userSchema = new mongoose.Schema({
    username: String,
    email: String
});
const User = mongoose.model('User', userSchema);

// POST MODEL with ref
const postSchema = new mongoose.Schema({
    image: String,
    caption: String,
    user: {
        type: mongoose.Schema.Types.ObjectId, // Stores user's _id
        ref: 'User'  // ❗ REFERS TO 'User' collection/model
        // 'User' must match model name exactly
    }
});

const Post = mongoose.model('Post', postSchema);

// CREATING RELATIONSHIP
const createPost = async () => {
    // 1. Find or create user
    const user = await User.findOne({ email: 'test@example.com' });
    
    // 2. Create post referencing user's _id
    const post = await Post.create({
        image: 'sunset.jpg',
        caption: 'Beautiful sunset',
        user: user._id  // Store user's ObjectId
    });
    // post.user = ObjectId("507f1f77bcf86cd799439011")
};

// QUERYING WITH POPULATE (JOIN in SQL terms)
const getPostsWithUsers = async () => {
    // WITHOUT populate - just get ObjectId
    const posts = await Post.find();
    // Result: [{ image: 'sunset.jpg', user: '507f1f77bcf86cd799439011', ... }]
    
    // WITH populate - get full user data
    const postsWithUsers = await Post.find()
        .populate('user')  // Replaces ObjectId with User document
        .exec();
    
    // Result: 
    // [{
    //   image: 'sunset.jpg',
    //   user: { _id: '507f1f77bcf86cd799439011', username: 'john', email: 'john@example.com' },
    //   ...
    // }]
    
    // SELECTIVE populate
    const selective = await Post.find()
        .populate('user', 'username email') // Only get username & email
        .exec();
    
    // NESTED populate (if user has refs)
    const nested = await Post.find()
        .populate({
            path: 'user',
            populate: { path: 'profile' } // User's profile ref
        })
        .exec();
};
```

**Key Points about `ref`:**
- Creates **relationship**, not **embedding**
- References **another model's name** (case-sensitive)
- Uses `ObjectId` type to store reference
- `populate()` acts like a JOIN operation
- Data stays normalized (no duplication)

## 6. 🤖 **Google Generative AI Setup**

### **Theory + Code**
```javascript
// INSTALLATION & SETUP
// Terminal: npm install @google/generative-ai
// Get API key: https://aistudio.google.com/app/apikeys

// basic-ai.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Initialize with API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

// 2. Choose model
const model = genAI.getGenerativeModel({ 
    model: "gemini-pro",  // For text
    // gemini-pro-vision for images
});

// 3. Generate content
async function generateCaption(imageDescription) {
    try {
        const prompt = `Generate a creative Instagram caption for: ${imageDescription}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        return text;
    } catch (error) {
        console.error('AI Error:', error);
        return "Default caption";
    }
}

// IMAGE PROCESSING with Gemini Pro Vision
async function analyzeImage(imageBuffer) {
    const visionModel = genAI.getGenerativeModel({ 
        model: "gemini-pro-vision" 
    });
    
    const imageParts = [
        {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg"
            }
        }
    ];
    
    const result = await visionModel.generateContent([
        "Describe this image in detail",
        ...imageParts
    ]);
    
    return result.response.text();
}
```

## 7. 📁 **Why Service Folder? AI Service Pattern**

### **Theory + Code**
Services separate **business logic** from controllers.

```javascript
// PROJECT STRUCTURE:
// src/
//   controllers/    - Handle HTTP requests/responses
//   services/       - Business logic, external APIs
//   models/         - Database schemas
//   routes/         - Route definitions
//   middleware/     - Middleware functions

// ❌ WITHOUT SERVICE LAYER (Messy controller)
// controllers/postController.js
exports.createPost = async (req, res) => {
    try {
        // 1. Upload image to Cloudinary
        const cloudinaryResult = await cloudinary.upload(req.file.buffer);
        
        // 2. Generate AI caption
        const aiCaption = await callGeminiAPI(cloudinaryResult.url);
        
        // 3. Save to database
        const post = await Post.create({
            image: cloudinaryResult.url,
            caption: aiCaption,
            user: req.user.id
        });
        
        // 4. Send notification
        await sendNotification(post);
        
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Problem: Controller does too much!

// ✅ WITH SERVICE LAYER
// services/ai.service.js
class AIService {
    async generateImageCaption(imageUrl) {
        // All AI logic here
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        // ... AI logic
        return caption;
    }
}

// services/cloudinary.service.js  
class CloudinaryService {
    async uploadImage(buffer) {
        // All Cloudinary logic here
        return cloudinary.upload(buffer);
    }
}

// services/post.service.js
class PostService {
    constructor() {
        this.aiService = new AIService();
        this.cloudinaryService = new CloudinaryService();
    }
    
    async createPost(userId, imageBuffer) {
        // 1. Upload image
        const imageUrl = await this.cloudinaryService.uploadImage(imageBuffer);
        
        // 2. Generate caption
        const caption = await this.aiService.generateImageCaption(imageUrl);
        
        // 3. Create post
        const post = await Post.create({
            image: imageUrl,
            caption,
            user: userId
        });
        
        return post;
    }
}

// controllers/postController.js (Clean!)
const PostService = require('../services/post.service');
const postService = new PostService();

exports.createPost = async (req, res) => {
    try {
        const post = await postService.createPost(
            req.user.id, 
            req.file.buffer
        );
        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### **Why This Structure?**
1. **Testability**: Mock services in tests
2. **Reusability**: Use `AIService` in multiple controllers
3. **Maintainability**: Change AI provider without touching controllers
4. **Separation**: Controllers handle HTTP, services handle business logic

### **Middleware vs Service:**
- **Middleware**: Request/response pipeline (authentication, logging)
- **Service**: Business operations (AI, database, external APIs)
