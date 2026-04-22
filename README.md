# B.L.A.S.T. Sovereign Starter Pack

Autonomous agent loop + scrollytelling landing page + live command-center dashboard. Drop-in foundation for solo operators building AI-powered lead-gen and product sites.

## What's in the box

| File / Folder           | Purpose                                                       |
|-------------------------|---------------------------------------------------------------|
| `agent_loop.py`         | Main autonomous agent — reads `.env`, runs continuous cycles  |
| `requirements.txt`      | Python deps (discord.py, openai, anthropic, supabase, etc.)   |
| `.env.example`          | Copy to `.env` and fill in your keys                          |
| `kings-swag-landing/`   | Next.js 14 landing page + dashboard (scrollytelling + live)   |

## Quick start

### A. Python agent loop

```bash
# 1. Create a virtualenv (optional but recommended)
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate   # macOS/Linux

# 2. Install deps
pip install -r requirements.txt

# 3. Configure
copy .env.example .env      # Windows
# cp .env.example .env      # macOS/Linux
# ...then open .env and fill in your API keys

# 4. Run
python agent_loop.py
```

### B. Next.js landing page + dashboard

```bash
cd kings-swag-landing
npm install
npm run dev
```

- Site: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard

**Node version:** Use Node LTS **v22** from nodejs.org. Node 25.x has a known OpenSSL bug on Windows that breaks `npm install`.

See `kings-swag-landing/SETUP.md` for full frontend details (endpoints, sequence frames, deploy targets).

## Architecture

```
┌──────────────────────────────────────────────┐
│  agent_loop.py                               │
│  ↕ (reads .env)                              │
│  ├─ LLM providers (OpenAI, Claude, etc.)     │
│  ├─ Discord / Telegram / Slack notifiers     │
│  └─ Supabase / Pinecone / Qdrant memory      │
└──────────────────┬───────────────────────────┘
                   │ polls /api/*
                   ▼
┌──────────────────────────────────────────────┐
│  kings-swag-landing (Next.js 14)             │
│  ├─ / ............ scrollytelling sales page │
│  └─ /dashboard ... live command center       │
└──────────────────────────────────────────────┘
```

The landing page is fully standalone — it will run with zero backend (widgets degrade to empty states). The agent loop is fully standalone — it runs without the frontend.

## Configuration

Every service is optional. `agent_loop.py` skips any provider whose key is left as `YOUR_*_HERE` or is missing. Fill in only what you need for your use case.

Minimum viable setup:
- `ANTHROPIC_API_KEY` or `OPENAI_API_KEY` (for the brain)
- `DISCORD_BOT_TOKEN` + `DISCORD_CHANNEL_ID` (for notifications)

## Deploy

### Frontend (Vercel — easiest)
```bash
cd kings-swag-landing
npx vercel
```

### Frontend (static export to any host)
Add `output: 'export'` to `next.config.mjs`, then:
```bash
npm run build
# static files land in kings-swag-landing/out/
```

### Agent loop (always-on host)
Any Linux VPS or a Windows machine with Python 3.10+. Point it at your `.env` and run `python agent_loop.py` under a process manager (systemd, pm2, nssm).

## License

Included per your Gumroad purchase. Personal and commercial use permitted. Do not resell the source as-is.

## Support

Issues / feature requests / feedback: reply to your Gumroad receipt or reach out via the creator's contact info on the product page.
