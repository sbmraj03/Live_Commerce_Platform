# Live Commerce Platform

Minimal yet functional live commerce feature enabling real-time product showcases, reactions, and Q&A between hosts and viewers.

## Overview

This monorepo contains a React frontend (Vite + Tailwind CSS) and a Node.js/Express backend using Socket.io and MongoDB. Admins can create products and run live sessions. Viewers can join a live session, see highlighted products in real-time, send reactions, and submit questions. The system tracks live analytics (viewer counts, reactions, questions).

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS 4, React Router
- Backend: Node.js 18+, Express 5
- WebSockets: Socket.io 4
- Database: MongoDB (Mongoose 8)
- Auth: JWT (stateless, stored client-side)

## Repository Structure

```
live-commerce-platform/
  client/           # React app (Vite + Tailwind)
  server/           # Express API + Socket.io + MongoDB models
  backend/          # Legacy scaffold (no app code used)
  .gitignore
  README.md         # You are here
```

## Core Features

- Admin
  - Create/manage products
  - Start/end live sessions
  - Highlight a product during the stream (persists; synced to all viewers)
- Viewer
  - Join current live session
  - See product list and highlighted product in real-time
  - Send reactions (like/love/fire/clap/wow/laugh)
  - Submit questions and see answers live
- Live Analytics
  - Real-time viewer count and peak viewers
  - Reaction and question counts

## Realtime Events (Socket.io)

- Session lifecycle
  - `join:session` → join room; server replies `session:joined` and emits `viewers:update`
  - `leave:session` → updates `viewers:update`
  - `session:started` (broadcast) and `session:ended` (room)
- Reactions
  - `reaction:send` → server persists and emits `reaction:new`
- Questions
  - `question:send` → server persists and emits `question:new`
  - `question:answer` → server updates and emits `question:answered`
  - `question:like` → server updates and emits `question:liked`
- Product highlight
  - Admin emits `product:highlight` with `{ sessionId, productId|null }`
  - Server persists on `Session.highlightedProduct` and emits `product:highlighted`

## Data Model (MongoDB)

- `Product`: name, description, price, image, category, stock, isActive
- `Session`: title, description, products[], highlightedProduct, status (scheduled/live/ended), start/end, hostName, viewerCount, peakViewers, totals
- `Reaction`: sessionId, type, userId, userName
- `Question`: sessionId, question, userId, userName, isAnswered, answer, likes
- `User`: name, email, password (hashed), role (admin/viewer), isActive

## Getting Started

Prerequisites: Node.js 18+, MongoDB 6+, pnpm/npm, and two terminals.

### 1) Server setup

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/live-commerce
JWT_SECRET=supersecret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Install & run:

```
cd server
npm install
npm run dev
```

Seed data (optional):

```
npm run seed:admin      # admin@livecommerce.com / admin123
npm run seed            # sample products + one scheduled session
```

### 2) Client setup

Create `client/.env` (or `.env.local`):

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

Install & run:

```
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## How to Use

1) Seed an admin and login at `/login` with admin credentials.
2) Create products and a session in the Admin area.
3) Start the session; viewers can join `/viewer`.
4) Admin can highlight a product; viewers see it turn yellow instantly.
5) Viewers send reactions and questions; admin can answer questions.

## API Overview

Base URL: `${API_URL}/api`

- Auth: `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/password`
- Products: `GET /products`, `GET /products/:id`, `GET /products/category/:category`, (admin) `POST/PUT/DELETE`
- Sessions:
  - Public: `GET /sessions`, `GET /sessions/:id`, `GET /sessions/live/current`
  - Admin: `POST /sessions`, `PUT /sessions/:id`, `PUT /sessions/:id/start`, `PUT /sessions/:id/end`, `DELETE /sessions/:id`
  - Session data: `GET /sessions/:id/questions`, `GET /sessions/:id/reactions`

Friendly error handling returns `{ success: false, error: string }` with HTTP codes.

## Frontend Highlights

- `ViewerPage` composes live viewer header, product showcase, reactions, and Q&A.
- `ProductsShowcase` subscribes to `product:highlighted` and renders the highlighted product with yellow background.
- `LiveSessionViewer` shows live badge and viewer/peak counts via `viewers:update`.
- `ReactionsPanel` emits `reaction:send` and streams `reaction:new`.
- `QuestionsPanel` fetches history and updates via `question:new`, `question:answered`, `question:liked`.

## Backend Highlights

- `SocketService` manages room joins/leaves, viewer counts, and all realtime events.
- Product highlight persists on the `Session` document, preventing client auto-reset.
- Clean separation of controllers, models, routes, and middleware with helpful indexes.

## Deployment

- Frontend: Vercel/Netlify (build with `npm run build` in `client/`)
- Backend: Render/Railway/Heroku/VM
  - Set `CLIENT_URL` to your deployed frontend origin
  - Set `MONGO_URI`, `JWT_*`, and open port
- Socket.io CORS is configured to allow `CLIENT_URL` and `http://127.0.0.1:3000` (adjust in `server/src/server.js`).

## Demo Checklist

- Record a 2–5 minute video covering:
  - Admin login, start session, highlight product
  - Viewer join, live highlight, reactions, questions
  - Live counts and quick technical walk-through

## Improvements

- Authentication UI polish; password reset flow
- Persist reactions/questions in analytics aggregates
- Moderation and spam control in Q&A
- Video streaming integration (currently a placeholder)
- Better admin dashboards and product management UX
- E2E tests and CI workflows

## Innovation Ideas

- AI product summaries and Q&A suggestions
- Sentiment analysis over reactions/questions
- Personalized recommendations during live sessions

---



