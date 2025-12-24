https://github.com/ankurdotio/Difference-Backend-video/tree/main/024-razorpay

# Razorpay Integration Project — Full Guide

> Complete documentation for the `razorpay` example project included in this repository. This file covers folder structure, how the backend and frontend work together, how the payment flow works end‑to‑end, how to install and run the project locally, how to obtain Razorpay API credentials, how to configure environment variables, testing tips, deployment hints, and security/reliability notes.

---

## Table of contents

1. Project overview
2. Folder structure (detailed)
3. How the app works (workflow / data flow)
4. Payment flow (Razorpay integration: server + client)
5. Setup & installation
   - Requirements
   - Install dependencies
   - Environment variables (.env files)
   - How to obtain Razorpay keys (step-by-step)
6. Running locally (dev & production)
7. Testing payments (Razorpay test mode, webhooks, and verification)
8. Deployment notes and production checklist
9. Security considerations
10. Troubleshooting & common errors
11. Extending the project (optional features)
12. Appendix: sample requests, responses and minimal code snippets

---

## 1) Project overview

This repo includes a simple but realistic demo of accepting payments with Razorpay. The example demonstrates:

- A CRUD-like `product` backend (create/get a product), exposed as a REST API under `/api/products`.
- A minimal frontend that shows a product card and a "Buy Now" button that initiates Razorpay checkout.
- A server-side `payment` controller that creates Razorpay orders, returns order details to the frontend, and includes optional webhook handling / verification for completed payments.

Goals of the example:

- Show how to create an order on the server and pass the order details to the client.
- Demonstrate verifying payment signatures on the server so payments are trusted.
- Show a simple, modern UI and responsive layout for a payment flow.

This is a learning/demo project, not a production-ready payment system — treat it as a reference implementation to adapt for real usage.

---

## 2) Folder structure (detailed)

Absolute path in this workspace: `g:\code\Web techs\SheryiansCodingSchool\Backend\C._What-is-razorpay-and-how-to-use-it\razorpay`

```
razorpay/
├─ Backend/
│  ├─ .env                 # Environment variables for backend (do not commit)
│  ├─ package.json         # Backend dependencies & scripts
│  ├─ server.js            # Start point (bootstraps app, connects DB)
│  └─ src/
│     ├─ app.js            # Express app, CORS, middleware, routes
│     ├─ db/               # DB connection helper(s) (e.g., mongoose)
│     │  └─ db.js
│     ├─ routes/
│     │  ├─ product.routes.js  # /api/products routes
│     │  └─ payment.routes.js  # /api/payments routes
│     ├─ controllers/
│     │  ├─ product.controller.js # handlers for product CRUD
│     │  └─ payment.controller.js # handlers to create orders, verify webhooks, etc.
│     └─ models/
│        ├─ product.model.js     # mongoose model for Product
│        └─ payment.model.js     # (optional) model to record payments

├─ Frontend/
│  ├─ .env                # Frontend env (Vite/CRA-like variables)
│  ├─ package.json        # Frontend deps & scripts
│  ├─ index.html
│  ├─ vite.config.js      # or config for dev server
│  └─ src/
│     ├─ main.jsx         # React entry
│     ├─ api/axios.js     # axios instance to call backend
│     ├─ App.jsx          # product card, checkout integration
│     ├─ App.css          # modern styles used by App
│     └─ components/
│        └─ PaymentButton.jsx # encapsulates Razorpay checkout logic
```

Notes:
- The server exposes endpoints under `/api/products` and `/api/payments` for product and payment related operations respectively.
- The backend uses MongoDB via `mongoose` (see `src/db/db.js` and `src/models`). If you prefer, you can swap the database for a simple in-memory store during development.

---

## 3) How the app works (workflow / data flow)

High-level flow:

1. Frontend loads product info by calling GET `/api/products/get-item`.
2. The user clicks **Buy Now** on the product card.
3. Frontend calls POST `/api/payments/create-order` (or a similar endpoint) with the order amount, currency, and metadata.
4. Backend uses Razorpay Node SDK to create an *Order* using server-side API keys. Razorpay returns an order id and amount.
5. The backend returns the Razorpay order id and required details back to the frontend.
6. Frontend opens the Razorpay Checkout widget with the order id and the public key (key_id) present in frontend environment variables.
7. The user completes the payment inside the Razorpay widget.
8. Razorpay sends the payment `razorpay_payment_id`, `razorpay_order_id`, and `razorpay_signature` to the client after successful payment.
9. Optionally the frontend posts these to the backend for server-side verification, or the server verifies a webhook signature if you use webhooks.
10. Server verifies the signature using `razorpay_secret` and marks the payment as succeeded in your DB (or rejects if verification fails).

Important security point: Always create orders from the server (not from the client) and always verify signatures server-side before giving the client any "payment succeeded" trust (e.g., delivering digital goods or enabling premium features).

---

## 4) Payment flow (Razorpay-specific details)

Key entities:

- Key ID (a.k.a. `RAZORPAY_KEY_ID` or `KEY_ID`) — used on the **client** only to open Razorpay checkout.
- Key Secret (a.k.a. `RAZORPAY_KEY_SECRET` or `KEY_SECRET`) — used on the **server** to create orders and verify signatures. **Never** expose this key in the frontend.
- Order — created by server via Razorpay Orders API. The order holds amount (in smallest currency unit), currency, and a unique id. Example: `{ id: 'order_ABCDEFG', amount: 299900, currency: 'INR' }`.
- Payment — result of a user completing a checkout. Razorpay returns `payment_id`, `order_id`, and `signature`.

Server-side steps (typical):

1. Receive POST /api/payments/create-order { amount, currency, receipt?, notes? }.
2. Use Razorpay SDK: `razorpay.orders.create({ amount, currency, receipt, payment_capture: 1 })`.
3. Save the returned order id and amount in `payments` collection (optional) and return the order details to client.

Client-side steps (typical):

1. Fetch order details from server.
2. Use `new Razorpay({ key: PUBLIC_KEY, order_id: ORDER_ID, amount, name, description, handler: (response) => {...} })`.
3. In the handler, send `response.razorpay_payment_id`, `response.razorpay_order_id`, and `response.razorpay_signature` to the backend to verify the payment server-side: `POST /api/payments/verify`.

Server verification (example):

- Compute HMAC SHA256 signature of `${order_id}|${payment_id}` using your `KEY_SECRET`.
- Compare computed signature to `razorpay_signature` returned by the client. If they match → mark as successful.

Webhooks (alternative verification):

- Configure Razorpay webhooks in your Razorpay Dashboard to post payment events to your server (e.g., `/webhooks/razorpay`).
- Verify webhook signatures using the webhook secret (provided when you set up webhooks), and act on events like `payment.captured`, `payment.failed` etc.

---

## 5) Setup & installation

### Requirements

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB (local or hosted; Atlas recommended for dev/test if you want a cloud DB)
- A Razorpay account (sign up for sandbox/test credentials at https://razorpay.com)

### Install dependencies

From the project root (the `razorpay` folder contains two packages: Backend and Frontend):

Backend:

```bash
cd razorpay/Backend
npm install
```

Frontend:

```bash
cd razorpay/Frontend
npm install
```

### Environment variables (.env files)

There are two `.env` files — one for the Backend and one for the Frontend. Never commit `.env` files containing secrets to source control.

Backend `.env` (example contents)

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/razorpay_demo
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_here
WEBHOOK_SECRET=whsec_XXXXXXXX  # optional if using webhooks
NODE_ENV=development
```

Frontend `.env` (example contents)

```
VITE_API_BASE_URL=http://localhost:3000   # or REACT_APP_API_BASE_URL depending on your toolchain
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXX   # public key only
```

Notes:
- On Vite the env prefix is `VITE_`. For Create-React-App it is `REACT_APP_`.
- `RAZORPAY_KEY_SECRET` must only be present on the server.

### How to obtain Razorpay keys (step-by-step)

1. Create an account at https://razorpay.com and sign in.
2. Go to **Settings** → **API Keys** (or follow "Developers" → "API Keys") in the Dashboard.
3. Create a new set of keys. You'll get a `Key ID` (starts with `rzp_test_` in sandbox) and a `Key Secret`.
4. For webhooks, under **Settings** → **Webhooks** add a new webhook with your server endpoint (e.g., `https://yourdomain.com/webhooks/razorpay`) and note the **Webhook Secret** given by Razorpay — store it in your backend `.env` as `WEBHOOK_SECRET`.

Sandbox vs production:

- For testing use `rzp_test_...` keys (sandbox). For production, generate live keys (starts with `rzp_live_...`) and ensure `NODE_ENV=production` and you use HTTPS endpoints.

---

## 6) Running locally (dev & production)

### Backend (development)

1. Make sure MongoDB is running and `MONGO_URI` in `.env` points to it.
2. Start the server (examples):

```bash
cd razorpay/Backend
# set environment variables or copy .env
npm run dev   # if project uses nodemon or a dev script (check package.json)
# or
node server.js
```

3. Verify: `GET http://localhost:3000/api/products/get-item` should return the product object (you can insert one using POST /api/products).

### Frontend (development)

```bash
cd razorpay/Frontend
npm run dev   # Vite
# or npm start for CRA
```

Open `http://localhost:3000` or `http://localhost:5173` depending on your dev server.

### Production build & run (minimal)

- Build frontend (`npm run build` in Frontend) and serve the `dist` with a static server or integrate into the backend's static middleware.
- Start backend in production mode and point `VITE_API_BASE_URL` (or REACT app equivalent) to production API URL.

---

## 7) Testing payments

Use Razorpay test mode for development. Steps:

- Use test keys (rzp_test_*) in `.env`.
- Create an order via your server, open checkout, and use Razorpay test cards (list available in Razorpay docs — e.g., test card `4111 1111 1111 1111` with any CVC & future expiry).
- After payment, verify server-side signature computed using `RAZORPAY_KEY_SECRET`.
- Optionally, use webhooks to simulate asynchronous events. Razorpay dashboard allows sending test webhook events to your endpoint.

Signature verification example (Node):

```js
const crypto = require('crypto');
function verifySignature({ order_id, payment_id, signature }) {
  const body = order_id + '|' + payment_id;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}
```

If successful, mark the payment record in DB as `captured: true` and proceed with order fulfillment.

---

## 8) Deployment notes and production checklist

- Use production keys (`rzp_live_...`), and keep `RAZORPAY_KEY_SECRET` secret — store it in environment variables, not in source control.
- Use HTTPS and a valid domain for webhook configuration.
- Configure webhooks in Razorpay dashboard to point to your production endpoint and store the webhook secret.
- Use a persistent DB and regular backups. Configure proper indexes on your `payments` collection for lookups.
- Monitor API errors and account for rate limiting.

---

## 9) Security considerations

- Never include the Razorpay secret in frontend code or in a client-visible place.
- Always create orders on the server. Relying on the client to pass order amounts allows tampering.
- Verify payment signatures on the server — never trust client-reported success alone.
- Validate & sanitize inputs on server endpoints.
- Use TLS (HTTPS) in production. Use secure cookie attributes and CSRF protection where relevant.

---

## 10) Troubleshooting & common errors

- Blank or white page in frontend: check Console (F12) for runtime errors and Network tab for failed bundles. Ensure API base URL is correct and the dev server is running.
- `No product found`: Ensure you have added a product to the DB or POST `/api/products` with the example payload.
- Webhook signature verification failing: confirm you are using the correct webhook secret and you are verifying using the raw request body (some frameworks parse body which changes signature — use raw body or a signature helper).
- `ECONNREFUSED` for DB: ensure MongoDB is running and `MONGO_URI` is set correctly.

---

## 11) Extending the project (ideas)

- Add a checkout flow with a serverable invoice and email receipt on successful payment.
- Add order history and admin dashboard to see payments and refunds.
- Add subscription payments (Razorpay Subscriptions API) or capture refunds via API.
- Add tests: unit tests for verification helpers and integration tests for the payment routes (mock Razorpay API or use test mode).

---

## 12) Appendix — Example JSON, endpoints & snippets

Create product (example):

POST /api/products

Request body:

```json
{
  "image": "https://cdn.example.com/products/wireless-headphones.jpg",
  "title": "Wireless Bluetooth Headphones",
  "description": "Over-ear wireless headphones with active noise cancellation and 30 hours battery life.",
  "price": { "ammount": 2999, "currency": "INR" },
  "category": "Electronics"
}
```

Successful response:

```json
HTTP/1.1 201 Created
{
  "message": "product creatd succesfully",
  "product": { ... }
}
```

Create order (server):

POST /api/payments/create-order

Request body:

```json
{ "amount": 2999, "currency": "INR", "notes": { "userId": "abc" } }
```

Server (Node) snippet to create order using `razorpay` package:

```js
const Razorpay = require('razorpay');
const rp = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

// amount must be in smallest currency unit (paise for INR): multiply by 100
const order = await rp.orders.create({ amount: amount * 100, currency: 'INR', receipt: 'receipt#1', payment_capture: 1 });
```

Client: open Razorpay checkout using the returned `order.id` and your public key:

```js
const options = {
  key: process.env.VITE_RAZORPAY_KEY_ID, // public key
  amount: order.amount,
  currency: order.currency,
  name: 'My Store',
  order_id: order.id,
  handler: function (response) {
    // response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature
    // send to server to verify
  }
};
const rzp = new Razorpay(options);
rzp.open();
```

Signature verification: see section 7.

---

## Final notes

- This document should provide a complete reference to set up and understand the example Razorpay integration in this repository.
- If you want, I can also:
  - Add a `seed` script to create the demo product automatically,
  - Add a `test-webhook` endpoint and instructions for sending webhook test events from the dashboard,
  - Add a step-by-step tutorial in the repo `README.md` summarizing the exact shell commands to run.

If you'd like any of those additions, tell me which one and I will add it.
