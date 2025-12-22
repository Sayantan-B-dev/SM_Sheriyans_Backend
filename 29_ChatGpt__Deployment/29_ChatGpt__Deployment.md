# CohortGPT — Backend & Frontend Overview ✅

## Project summary 💡
**CohortGPT** is a simple full-stack chat application built with:
- Backend: **Node.js + Express + MongoDB + Socket.io**
- Frontend: **React (Vite)**
- Vector/Memories: **Xenova embeddings** + **Pinecone** index
- LLM: **Groq** (via `groq-sdk`) used to generate AI responses

This document explains how the frontend and backend are structured, how they connect at runtime, and how the chat pipeline (short-term + long-term memory + model call) works.

---

## Repo layout (selected folder: `cohortGPT`) 🔧
- `backend/` — Express API + WebSocket server
  - `.env` — environment variables (see *Env variables* below)
  - `package.json` — dev and runtime dependencies
  - `server.js` — entry file (creates HTTP server, init socket server; listens on port 3000)
  - `src/app.js` — express app, CORS & routes
  - `src/db/db.js` — MongoDB connection
  - `src/routes/` — `auth.routes.js`, `chat.routes.js`
  - `src/controller/` — `auth.controller.js`, `chat.controller.js`
  - `src/models/` — `user.model.js`, `chat.model.js`, `message.model.js`
  - `src/middlewares/auth.middleware.js` — verifies JWT cookie
  - `src/sockets/socket.server.js` — socket handlers and message pipeline
  - `src/services/` — `embedding.service.js`, `groq.service.js`, `vector.service.js`

- `frontend/` — React app
  - `package.json` — deps (react, axios, socket.io-client)
  - `vite` dev server (default `http://localhost:5173`)
  - `src/api/axiosClient.js` — axios instance (`baseURL: http://localhost:3000/api`, `withCredentials: true`)
  - `src/socket.js` — socket.io client configured to `http://localhost:3000` (autoConnect: false)
  - `src/pages/` — `Login.jsx`, `Register.jsx`, `Home.jsx`
  - `src/components/` — `Sidebar.jsx`, `ChatArea.jsx`, UI components

---

## How it works — high-level flow 🎯
1. User registers (`POST /api/auth/register`) → user saved to MongoDB.
2. User logs in (`POST /api/auth/login`) → server sets a **JWT cookie** (name: `token`) and returns user payload.
3. Frontend stores a copy of the user in `localStorage` and then **connects the socket** (`socket.connect()`).
4. Socket `connection` uses the cookie-based JWT to authenticate (socket middleware verifies token and finds user).
5. Chat UI sends messages to backend via socket event `ai-message` with `{ chat, content }`.
6. On `ai-message`:
   - Backend saves the user message to `messages` collection (role: `user`).
   - The message content is turned into an embedding vector via `embedding.service.generateVector` (Xenova model).
   - Backend queries Pinecone (via `vector.service.queryMemory`) for similar vectors to build **long-term memory** (LT memory).
   - Backend loads the short-term memory (history) from `messages` collection.
   - Backend constructs a prompt (LT memory + STM history) and calls `groq.service.generateResponse` to get the AI output.
   - Immediately emits `ai-response` to the client (fast user feedback).
   - In background, stores AI message to DB, generates its embedding, and upserts both user and AI vectors into Pinecone to grow long-term memory.

This design gives both short-term (recent messages) and long-term (similar past messages) context to the model.

---

## Auth & Connection details 🔐
- **Auth flow**: `POST /api/auth/login` returns a `token` cookie (JWT). The backend uses `process.env.JWT_SECRET` to sign/verify tokens.
- **Socket auth**: the socket server reads cookies from `socket.handshake.headers.cookie`, parses `token`, verifies, and attaches `socket.user`.
- **Axios** uses `withCredentials: true`, so cookie auth works for API requests.

---

## Important files & responsibilities 🔎
- `backend/server.js` — initialize DB, init sockets, start HTTP server.
- `src/app.js` — sets CORS to `http://localhost:5173` and mounts `/api/auth` and `/api/chat` routes.
- `src/controller/auth.controller.js` — register/login/logout logic, creates a default chat on first login.
- `src/controller/chat.controller.js` — create/get/rename/delete chats and fetch messages.
- `src/sockets/socket.server.js` — main AI pipeline for streaming responses and creating memories.
- `src/services/embedding.service.js` — loads Xenova embedding pipeline; returns 768-d vector.
- `src/services/vector.service.js` — Pinecone upsert/query wrappers.
- `src/services/groq.service.js` — builds system persona + formats messages and calls Groq chat completions.

Frontend
- `src/socket.js` — socket client config (transports: websocket; withCredentials: true; autoConnect:false).
- `src/pages/Login.jsx` — logs in, stores `user` to `localStorage`, calls `socket.connect()`.
- `src/pages/Home.jsx` — on mount ensures user, connects socket, loads/creates initial chat, mounts `Sidebar` + `ChatArea`.
- `src/components/ChatArea.jsx` — local UI state for `messages`, sends `ai-message` via socket and listens for `ai-response`.

---

## Required environment variables (add to `backend/.env`) ⚠️
Do not commit secrets. Use placeholders in README and set real values locally.

- `MONGO_URL` — MongoDB connection string (e.g., `mongodb://localhost:27017/CohortGPT`)
- `JWT_SECRET` — secret used to sign JWT cookies
- `GROQ_API_KEY` — Groq API key for `groq-sdk`
- `GROQ_MODEL` — model id (e.g., `llama-3.1-8b-instant`)
- `PINECONE_API_KEY` — Pinecone API key (for vector DB)
- `GEMINI_API_KEY` — optional / present in project (not used directly here)

Tip: keep these as environment variables on your server or in a secrets manager; do not push them to public repo.

---

## How to run locally 🧪
1. Start MongoDB (local or use a managed DB). Ensure `MONGO_URL` is reachable.
2. Backend
   - cd `backend`
   - npm install
   - create `.env` with the variables above
   - npm run dev   (starts nodemon -> `server.js` -> listens on port 3000)
3. Frontend
   - cd `frontend`
   - npm install
   - npm run dev   (Vite serves at `http://localhost:5173`)
4. Open `http://localhost:5173`, register an account, login.

Notes:
- Frontend expects backend at `http://localhost:3000` and socket at the same origin.
- If using remote backend, update `src/api/axiosClient.js` and `src/socket.js` accordingly.

---

## Common issues & troubleshooting ⚠️
- Embedding loading may take a while on first call; Xenova downloads/loads models — expect startup delay.
- If `generateVector` returns `null`, check input sanitization and / or model load errors printed in backend logs.
- Pinecone errors: ensure `PINECONE_API_KEY` is valid and index `cohort-chat-gpt` exists (or create programmatically).
- Socket connection errors: verify cookie is present and `JWT_SECRET` matches the token signer.
- CORS/credentials: backend CORS allows `http://localhost:5173` and uses `withCredentials: true` on axios/socket config.

---

## Notes for future improvements 💡
- Move persona and prompt instructions to a configurable file for easier tuning.
- Add tests for controller logic and socket handlers.
- Add graceful error and retry logic for vector/API calls.
- Consider batching vector upserts to reduce rate/IO cost.

---

If you'd like, I can also:
- Create a short `README.md` in the `cohortGPT` folder from this content ✅
- Add a `docker-compose` file with services (Mongo + backend + frontend) for repeatable local setup ✅

---

Made edits: a complete description of frontend & backend structure, runtime flow, env vars, and setup instructions. Let me know if you want a compact `README.md` or diagrams added.
