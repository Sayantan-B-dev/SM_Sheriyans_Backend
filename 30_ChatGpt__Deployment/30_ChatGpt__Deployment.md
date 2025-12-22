# Deployment Guide — Backend (Render) & Frontend (Vercel) 🚀

This document explains how to deploy the Olivia project with the **backend** as a Render Web Service and the **frontend** as a Vercel Static Site, including configuration, environment variables, best practices, verification steps and troubleshooting.

---

## Summary (quick)
- Backend: Render → **Web Service** (Node).
  - Root directory: `backend/`
  - Start command: `npm start` (server uses `process.env.PORT`)
- Frontend: Vercel → **Static Site** (Vite build).
  - Root directory: `frontend/`
  - Build command: `npm install && npm run build`
  - Output directory: `dist`
- Important env vars: `MONGO_URL`, `JWT_SECRET`, `FRONTEND_URLS`, `PINECONE_API_KEY`, `GROQ_API_KEY`, `GROQ_EMBEDDING_MODEL` (backend); `VITE_API_URL` (frontend).

---

## Preconditions & accounts
- GitHub (or Git provider) repo connected to both Render and Vercel.
- Render account with permission to create Web Services.
- Vercel account to deploy Static Site.
- Optional: custom domain(s) set up (DNS control).

---

## Backend (Render) — detailed steps 🔧

### 1) Prepare the repo (already done in project)
- Ensure `backend/server.js` reads `process.env.PORT` and `backend/package.json` has a `start` script: `node server.js`.
- Ensure CORS & sockets allow configured frontend origins via env var `FRONTEND_URLS` (comma-separated). Example: `FRONTEND_URLS=https://your-frontend.vercel.app,http://localhost:5173`.
- Ensure cookie options for auth set: `res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'none' })`.

### 2) Add a health endpoint (recommended)
- Add a simple GET `/health` that returns 200. Render can use this for health checks.

### 3) Render service creation
1. Render → New → **Web Service** → Connect to repo & branch.
2. Set **Root Directory** to `backend`.
3. Environment: select Node version 18+ (match package.json).
4. Start command: `npm start`.
5. (Optional) Build Command: leave blank or use `npm ci` (Render runs install automatically).
6. Add Environment Variables (Render Dashboard → Environment):
   - `MONGO_URL` = your MongoDB connection string
   - `JWT_SECRET` = strong secret
   - `FRONTEND_URLS` = `https://<your-frontend>.vercel.app,http://localhost:5173`
   - `PINECONE_API_KEY`, `GROQ_API_KEY`, `GROQ_EMBEDDING_MODEL`
   - `NODE_ENV` = `production` (optional; Render automatically manages `PORT`)
7. Deploy, then open service URL (e.g., `https://your-backend.onrender.com`).

### 4) Post-deploy verifications
- Visit `https://your-backend.onrender.com/health` → 200.
- Check Render logs for build/boot errors.
- Test an API route (e.g., `GET /api/auth/me` using a token) to ensure `withCredentials`/cookies behave as expected.

---

## Frontend (Vercel) — detailed steps ⚡

### 1) Prepare the repo / code
- Use Vite `VITE_API_URL` env var in code for API base and sockets. Example: in `frontend/src/api/axiosClient.js`:
  ```js
  const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  ```
- Socket initialization should use the same `VITE_API_URL` so socket connects to the backend.
- Ensure `package.json` has `build: vite build` and `preview` scripts.

### 2) Vercel project creation
1. Vercel → New Project → Import repository → select the `frontend` directory as the **root**.
2. Framework Preset: Vite (auto-detect) — if not, set Build Command: `npm install && npm run build`, Output Directory: `dist`.
3. Environment Variables (add BEFORE first build or re-deploy after setting):
   - `VITE_API_URL` = `https://your-backend.onrender.com`
4. Deploy. Wait for build to finish and copy the frontend URL (e.g., `https://your-frontend.vercel.app`).

### 3) Post-deploy verification
- Open the frontend site; check network calls: API calls should go to `https://your-backend.onrender.com/api`.
- Login/register flows should set the `token` cookie (inspect Set-Cookie headers).
- Check browser console for socket logs (connect success/failure). Successful message shows e.g. `✅ SOCKET CONNECTED: <id>`.

---

## Deployment flow & automation (recommended) 🔁
- Enable automatic deploys:
  - Render: Enable auto-deploy on push to selected branch.
  - Vercel: Auto-deploy on pushes/PRs; Vercel will create preview deployments per PR.
- Typical flow: Developer pushes to `main` → CI (optional) builds & tests → Render redeploys backend; Vercel rebuilds frontend using latest env vars.
- Critical note: Vite env var `VITE_API_URL` is _baked into the build_ at compile time. Always set `VITE_API_URL` in Vercel before the build starts.

---

## Key configuration details & gotchas ⚠️

### CORS and WebSockets
- The backend must allow the exact origin of the frontend (protocol included e.g., `https://your-frontend.vercel.app`) in `FRONTEND_URLS` and Socket.io CORS.
- If Socket.io `connect_error` occurs in the browser, check backend logs for `Not allowed by CORS` and add the exact origin to `FRONTEND_URLS`.

### Cookies and auth
- For cross-site cookies to work (Frontend on Vercel, Backend on Render), ensure backend sets cookies with `sameSite: 'none'` and `secure: true` (in production) and that axios uses `withCredentials: true`.
- Browser will only accept `Secure` cookies over HTTPS.

### Environment vars timing
- Set `VITE_API_URL` in Vercel **before** the build; otherwise the static build will contain the previous value.
- Render `PORT` is provided automatically by Render; do not hardcode 3000 in production.

### Embeddings & Vector DB
- Ensure `GROQ_EMBEDDING_MODEL` is set to a model your `GROQ_API_KEY` has access to (test with `test-embed.js`).
- Pinecone index dimension must match the embedding vector length — check both.

---

## Post-deploy checks (quick checklist) ✅
1. Visit frontend and attempt Register → Login.
2. Confirm `Set-Cookie: token=...` appears on login response and cookie flags are correct.
3. Check sockets: open console and confirm socket connects and `ai-message` flows receive `ai-response` back.
4. Check backend logs: confirm embeddings, Pinecone upsert responses and query matches are happening.
5. If memory queries are not returning matches: check Pinecone logs and ensure upserts succeeded (no dimension mismatch, no error during upsert).

---

## Troubleshooting (common problems & fixes) 🛠️

| Symptom | Likely cause | Fix |
|---|---|---|
| Socket connect_error | CORS rejected origin | Add exact frontend origin to `FRONTEND_URLS`, redeploy backend |
| Cookie not set | Missing `SameSite=None; Secure` or using HTTP | Set cookie options in backend; confirm site uses HTTPS |
| Embedding model_not_found | Invalid `GROQ_EMBEDDING_MODEL` or key lacks access | Choose a valid model or request access; test with `test-embed.js` |
| Pinecone upsert fails with dimension error | Embedding length mismatch with index dimension | Recreate index with correct dimension or change embedding model |
| Frontend uses localhost API | `VITE_API_URL` not set at build time | Set `VITE_API_URL` in Vercel and re-deploy (builds are static) |

---

## Optional improvements
- Add a `/health` endpoint and configure Render health check.
- Add a small CI job that runs `npm run build` for both frontend and backend (smoke build) before allowing merge to main.
- Add logs/metrics (e.g., integrate with Sentry, Datadog, or Render/Vercel logs) for monitoring.
- Configure domains and TLS on Vercel/Render and verify HSTS if appropriate.

---

## Example environment values (for reference)
- Backend (Render):
  - MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/olivia
  - JWT_SECRET=REPLACE_WITH_STRONG_SECRET
  - FRONTEND_URLS=https://olivia-tgx5.vercel.app,https://olivia-chatbot.onrender.com,http://localhost:5173
  - PINECONE_API_KEY=your_pinecone_key
  - GROQ_API_KEY=your_groq_key
  - GROQ_EMBEDDING_MODEL=llama-3.1-8b-embedding
- Frontend (Vercel):
  - VITE_API_URL=https://your-backend.onrender.com

---

## Final notes
- Deploy frontend after backend so you can set `VITE_API_URL` to the final backend URL and ensure sockets/cookies work across HTTPS.
- Keep secrets in the Renderer/Vercel environment settings, not in repo files.

---

If you want, I can:
- Add a health-check endpoint and configure Render's health check setting for you, or
- Create a PR that documents these steps and adds a `DEPLOYMENT.md` with scripts and example commands.

Tell me which follow-up you'd like and I’ll proceed. ✨