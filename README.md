# Live Commerce Platform

This project is a simple live commerce app. It lets hosts show products in real time, and lets viewers react and ask questions. It has a React frontend and a Node.js/Express backend with Socket.io and MongoDB. Admins can create products, run live sessions, highlight a product, and see basic live analytics (viewer counts, reactions, questions). The analytics page also has an “Ask AI” button that gives a short summary of how the session is going based on reactions and questions.

## Tech Stack

- Frontend: React 19, Vite, Tailwind CSS 4, React Router
- Backend: Node.js 18+, Express 5
- WebSockets: Socket.io 4
- Database: MongoDB (Mongoose 8)
- Auth: JWT (stateless, stored client-side)
- Generative AI: Google Gemini (server-side REST)

## Repository Structure

```
live-commerce-platform/
  client/           # React app (Vite + Tailwind)
  server/           # Express API + Socket.io + MongoDB models
  .gitignore
  README.md    
```

## Core Features

- Admin
  - Create/manage products
  - Start/end live sessions
  - Highlight a product during the stream (persists; synced to all viewers)
- Viewer
  - Join current live session
  - See product list and highlighted product in real-time
  - Send reactions (like/love/fire/clap/wow/laugh/best/disagree/angry/cry)
  - Submit questions and see answers live
- Live Analytics
  - Real-time viewer count and peak viewers
  - Reaction and question counts
- AI
  - One-click “Ask AI” session summary (audience mood)

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


### 1) Server setup

Create `server/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/live-commerce
JWT_SECRET=supersecret
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
# Optional (required for AI features)
GEMINI_API_KEY=your_gemini_api_key
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
- Sessions:
  - Public: `GET /sessions`, `GET /sessions/:id`, `GET /sessions/live/current`
  - Admin: `POST /sessions`, `PUT /sessions/:id`, `PUT /sessions/:id/start`, `PUT /sessions/:id/end`, `DELETE /sessions/:id`
  - Session data: `GET /sessions/:id/questions`, `GET /sessions/:id/reactions`
- Analytics:
  - `GET /analytics/session/:id`
  - `GET /analytics/session/:id/realtime`
  - `POST /analytics/session/:id/insight` (AI summary)

- Socket.io CORS is configured to allow `CLIENT_URL`


## Improvements

1) Add video streaming integration (right now it is a placeholder).
2) Let viewers add products to cart during a live session (button is dummy now).
3) More AI insight: allow AI to also answer viewer questions.