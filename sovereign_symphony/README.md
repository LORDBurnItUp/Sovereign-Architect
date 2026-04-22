# Sovereign Symphony

Nine Discord generals, each with their own identity + ElevenLabs voice, orchestrated by a global **no-overlap queue**. Exposes a FastAPI surface at `:5055` that the Next.js dashboard proxies at `/api/symphony/*`.

## Roster (9)

| Slug                 | Rank     | Division        | Token env                               |
|----------------------|----------|-----------------|-----------------------------------------|
| `overlord`           | Sovereign| High Command    | `DISCORD_BOT_TOKEN_OVERLORD`            |
| `hermes`             | General  | Comms           | `DISCORD_BOT_TOKEN_HERMES`              |
| `douglas`            | General  | Strategic Ops   | `DISCORD_BOT_TOKEN_DOUGLAS`             |
| `sentinel`           | General  | Intel           | `DISCORD_BOT_TOKEN_SENTINEL`            |
| `khan`               | Colonel  | Operations      | `DISCORD_BOT_TOKEN_KHAN`                |
| `travis`             | Colonel  | Acquisition     | `DISCORD_BOT_TOKEN_TRAVIS`              |
| `aureus`             | Colonel  | Finance         | `DISCORD_BOT_TOKEN_AUREUS`              |
| `openclaw_infra`     | Warden   | Infrastructure  | `DISCORD_BOT_TOKEN_OPENCLAW_INFRA`      |
| `openclaw_strategy`  | Warden   | Strategy        | `DISCORD_BOT_TOKEN_OPENCLAW_STRATEGY`   |

## Run

```
start_symphony.bat            REM from the project root
```

or:

```
python -m sovereign_symphony.main
```

## Ports

| Port  | Service                          |
|-------|----------------------------------|
| 3020  | Next.js dashboard (kings-swag)   |
| 5055  | Sovereign Symphony FastAPI       |
| 5050  | Existing dashboard API (unchanged)|

## Smoke test sequence

1. **Text only.** `curl -X POST http://127.0.0.1:5055/symphony/speak -H 'content-type: application/json' -d '{"general":"hermes","text":"testing one two"}'`
   → HERMES should post an embed + MP3 attachment in the war room channel.
2. **Queue / no-overlap.** Fire three in a row:
   ```
   curl -X POST .../speak -d '{"general":"hermes","text":"first"}'
   curl -X POST .../speak -d '{"general":"douglas","text":"second"}'
   curl -X POST .../speak -d '{"general":"sentinel","text":"third"}'
   ```
   → all three land; queue serializes.
3. **Broadcast.** `curl -X POST .../broadcast -d '{"text":"all hands report"}'`
   → every live general posts in turn.

## Two playback modes

**MP3 attachment (default, no ffmpeg).** Each general bot posts a branded embed with an attached MP3. Discord renders an inline audio card. Works out of the box.

**Voice-channel playback (requires ffmpeg).** If `ffmpeg` is on PATH, `/speak` calls that include `voice_channel_id` + `guild_id` will make the bot join that voice channel and stream the audio. Install: `winget install ffmpeg`. The UI status pill flips to "ffmpeg: yes" once installed; no code change needed.

## ElevenLabs voice IDs

`personas.py` uses ElevenLabs default public voices as placeholders. Swap to your cloned voice IDs in `DEFAULT_ELEVEN_VOICES` — one dict, one line per general.

## ElevenLabs key rotation

All 10 keys share the same env variable name (`ELEVENLABS_API_KEY=` × 10). `python-dotenv` only keeps the last. `eleven_pool.load_all_keys()` reads the raw `.env` file directly and captures every occurrence. Keys rotate round-robin; on 401/429, the offending key is suspended for 10 minutes and the next key takes over.

## Endpoints (via dashboard proxy)

| Method | Path                              | Body                                                              |
|--------|-----------------------------------|-------------------------------------------------------------------|
| GET    | `/api/symphony/status`            | —                                                                 |
| GET    | `/api/symphony/generals`          | —                                                                 |
| POST   | `/api/symphony/speak`             | `{ general, text, channel_id?, voice_channel_id?, guild_id? }`    |
| POST   | `/api/symphony/broadcast`         | `{ text, generals?, channel_id? }`                                |
| POST   | `/api/symphony/summon`            | `{ general, guild_id, voice_channel_id }` (needs ffmpeg)          |
| POST   | `/api/symphony/disband`           | —                                                                 |

All POSTs return `{queued: true, id}` — the queue is async; poll `/status` for progress.
