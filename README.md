# 🏛 JanSeva AI — Civic Services Platform

> AI-powered public access platform that helps Indian citizens discover government welfare schemes and raise civic complaints with ease.

[![Live Demo](https://img.shields.io/badge/Live-jansewaai.vercel.app-blue?style=for-the-badge)](https://jansewaai.vercel.app)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **JanKhabar** 🔎 | Discover 100+ government welfare schemes with AI-powered semantic search |
| **JanSamasya** 🛠 | Step-by-step civic complaint wizard with photo upload, geolocation & AI review |
| **AI Chat** 🤖 | RAG-augmented conversational AI (Gemini) for scheme eligibility & complaint drafting |
| **Track Complaints** 📊 | Monitor complaint status with detailed timelines |
| **Bilingual** 🌐 | Full English & Hindi support throughout the platform |
| **Profile & Notifications** 👤🔔 | User preferences, activity history & notification center |

---

## 🛠 Tech Stack

- **Frontend**: React 19 + Vite 7 (JavaScript)
- **Styling**: Vanilla CSS with design tokens (Inter font, custom color palette)
- **AI**: Google Gemini 2.0 Flash Lite via `@google/generative-ai`
- **Search**: Custom TF-IDF RAG engine for semantic scheme search
- **Backend**: Express.js (local dev) / Vercel Serverless Functions (production)
- **Routing**: React Router v7
- **i18n**: Custom context-based EN/HI translations
- **Deployment**: Vercel

---

## 📁 Project Structure

```
aws/
├── api/                    # Vercel Serverless API functions
│   ├── _data.js            # Shared data loader + RAG engine
│   ├── chat.js             # POST /api/chat — AI chat (streaming SSE)
│   ├── schemes.js          # GET  /api/schemes — List/filter schemes
│   ├── schemes/[id].js     # GET  /api/schemes/:id — Single scheme
│   ├── search.js           # GET  /api/search — RAG semantic search
│   ├── filters.js          # GET  /api/filters — Available filter options
│   └── health.js           # GET  /api/health — Health check
├── server/                 # Express backend (local development)
│   ├── index.js            # Express server with all API routes
│   ├── rag.js              # RAG search engine
│   ├── scraper.js          # Scheme data scraper
│   ├── generate-schemes.js # Scheme data generator
│   ├── data/
│   │   └── schemes.json    # 100+ government schemes dataset
│   └── package.json
├── src/                    # React frontend
│   ├── components/         # Header, Sidebar, AIChat
│   ├── context/            # ComplaintContext, LanguageContext
│   ├── i18n/               # EN/HI translations
│   ├── pages/              # Home, JanKhabar, JanSamasya, SchemeDetail,
│   │                       # TrackComplaints, Profile, Notifications
│   ├── App.jsx             # Root component with routing
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles & design system
├── index.html              # HTML entry point
├── vite.config.js          # Vite config (proxy /api → localhost:3001)
├── vercel.json             # Vercel deployment config
└── package.json            # Frontend dependencies
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **Gemini API Key** — Get one free at [Google AI Studio](https://aistudio.google.com/apikey)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 2. Configure Environment

Create `server/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

### 3. Run Locally

Open **two terminals**:

```bash
# Terminal 1 — Backend (Express + RAG)
cd server
npm start
# → http://localhost:3001

# Terminal 2 — Frontend (Vite dev server)
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api` requests to the Express backend automatically.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/schemes` | List schemes (filters: `category`, `target`, `state`, `page`, `limit`) |
| `GET` | `/api/schemes/:id` | Get single scheme details |
| `GET` | `/api/search?q=...` | RAG-based semantic search |
| `GET` | `/api/filters` | Available categories, targets, states |
| `POST` | `/api/chat` | AI chat with streaming SSE response |
| `GET` | `/api/health` | Server health check |

---

## 🌐 Deployment (Vercel)

The project is pre-configured for [Vercel](https://vercel.com):

1. Push to GitHub
2. Import into Vercel
3. Set `GEMINI_API_KEY` in Vercel Environment Variables
4. Deploy — the `api/` folder is auto-detected as serverless functions

---

## 📄 License

This project is open-source and available for educational use.
