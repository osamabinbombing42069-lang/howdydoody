# 🤖 Gemini AI Assistant

A clean, multi-tool AI assistant powered by **Google Gemini 1.5 Flash**. Chat, summarize, generate/explain/fix code, analyze images, and translate — all in one beautiful interface.

## ✨ Features

- 💬 **Chat** — Full conversational memory across messages
- 📝 **Summarize** — Brief, bullets, or detailed summaries
- 💻 **Code** — Generate, explain, or debug code in 10+ languages with syntax highlighting
- 🖼️ **Vision** — Upload images and ask Gemini anything about them
- 🌍 **Translate** — Translate to 20+ languages
- 📖 **Markdown rendering** throughout

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone or download this project
git clone <your-repo-url>
cd gemini-assistant

# 2. Install dependencies
npm install

# 3. Add your API key
cp .env.example .env
# Edit .env and set GEMINI_API_KEY=your_key_here

# 4. Start
npm start
# → http://localhost:3000
```

---

## ☁️ Deploy

### Railway (Recommended — easiest)
1. Push to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add environment variable: `GEMINI_API_KEY` = your key
4. Done — Railway auto-detects Node.js and uses `railway.toml`

### Render
1. Push to GitHub
2. Go to [render.com](https://render.com) → New → Web Service → Connect repo
3. Render reads `render.yaml` automatically
4. Add env var `GEMINI_API_KEY` in the Render dashboard
5. Build command: `npm install` | Start command: `npm start`

### Replit
1. Go to [replit.com](https://replit.com) → Create Repl → Import from GitHub (or upload zip)
2. In Replit Secrets, add `GEMINI_API_KEY`
3. Click **Run** — `.replit` file handles everything

### CodeSandbox
1. Upload the project or import from GitHub
2. Open a terminal: `npm install && npm start`
3. Add `GEMINI_API_KEY` to the environment variables panel
4. The `.devcontainer/devcontainer.json` auto-configures the environment

### Heroku
```bash
heroku create your-app-name
heroku config:set GEMINI_API_KEY=your_key_here
git push heroku main
```

### Fly.io
```bash
fly launch
fly secrets set GEMINI_API_KEY=your_key_here
fly deploy
```

### Vercel / Netlify
> ⚠️ These platforms are for static sites only. This project needs a Node.js server. Use Railway, Render, or Fly.io instead.

---

## 🔐 Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API key (required) |
| `PORT` | Server port (default: 3000) |

**Never commit your `.env` file or API key to Git.** The `.gitignore` already excludes it.

---

## 🗂️ Project Structure

```
gemini-assistant/
├── server.js          # Express backend + Gemini API routes
├── public/
│   └── index.html     # Full frontend (single file — no build step!)
├── package.json
├── .env               # Your secrets (gitignored)
├── .env.example       # Template for others
├── railway.toml       # Railway config
├── render.yaml        # Render config
├── .replit            # Replit config
├── Procfile           # Heroku / fallback
└── .devcontainer/     # CodeSandbox / VS Code devcontainer
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/chat` | Chat with conversation history |
| POST | `/api/summarize` | Summarize text |
| POST | `/api/code` | Generate / explain / fix code |
| POST | `/api/vision` | Analyze uploaded image |
| POST | `/api/translate` | Translate text |
| GET  | `/api/health` | Health check |

---

## 📝 License
MIT
