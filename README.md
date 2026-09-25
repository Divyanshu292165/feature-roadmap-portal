# Feature Request & Public Roadmap Portal

A production-quality, full-stack customer feedback platform built with React, Node.js, MongoDB, and TypeScript. Users can submit feature requests, vote, comment, and view a public Kanban roadmap. Admins can moderate, change statuses, and manage the roadmap.

---

## 🚀 Features

- **Feature Requests** — Submit, search, filter, and sort feature requests
- **Voting System** — Atomic vote/unvote with duplicate prevention (MongoDB compound unique index)
- **Comments** — Threaded comments with 1-level replies, edit/delete own, admin moderation
- **Public Roadmap** — 3-column Kanban board (Planned / In Progress / Completed)
- **Authentication** — JWT access + refresh tokens, httpOnly cookies, token rotation, email verification simulation, password reset simulation
- **Admin Dashboard** — Stats overview, feature moderation, status management, comment deletion
- **Search** — Debounced MongoDB text search
- **Filtering** — By category, status, with URL-synced query params
- **Optimistic UI** — Vote updates immediately, rolls back on failure
- **Loading/Empty/Error States** — Every async operation has proper UX

---

## 🛠 Tech Stack

### Frontend
| Tool | Purpose |
|------|---------|
| React 18 + Vite | UI framework + bundler |
| TypeScript | Static typing |
| React Router v6 | Client-side routing |
| TanStack Query v5 | Server state management |
| React Hook Form + Zod | Form handling + validation |
| Tailwind CSS v4 | Utility-first styling (CSS-first config via `@theme`) |
| Coss UI (`coss.com/ui`) | Design system / component primitives |
| Base UI (`@base-ui/react`) | Headless, accessible component behavior |
| class-variance-authority | Type-safe styling variants |
| Lucide React | Icons |
| React Hot Toast | Notifications |
| react-markdown + dompurify | Safe markdown rendering |
| date-fns | Date formatting |

> **UI components** live in [`client/src/components/ui/coss/`](client/src/components/ui/coss) (authentic Coss UI primitives) with thin wrappers in `client/src/components/ui/` that expose the app's own prop API. See [UI / Design System](#-ui--design-system) below for details and rationale.

### Backend
| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Static typing |
| MongoDB + Mongoose | Database + ODM |
| JWT | Access + refresh tokens |
| bcryptjs | Password hashing |
| Helmet + CORS | Security headers |
| express-rate-limit | Rate limiting |
| Zod | Request validation |
| cookie-parser | httpOnly cookie handling |

---

## 📁 Architecture

```
Com Bot/                         # Project root
├── client/                      # React frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── ui/              # App primitives (Button, Badge, Modal, Input, ...)
│   │   │   │   └── coss/         # Coss UI source primitives (Base UI + Tailwind v4)
│   │   │   ├── layout/          # Navbar, AdminSidebar, MainLayout, AdminLayout
│   │   │   ├── features/        # FeatureCard, FeatureForm, VoteButton, SearchBar, FilterBar
│   │   │   ├── comments/        # CommentSection, CommentItem, CommentForm
│   │   │   ├── roadmap/         # KanbanBoard, RoadmapCard
│   │   │   └── auth/            # LoginModal
│   │   ├── pages/               # Route-level page components
│   │   │   └── admin/           # AdminDashboard, AdminFeatures, AdminComments
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # useVote, useFeatures, useComments, useDebounce
│   │   ├── lib/                 # api.ts (fetch client), utils.ts
│   │   └── types/               # Shared TypeScript interfaces
│   └── package.json
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── config/              # db.ts, env.ts
│   │   ├── models/              # User, FeatureRequest, Comment, Vote, RefreshToken
│   │   ├── middleware/          # auth.ts, errorHandler.ts, rateLimiter.ts
│   │   ├── validators/          # Zod schemas for auth, features, comments
│   │   ├── controllers/         # auth, feature, vote, comment, roadmap, admin
│   │   ├── routes/              # auth, feature, comment, roadmap, admin routes
│   │   ├── services/            # auth.service.ts, email.service.ts
│   │   └── utils/               # asyncHandler, apiResponse, tokens
│   ├── scripts/
│   │   └── seed.ts              # Database seeder
│   ├── tests/                   # Jest + Supertest tests
│   └── package.json
│
├── package.json                 # Root (concurrently scripts)
├── .gitignore
└── README.md
```

---

## 🎨 UI / Design System

The frontend is built on **[Coss UI](https://coss.com/ui)** — Cal.com's open design system (the evolution of Origin UI). Coss UI ships components as source (shadcn-style registry) rather than as an opaque npm package, so the primitives live directly in the repo at [`client/src/components/ui/coss/`](client/src/components/ui/coss) and can be read and tuned.

Coss UI is built on two foundations, both used here:

| Layer | Library | Why |
|-------|---------|-----|
| **Behavior** | [Base UI](https://base-ui.com) (`@base-ui/react`) | Headless, fully accessible primitives (focus management, ARIA, keyboard nav) for `Select`, `Dialog`, `Field`, `Input`, `ScrollArea`. Maintained by the MUI team; supports React 18. We don't hand-roll accessibility. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) | Coss UI's tokens target v4's CSS-first engine (`@theme`, `@custom-variant`, `color-mix()`, `--alpha()`). Config lives in [`client/src/index.css`](client/src/index.css) — no `tailwind.config.js`/`postcss.config.js` needed. |
| **Variants** | [class-variance-authority](https://cva.style) | Type-safe, declarative component variants (e.g. button `variant`/`size`), the pattern Coss UI's source uses. |

**Why Coss UI over rolling our own or a heavier kit (MUI/AntD):**
- **Accessibility for free** — Base UI handles the hard parts (dialog focus traps, listbox semantics, typeahead) correctly.
- **Own the code** — components are in-repo source, so there's no version lock-in and styling is fully controllable via Tailwind tokens.
- **Consistent theming** — a single token layer (light/dark) drives every component; the app ships a cohesive look with light/dark support.

**Wrapper pattern:** each file in `client/src/components/ui/` (e.g. `Button.tsx`, `Select.tsx`, `Modal.tsx`) is a thin adapter that composes the matching `coss/` primitive while exposing the app's own prop API (`isLoading`, semantic `Badge` variants like `status_planned`, a convenience `Select` with an `options` array, etc.). This keeps call sites stable and isolates the design system behind one boundary.

---

## 📋 Prerequisites

- **Node.js** v18+ (v20 recommended)
- **MongoDB** running locally on port 27017  
  → [Install MongoDB Community](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **npm** v9+

---

## 🗄 MongoDB Setup

### Option 1: Local MongoDB
```bash
# Install and start MongoDB (macOS with Homebrew)
brew install mongodb-community
brew services start mongodb-community

# On Windows: Start MongoDB from Services or run:
mongod --dbpath C:\data\db
```

### Option 2: MongoDB Atlas (Cloud)
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Add it to `server/.env` as `MONGODB_URI`

---

## ⚙️ Environment Variables

### Server (`server/.env`)

Copy the example and fill in values:
```bash
cp server/.env.example server/.env
```

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/feature-roadmap
JWT_ACCESS_SECRET=your_access_secret_change_me_in_production_32chars
JWT_REFRESH_SECRET=your_refresh_secret_change_me_in_production_32chars
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
BCRYPT_ROUNDS=12
```

> **Security**: Never use the default secrets in production. Generate secure random strings:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### Frontend (`client/.env`)

```bash
cp client/.env.example client/.env
```

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔧 Installation

### 1. Install all dependencies at once:
```bash
npm run install:all
```

Or install separately:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

---

## 🏃 Running the Application

### Development (both frontend + backend)
```bash
npm run dev
```

This starts:
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### Run separately:
```bash
# Backend only
npm run dev:server

# Frontend only
npm run dev:client
```

---

## 🌱 Seeding the Database

Populate the database with sample data:
```bash
npm run seed
```

This creates:
- **Admin user**: `admin@example.com` / `Admin@123!`
- **Demo user**: `user@example.com` / `User@123!`
- **8 feature requests** across all statuses (UNDER_REVIEW, PLANNED, IN_PROGRESS, COMPLETED)
- **Votes** on several features
- **Comments** with replies

---

## 🧪 Running Tests

```bash
npm run test
```

> **Note**: Tests require a running MongoDB instance. They use a separate database: `feature-roadmap-test`

### Test Coverage
- ✅ Auth: register, login, duplicate prevention, password validation, token, refresh, logout
- ✅ Features: create, list, search, filter, status management, authorization
- ✅ Voting: vote, duplicate vote prevention (returns 409), vote removal, multi-user voting, concurrent safety
- ✅ Comments: creation increments commentCount, deletion decrements, authorization

---

## 🔐 Authentication Flow

```
1. Register → POST /api/auth/register
   → Creates user (unverified)
   → Simulated email: verification URL logged to server console
   → URL: http://localhost:5173/verify-email?token=<token>

2. Verify Email → GET /api/auth/verify-email/:token
   → Marks user as verified

3. Login → POST /api/auth/login
   → Returns access token (15 min) in response body
   → Sets refresh token (7 days) in httpOnly cookie

4. Token Refresh → POST /api/auth/refresh
   → Reads refresh token from cookie
   → Issues new access + refresh token (rotation)
   → Invalidates old refresh token

5. Logout → POST /api/auth/logout
   → Revokes refresh token in DB
   → Clears cookie

6. Forgot Password → POST /api/auth/forgot-password
   → Simulated email: reset URL logged to server console
   → URL: http://localhost:5173/reset-password?token=<token>

7. Reset Password → POST /api/auth/reset-password/:token
   → Validates token, updates password
   → Revokes all existing refresh tokens for user
```

**Security design:**
- Access tokens stored in **memory only** (never localStorage)
- Refresh tokens stored as **SHA-256 hashes** in MongoDB
- Refresh token **rotation** on every use
- httpOnly cookies prevent JavaScript access to refresh tokens

---

## 📡 API Overview

### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/verify-email/:token
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
```

### Feature Requests
```
GET    /api/feature-requests          # List (search, filter, sort, paginate)
POST   /api/feature-requests          # Create (auth required)
GET    /api/feature-requests/:id      # Single feature (hasVoted for auth users)
PATCH  /api/feature-requests/:id      # Update (owner or admin)
DELETE /api/feature-requests/:id      # Delete (admin only)
```

### Voting
```
POST   /api/feature-requests/:id/vote    # Vote (auth, duplicate → 409)
DELETE /api/feature-requests/:id/vote    # Remove vote (auth)
```

### Comments
```
GET    /api/feature-requests/:id/comments   # List (nested, with replies)
POST   /api/feature-requests/:id/comments   # Create (auth)
PATCH  /api/comments/:id                     # Update (owner or admin)
DELETE /api/comments/:id                     # Delete (owner or admin)
```

### Roadmap
```
GET /api/roadmap    # Public, returns features grouped by status
```

### Admin (require ADMIN role)
```
GET    /api/admin/stats
GET    /api/admin/feature-requests
PATCH  /api/admin/feature-requests/:id/status
DELETE /api/admin/feature-requests/:id
GET    /api/admin/comments
DELETE /api/admin/comments/:id
```

---

## 👤 Admin Setup

After seeding (`npm run seed`), the admin account is:
- **Email**: `admin@example.com`  
- **Password**: `Admin@123!`

To make any existing user an admin, run in the MongoDB shell:
```js
db.users.updateOne({ email: "user@example.com" }, { $set: { role: "ADMIN" } })
```

The admin UI is accessible at `/admin` after logging in with an admin account.

---

## 🌐 Frontend Routes

| Path | Page | Access |
|------|------|--------|
| `/` | Feature feed | Public |
| `/features` | Feature list | Public |
| `/features/new` | Submit feature | Auth required |
| `/features/:id` | Feature detail | Public (vote/comment requires auth) |
| `/roadmap` | Public Kanban roadmap | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/forgot-password` | Forgot password | Public |
| `/reset-password` | Reset password | Public |
| `/verify-email` | Email verification | Public |
| `/admin` | Admin dashboard | Admin only |
| `/admin/features` | Feature management | Admin only |
| `/admin/comments` | Comment moderation | Admin only |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Import in [vercel.com](https://vercel.com)
3. Set root directory: `client`
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com/api`

### Backend → Render

1. Create a new Web Service on [render.com](https://render.com)
2. Set root directory: `server`
3. Build command: `npm install && npm run build`
4. Start command: `node dist/server.js`
5. Add all environment variables from `server/.env.example`
6. Set `NODE_ENV=production`, `CLIENT_URL=https://your-frontend.vercel.app`

### MongoDB → Atlas
1. Create cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist Render's IP (or use 0.0.0.0/0 for all)
3. Set `MONGODB_URI` to your Atlas connection string

---

## 🔒 Security Notes

- **Passwords** are hashed with bcrypt (12 rounds)
- **Refresh tokens** are hashed (SHA-256) before storage
- **Duplicate votes** prevented by MongoDB compound unique index + duplicate key error (11000)
- **Rate limiting** on auth endpoints (10 req / 15 min)
- **Helmet** sets secure HTTP headers
- **CORS** configured to allow only `CLIENT_URL`
- **httpOnly cookies** prevent JS access to refresh tokens
- **Zod** validates all incoming request bodies/params
- **Input sanitization**: Markdown rendered via `react-markdown` + `dompurify` to prevent XSS
- **Role validation** always happens server-side; client role claims are ignored
- **Environment variables** are validated on startup; app exits if required vars are missing

---

## 🏗 Build

```bash
# Build both
npm run build

# Build server only
cd server && npm run build

# Build client only
cd client && npm run build
```

---

## 📧 Email Simulation

No real email provider is needed. In development mode, verification and reset URLs are printed to the server console:

```
[EMAIL SIMULATION] To: user@example.com
Subject: Verify your email
Verification URL: http://localhost:5173/verify-email?token=abc123...

[EMAIL SIMULATION] To: user@example.com
Subject: Reset your password
Reset URL: http://localhost:5173/reset-password?token=xyz789...
```

Copy the URL from the console and open it in your browser.

---

## ⚠️ Known Limitations / Design Decisions

1. **Chunk size warning**: The frontend bundle is ~767KB minified (~240KB gzipped). Code-splitting with `React.lazy()` would reduce the initial payload in a future iteration.

2. **Email simulation**: No real email is sent. URLs are console-logged. For production, integrate SendGrid, Resend, or AWS SES.

3. **Trending sort**: Implemented as `voteCount DESC, createdAt DESC`. A true trending algorithm (weighted by recency) is a future enhancement.

4. **File uploads**: Not implemented. Feature request images/attachments would require S3 or similar.

5. **WebSocket/real-time**: Roadmap and comments are not real-time. They use TanStack Query's stale-time to periodically refresh. True real-time would require Socket.io.

6. **Vote collection architecture**: Used a dedicated `Vote` collection with compound unique index `{ user, featureRequest }` for the strongest concurrency guarantees, rather than embedding voter IDs in the feature document.
