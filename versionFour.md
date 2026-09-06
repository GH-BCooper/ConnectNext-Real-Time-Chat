<div align="center">

# 🚀 ConnectNext — Version 4

### _The "AI that actually knows your chats" release_

`agentic AI` · `2 new pages` · `4 new routes` · `1 new design system` · `bug fixes`

</div>

---

## 🎯 TL;DR

| # | What | Type |
|---|------|------|
| 1 | 🤖 **AI Companion** — a multi-turn assistant with **tool use** over your real data | 🆕 new AI capability |
| 2 | 🧭 **Explore** — global message search across every room | 🆕 new page |
| 3 | 🎭 **Vibe Check** — AI reads a room's mood + energy | 🆕 AI feature |
| 4 | 🎨 **Design system** — one colourful theme, shared nav, less copy-paste | ♻️ upgrade |
| 5 | 🛡️ **Graceful AI fallback** — no API key = friendly message, never a crash | ♻️ upgrade |
| 6 | 🐛 **Bug fixes** — ghost users, duplicate rooms, template cruft | 🔧 fix |

---

## 🆕 The completely new AI capability — **AI Companion** (`/assistant`)

Every AI feature before v4 was a **single, stateless prompt** ("summarise this", "polish that").
The Companion is a different kind of thing:

- **🧠 Multi-turn memory** — it remembers the whole conversation, not just your last line.
- **🔧 Agentic tool use** — before answering, Claude can call real tools against your database:

  | Tool | What it does |
  |------|--------------|
  | `search_messages` | Full-text search across every message you can see |
  | `list_rooms` | Every room + description + message count |
  | `my_stats` | Your own username, join date, messages sent, rooms created |

- **👀 Transparent** — each reply shows little `🔧 tool` pills so you can see what it looked at.

So you can ask _"Which room is busiest and what are people talking about there?"_ and it will
list the rooms, search the top one, then answer — in one turn.

**Where it lives**
- Client: [client/src/pages/Assistant.tsx](client/src/pages/Assistant.tsx)
- Server: `POST /ai/companion` in [server/routes/aiRoutes.js](server/routes/aiRoutes.js)
- Agent loop: `runCompanion()` in [server/lib/ai.js](server/lib/ai.js) — a small `stop_reason === "tool_use"` loop, capped at 5 steps.

---

## 🧭 New page — **Explore** (`/explore`)

A single search box that queries **every message in every room** (not just the one you're in).

- Debounced live search, result cards show room · author · timestamp with the match **highlighted**.
- Click a result → jumps straight into that room.
- Client: [client/src/pages/Explore.tsx](client/src/pages/Explore.tsx)
- Server: `GET /messages/search?q=` in [server/routes/messageRoutes.js](server/routes/messageRoutes.js)

---

## 🎭 New AI feature — **Vibe Check** (room header)

One tap in any room → Claude reads the last 40 messages and returns a structured mood:

```
🎉  Hyped
Energy: 🔥🔥🔥🔥·
The room is buzzing about the launch — lots of celebration and quick back-and-forth.
```

- Returns strict JSON (`mood`, `emoji`, `energy` 1–5, `note`) parsed server-side.
- Server: `GET /ai/vibe/:roomId` → `getRoomVibe()` in [server/lib/ai.js](server/lib/ai.js)

---

## ♻️ Upgrades to what already existed

### AI layer ([server/lib/ai.js](server/lib/ai.js))
- **`aiAvailable()`** helper + **`GET /ai/status`** — the client hides/greys AI buttons when no key is set.
- Every AI route now returns a friendly **503 with a message** instead of a raw 500 when the key is missing.
- Default model is now **`claude-sonnet-5`** (fast + cheap for a learning project). Override with `AI_MODEL`.
- Prompts tightened for shorter, more consistent output. Dropped an unused experimental request param.

### UI — one design system
- New [client/src/styles/global.css](client/src/styles/global.css): CSS variables for colour/spacing, gradient text,
  cards, pills, themed inputs/buttons, tidy scrollbars.
- New shared [client/src/components/NavBar.tsx](client/src/components/NavBar.tsx) — sticky, gradient logo, active-route pills, on every signed-in page.
- New shared [client/src/lib/useAuth.ts](client/src/lib/useAuth.ts) hook — replaces the auth-check `useEffect` that was copy-pasted into 4 pages.
- **Home**, **Dashboard**, **Profile**, **RoomChat** rebuilt on the system — colourful cards, gradients, consistent spacing.

---

## 🐛 Bugs fixed / 🧹 cleanup

| Fix | Detail |
|-----|--------|
| 👻 **Ghost users in rooms** | `RoomChat` never told the server it was leaving on unmount / room switch, so you stayed in the online list. Now emits `leaveRoom` in the effect cleanup. |
| 🏚️ **Duplicate rooms possible** | `rooms.name` had **no unique constraint** despite the API and seed assuming one — re-running `schema.sql` could insert duplicate sample rooms. Added an idempotent de-dupe + `rooms_name_unique` constraint. |
| ⏱️ **Typing indicator flicker** | `setTimeout` was never cleared; now debounced properly. |
| 📐 **App was boxed to 1126px** | Leftover Vite template CSS in `index.css` constrained the whole app. Replaced with a real reset. |
| 🗑️ **Template cruft removed** | Deleted `client/src/App.css` (unused Vite demo styles), and the stale/incorrect `client/README.md` + `server/README.md` (both duplicated an out-of-date copy of the root README). |

---

## 🗺️ Routes & endpoints after v4

### Pages

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Landing page |
| `/login` · `/register` | Auth | |
| `/dashboard` | Dashboard | Rooms grid + create room |
| `/chat?roomId=ID` | Room chat | + 🎭 Vibe Check |
| `/explore` | **Explore** 🆕 | Global message search |
| `/assistant` | **AI Companion** 🆕 | Agentic multi-turn assistant |
| `/profile` | Profile | Your info + stats |
| `*` | 404 | |

### API

| Method | Endpoint | New? |
|--------|----------|------|
| `GET` | `/health` | 🆕 |
| `GET` | `/ai/status` | 🆕 |
| `GET` | `/messages/search?q=` | 🆕 |
| `GET` | `/ai/vibe/:roomId` | 🆕 |
| `POST` | `/ai/companion` | 🆕 |
| `GET` | `/ai/summarize/:roomId` · `/ai/icebreakers/:roomId` | now degrade gracefully |
| `POST` | `/ai/polish` | now degrades gracefully |
| — | all auth / rooms / messages / users routes | unchanged |

---

## 📂 New / changed files

```
server/lib/ai.js               + aiAvailable, getRoomVibe, runCompanion; sonnet default
server/routes/aiRoutes.js       + /status, /vibe, /companion; graceful 503 guard
server/routes/messageRoutes.js  + GET /search
server/index.js                 + GET /health
server/schema.sql               rooms de-dupe + unique constraint
server/.env(.example)           AI_MODEL default -> claude-sonnet-5

client/src/pages/Assistant.tsx  (new)  AI Companion
client/src/pages/Explore.tsx    (new)  global search
client/src/components/NavBar.tsx (new) shared nav
client/src/lib/useAuth.ts       (new)  shared auth guard
client/src/styles/global.css    rewritten as a design system
client/src/index.css            minimal reset (was Vite template)
client/src/App.tsx              + /explore, /assistant routes
client/src/pages/{Home,Dashboard,Profile,RoomChat}.tsx  rebuilt on the design system
client/src/App.css              (deleted)
client/README.md, server/README.md  (deleted — stale duplicates)
```

---

## ▶️ Running it

No new dependencies. Same as before:

```bash
psql -U postgres -d connectnext -f server/schema.sql   # safe to re-run, applies the v4 migration
cd server && npm run dev
cd client && npm run dev
```

Add `ANTHROPIC_API_KEY` to `server/.env` for the AI features. Without it the whole app
still works — AI buttons just show a friendly "AI is off" message.

<div align="center">

**© 2026 Made by Brett Cooper** · [v2](versionTwo.md) · [v3](versionThree.md)

</div>
