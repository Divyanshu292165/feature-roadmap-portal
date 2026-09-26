# Deployment Guide — Vercel (frontend) + Render (backend) + Atlas (DB)

This deploys the app for free. Do the steps in order — the backend must exist
first so you know its URL, then the frontend, then you point them at each other.

## 0. One-time prep (locally)
Generate two strong secrets (run twice, copy each result):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Keep them handy — one is `JWT_ACCESS_SECRET`, the other `JWT_REFRESH_SECRET`.

## 1. MongoDB Atlas — allow the host to connect
1. Atlas → your cluster → **Network Access** → **Add IP Address**.
2. Click **Allow access from anywhere** (`0.0.0.0/0`) → **Confirm**.
   (A hosted backend has changing IPs, so this is normal for the free tier.)
3. Have your connection string ready (Atlas → **Connect** → **Drivers**), with the
   real password and `/feature-roadmap` before the `?`.

## 2. Backend → Render
1. Go to https://render.com → sign in with GitHub → **New** → **Web Service**.
2. Pick your `feature-roadmap-portal` repo.
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Instance Type:** Free
4. Add **Environment Variables** (Advanced → Add Environment Variable):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | your Atlas string (with password + `/feature-roadmap`) |
   | `JWT_ACCESS_SECRET` | first generated secret |
   | `JWT_REFRESH_SECRET` | second generated secret |
   | `ACCESS_TOKEN_EXPIRES_IN` | `15m` |
   | `REFRESH_TOKEN_EXPIRES_IN` | `7d` |
   | `BCRYPT_ROUNDS` | `12` |
   | `CLIENT_URL` | `http://localhost:5173` *(temporary — updated in step 4)* |
   *(Leave `PORT` unset — Render provides it.)*
5. **Create Web Service**. When it's live, copy the URL, e.g.
   `https://feature-roadmap-portal.onrender.com`.
6. Test it: open `<that URL>/api/health` — you should see `{"status":"ok","db":"connected"}`.

## 3. Frontend → Vercel
1. Go to https://vercel.com → sign in with GitHub → **Add New** → **Project**.
2. Import the same repo.
3. Settings:
   - **Root Directory:** `client`
   - Framework preset: **Vite** (auto-detected)
4. **Environment Variables** — add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://<your-render-url>.onrender.com/api` |
   *(Must end in `/api`, no trailing slash.)*
5. **Deploy**. Copy the frontend URL, e.g. `https://feature-roadmap-portal.vercel.app`.

## 4. Point the backend at the real frontend (fixes login/cookies)
1. Back in **Render** → your service → **Environment**.
2. Change `CLIENT_URL` to your Vercel URL (e.g. `https://feature-roadmap-portal.vercel.app`)
   — **no trailing slash**.
3. Save — Render redeploys automatically.

This matters: `CLIENT_URL` controls CORS and the login cookie. In production the
refresh-token cookie is sent as `SameSite=None; Secure`, so both sites must be on
HTTPS (Vercel and Render both are) and `CLIENT_URL` must exactly match your frontend.

## 5. Create your admin account (on the live DB)
Because it's a fresh production DB, register your account on the live site first,
then promote it. Easiest: locally point `server/.env` `MONGODB_URI` at Atlas and run
your existing promote script, **or** ask me and I'll give you a one-off command.

## Verify it's working
1. Open the Vercel URL in a **logged-out / private** window → the feed and roadmap load. ✅
2. Click upvote → login modal appears. ✅
3. Register, log in, refresh the page → you stay logged in (cookie works). ✅
4. Submit a feature via the modal → it appears. ✅

## Notes & gotchas
- **Free Render sleeps** after ~15 min idle; the first request then takes ~30–60s to wake.
  The `/api/health` endpoint helps, and you can add an external pinger (e.g. cron-job.org)
  hitting `/api/health` every 10 min to keep both Render and Atlas warm.
- **"Login works but I get logged out on refresh"** → almost always `CLIENT_URL` doesn't
  exactly match the frontend origin, or a trailing slash snuck in. Fix it in Render.
- **CORS error in the browser console** → same cause: `CLIENT_URL` must equal the exact
  Vercel origin.
- Never commit real secrets — they live only in the Render/Vercel dashboards and your
  local `.env` (which is gitignored).
