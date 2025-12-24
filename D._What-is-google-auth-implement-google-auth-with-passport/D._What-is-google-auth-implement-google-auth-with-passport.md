# Google OAuth with Passport.js (Google Strategy) 🔐

## Overview
This folder contains a simple example showing how to authenticate users with Google OAuth 2.0 using Passport.js and issue a JWT for client-side use. The example is minimal and intended as a starting point for integrating Google sign-in into a real-world Node.js or MERN application.

---

## Table of contents
- Prerequisites ✅
- Step 1 — Create Google OAuth credentials 🧾
- Step 2 — Project setup & dependencies ⚙️
- Step 3 — Environment variables (.env) 🔑
- Step 4 — How the example app (app.js) works 🔍
- Step 5 — Integrating into a real MERN app (controllers, routes, frontend) 🧩
- Step 6 — Security & production considerations ⚠️
- Step 7 — Testing & debugging 🧪
- Files in this folder 📁

---

## Prerequisites
Before we begin, ensure you have the following:

- Node.js (LTS recommended) installed on your machine
- A Google account to create OAuth credentials
- Basic knowledge of JavaScript and Node.js / Express
- For MERN integration: basic familiarity with React and MongoDB (Mongoose)

---

## Step 1: Set up Google OAuth credentials (Google Cloud Console) 🧾
1. Open the Google Cloud Console and sign in.
2. Create a new project (or pick an existing one).
3. Enable the OAuth consent screen:
   - APIs & Services → OAuth consent screen → Choose **External** → Create
   - Fill in App name, Support email and Developer contact information and save.
4. Create OAuth 2.0 credentials:
   - APIs & Services → Credentials → Create Credentials → OAuth client ID
   - Choose **Web application**
   - Add an **Authorized redirect URI** pointing to your app callback, e.g.:
     - `http://localhost:3000/auth/google/callback`
   - Save and **copy** the Client ID and Client Secret.

> Tip: For production, use your production domain (https) for redirect URIs.

---

## Step 2: Initialize / Install (project already present)
If starting fresh, you would:

```bash
mkdir google-auth-jwt
cd google-auth-jwt
npm init -y
npm install express passport passport-google-oauth20 jsonwebtoken dotenv
```

This example already has the required dependencies in `package.json`.

---

## Step 3: Configure environment variables (.env) 🔑
Create a `.env` file with the following keys (replace placeholders):

```
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

- `JWT_SECRET` is used to sign access tokens — keep it secret.
- `FRONTEND_URL` is useful for redirecting back to your frontend after login.

---

## Step 4: How the example app (app.js) works 🔍
The example `app.js` demonstrates Passport's Google strategy and issuing a JWT:

Key points:
- `passport.use(new GoogleStrategy(...))` registers the Google OAuth strategy.
- `app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }))` starts the OAuth flow.
- `app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => { ... })` handles the callback, generates a JWT and sends it.

Example behavior in `OAuth/app.js`:

```js
require('dotenv').config();
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');

const app = express();
app.use(passport.initialize());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
  // In a real app: find or create user in DB here
  return done(null, profile);
}));

// Start auth
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback: create a JWT and return to client
app.get('/auth/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id, displayName: req.user.displayName }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.listen(3000);
```

---

## Step 5: Integrating into a real MERN app (controllers, routes, frontend) 🧩
Below is a practical approach to integrate Google OAuth into an existing MERN stack app.

### Recommended backend structure

```
server/
├─ models/
│  └─ User.js        # Mongoose user model
├─ controllers/
│  └─ authController.js
├─ routes/
│  └─ auth.js        # auth routes using passport
├─ utils/
│  └─ token.js       # helpers for generating/verifying JWT
└─ app.js
```

### Example User model (Mongoose)
```js
// models/User.js
const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: String,
  displayName: String,
  avatar: String,
});
module.exports = mongoose.model('User', userSchema);
```

### Controller to find/create user & return JWT
```js
// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.googleCallback = async (req, res) => {
  // req.user comes from Passport Google Strategy (profile)
  const profile = req.user;
  let user = await User.findOne({ googleId: profile.id });
  if (!user) {
    user = await User.create({
      googleId: profile.id,
      email: profile.emails?.[0]?.value,
      displayName: profile.displayName,
      avatar: profile.photos?.[0]?.value
    });
  }

  // Generate tokens (access token, optionally refresh token)
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Option 1: Send token in JSON
  // res.json({ token });

  // Option 2 (recommended): Set httpOnly cookie and redirect to client
  res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.redirect(process.env.FRONTEND_URL + `/auth/success`);
};
```

### Auth routes
```js
// routes/auth.js
const express = require('express');
const passport = require('passport');
const router = express.Router();
const { googleCallback } = require('../controllers/authController');

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), googleCallback);

module.exports = router;
```

### Protecting routes using JWT middleware
```js
// middleware/auth.js
const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
```

### Frontend handling (React)
- Add a “Sign in with Google” button that directs the user to `GET /api/auth/google`.
- After the OAuth flow, **do not** include tokens in querystring for security. Prefer:
  - Using **httpOnly cookies** with secure and sameSite attributes, OR
  - Sending token in a JSON response and storing it in memory or localStorage (less secure than cookie).

Example: open a popup to `GET /api/auth/google` and after redirect to `FRONTEND_URL/auth/success` handle the cookie or token returned.

---

## Step 6: Security & production considerations ⚠️
- Use HTTPS in production; redirect URIs must be https.
- Use `state` parameter to mitigate CSRF attacks (Passport handles some of this).
- **Do not** store JWTs in localStorage if you can use httpOnly cookies.
- Keep `GOOGLE_CLIENT_SECRET` and `JWT_SECRET` out of source control.
- Consider using refresh tokens (longer lived) and rotate/blacklist them on logout.
- Validate email_verified on incoming Google profile if your app requires verified emails.

---

## Step 7: Testing & debugging 🧪
- Check callback URL mismatches if authentication fails: Google responds with redirect mismatch errors.
- Set `passport` debug logs (or console.log profile) during development.
- Use `jwt.verify()` to validate tokens locally.

---

## Files in this folder 📁
- `.env` — store `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`.
- `app.js` — minimal example demonstrating Passport Google Strategy and issuing JWT.
- `package.json` — lists dependencies used for the demo.

---

## Extra tips & resources 💡
- If you want server-side sessions (`express-session`), configure Passport's `serializeUser` / `deserializeUser`.
- For social login across multiple providers, standardize the user record (email, providerId, avatar).
- Google docs: https://developers.google.com/identity
- Passport Google strategy: https://github.com/jaredhanson/passport-google-oauth2

---

If you'd like, I can:
- Convert the `app.js` example into a clean `routes`+`controllers` structure for a MERN app ✅
- Add an example `User` model using Mongoose and wire it up to this example ✅

---

**Last updated:** 2025-12-24
