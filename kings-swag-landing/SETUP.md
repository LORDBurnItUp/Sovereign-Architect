# B.L.A.S.T. Sovereign Starter Pack — Setup

A Next.js 14 scrollytelling landing page + command-center dashboard, wired with Framer Motion, GSAP, Tailwind, and live-polling agent widgets.

## 1. Prerequisites

- **Node.js LTS v22** (get it at https://nodejs.org)
  *Do not use Node 25.x — a known OpenSSL bug on Windows breaks `npm install`.*
- npm (bundled with Node)

Verify:
```bash
node --version   # should print v22.x.x
npm --version
```

## 2. Install

From this folder:
```bash
npm install
```

## 3. Run the dev server

```bash
npm run dev
```

Open http://localhost:3000 — the scrollytelling site.
Dashboard: http://localhost:3000/dashboard

## 4. Optional: wire the live data

The dashboard polls these endpoints (defaults baked in as `http://localhost:5050/api/...`):

| Widget          | Endpoint                  | Shape                                                      |
|-----------------|---------------------------|------------------------------------------------------------|
| RevenueTicker   | `/api/revenue_ticker`     | `{ roi, cvr, profit, deployments }`                        |
| AgentHive       | `/api/agent_hive`         | `[{ id, status }]`                                         |
| MoneyStream     | `/api/logs`               | `{ lines: string[] }`                                      |

All fetches are wrapped in try/catch — the UI degrades gracefully if the backend isn't running.

To change the backend URL, search for `localhost:5050` in `components/` and `app/dashboard/page.tsx`.

## 5. Drop in your scroll sequence frames (optional)

`components/SequenceCanvas.tsx` expects 120 frames at:
```
public/sequence/frame_0.webp
public/sequence/frame_1.webp
...
public/sequence/frame_119.webp
```

Any 16:9 exported image sequence works. Without frames, the canvas stays blank (no errors).

Sound effects are loaded from `public/sounds/` (optional — missing files are silent).

## 6. Production build

```bash
npm run build
npm start
```

## 7. Deploy

Works out of the box on Vercel (`vercel deploy`), Netlify, or any Node host. For static-only hosting (Hostinger, SFTP), add `output: 'export'` to `next.config.mjs` and run `npm run build` — static files land in `out/`.

## License

Included per your Gumroad purchase. Use for personal and commercial projects. Do not resell the source as-is.
