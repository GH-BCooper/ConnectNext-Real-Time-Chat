<div align="center">

# 📚 ConnectNext — Version 6

### _The "works on your phone, runs on Groq" release_

`mobile-first UI` · `AI backend swap` · `end-to-end test` · `no schema change`

</div>

---

## 🎯 TL;DR

| # | What | Type |
|---|------|------|
| 1 | 📱 **Full mobile view** — every page, route, modal and AI response, rebuilt to work from 320px up with zero horizontal overflow | 🆕 UI overhaul |
| 2 | 🔌 **AI runs on Groq now** — migrated off the Anthropic SDK to Groq's OpenAI-compatible API, called with plain `fetch` (no SDK) | 🔄 backend swap |
| 3 | ✅ **End-to-end test harness** — one script exercises auth, rooms, messages, search, stats, every AI endpoint and the real-time socket layer | 🆕 tooling |
| 4 | 🧹 **Cleanup** — dropped the unused `@anthropic-ai/sdk` dependency; `<title>` is finally "ConnectNext" | 🔧 fix |

No database changes. v6 runs on a v5 database as-is.

---

## 📱 Mobile view — the main event

v5 looked fine on a laptop and fell apart on a phone: the nav wrapped into a
tall stack, the landing headline (56px) overflowed a 320px screen, the study
room's chat + sidebar layout didn't collapse, and the AI modals bled off the
edges. v6 makes the whole app **mobile-first** — it's built to collapse cleanly
to ~320px and scale up, not the other way round.

### The responsive foundation ([global.css](client/src/styles/global.css))

- `overflow-x: hidden` guard on `body` + `.cn-page`; `max-width: 100%` on media
  and buttons so nothing can push a horizontal scrollbar
- **Fluid type** — `clamp()` on every display heading (`.cn-hero-title`,
  `.cn-h1`) instead of fixed pixel sizes
- **16px form inputs** — stops iOS Safari from auto-zooming on focus
- **`dvh` units** + `env(safe-area-inset-*)` — correct height and padding on
  notched phones / with the mobile address bar
- Reusable layout primitives: `.cn-split` (2-col → stacked at 820px),
  `.cn-grid` (auto-fit cards → 1-col at 420px), `.cn-toolbar` (horizontally
  scrollable button row — never wraps into a tall stack), `.cn-composer`
  (chat input row), `.cn-modal` / `.cn-modal-overlay`, `.cn-bubble` (long
  words / URLs wrap instead of overflowing)
- `prefers-reduced-motion` support

### Per-screen work

| Screen | What changed |
|--------|--------------|
| **NavBar** ([NavBar.tsx](client/src/components/NavBar.tsx)) | Class-based rebuild. Brand + a **horizontally-scrollable pill nav** + actions on the right. "Hi, {name}" greeting hides below 560px. |
| **Home** ([Home.tsx](client/src/pages/Home.tsx)) | `clamp()` hero title + subhead; feature / steps grids collapse to one column. |
| **Dashboard** ([Dashboard.tsx](client/src/pages/Dashboard.tsx)) | `.cn-split` — the "New study room" panel moves above the room grid on mobile; cards go single-column; long room names wrap. |
| **Study room** ([RoomChat.tsx](client/src/pages/RoomChat.tsx)) | Fixed-height `100dvh` app shell (no page scroll — panes scroll). Header is **title / scrollable AI toolbar / Exit** — one row on desktop, wraps to two on mobile with Exit staying pinned. The **online-users sidebar becomes a horizontal chip strip** across the top on mobile. Composer pinned to the bottom with safe-area padding; the `✨ Polish` button collapses to just the icon. Message name/body spacing tightened. |
| **AI Tutor** ([Assistant.tsx](client/src/pages/Assistant.tsx)) | Converted to the same fixed-height shell — only the thread scrolls, composer stays pinned. Responses and 🔧 tool-use pills wrap cleanly. |
| **Search** ([Explore.tsx](client/src/pages/Explore.tsx)) | Result card header (room pill + timestamp) wraps instead of overflowing; long content breaks. |
| **Profile** ([Profile.tsx](client/src/pages/Profile.tsx)) | Long emails / usernames wrap; stat tiles stay side-by-side. |
| **Quiz / Notes / Focus / Discuss modals** ([QuizModal.tsx](client/src/components/QuizModal.tsx), RoomChat) | Full-width with safe-area padding, internal scroll, answer options wrap to any height. |
| **index.html** | `<title>` → `ConnectNext`, `viewport-fit=cover`, `theme-color`, description meta. |

### How it was verified

Drove real Chrome (headless, via `puppeteer-core`) across **320 / 375 / 393 /
412px** — every route, the Quiz and Focus modals, and a live AI Tutor answer —
with an automated check that walks the DOM for any element crossing the
viewport edge. **Result: zero horizontal-overflow findings anywhere.** Desktop
and tablet (768px) layouts were spot-checked for regressions.

---

## 🔌 AI backend — Anthropic SDK → Groq

`server/.env` shipped with an empty `ANTHROPIC_API_KEY`, so every AI feature was
returning the "AI is off" 503. Rather than require an Anthropic key, the AI
layer now runs on **Groq** (OpenAI-compatible chat completions).

### What changed ([server/lib/ai.js](server/lib/ai.js))

- **No SDK.** `@anthropic-ai/sdk` removed; calls go through native `fetch` to
  `https://api.groq.com/openai/v1/chat/completions`.
- Every exported function keeps its **name and signature** — `aiRoutes.js` and
  `index.js` didn't need to change.
- `runClaude()` → `runLLM()` — one system + user prompt → text, with an optional
  `jsonMode` flag that uses Groq's `response_format: { type: "json_object" }`
  for the Quiz and Focus features.
- `runCompanion()` — the agentic tutor loop — converts the Anthropic-style tool
  definitions in `aiRoutes.js` (`{ name, description, input_schema }`) to
  OpenAI function-tools and runs the loop with `tool_calls` /
  `role: "tool"` result messages instead of content blocks.

### Config

| Env var | Was | Now |
|---------|-----|-----|
| API key | `ANTHROPIC_API_KEY` | **`GROQ_API_KEY`** (`GROK_API_KEY` also accepted) |
| Model | `AI_MODEL=claude-sonnet-5` | **`AI_MODEL=openai/gpt-oss-120b`** |

> ⚠️ This Groq account only exposes a handful of chat models —
> `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, `qwen/qwen3.x-27b`,
> `groq/compound*`. `llama-3.3-*` and friends return `model_not_found`.

Without a key the behaviour is unchanged — AI buttons show the friendly
"AI is off" message.

---

## ✅ End-to-end test — [client/e2e-test.mjs](client/e2e-test.mjs)

One script, run with `node e2e-test.mjs` while both servers are up. **38 checks:**

- **Auth** — register, login, logout, `/auth/me`, 401 guards on protected
  routes, wrong-password, duplicate-email
- **Rooms** — list, create, duplicate-name 400, blank-name 400
- **Messages** — Socket.IO connect / join / send / broadcast, REST fetch,
  oldest-first ordering
- **Real-time AI** — an in-room `/ai …` message triggers the `aiTyping` event
  and an "AI Assistant" reply that gets persisted to the room for everyone
- **Search** — hit + the `< 2 chars → []` guard
- **Stats** — profile with message / room counts
- **AI endpoints** — `/ai/summarize`, `/ai/icebreakers`, `/ai/quiz` (with
  question-shape validation), `/ai/vibe`, `/ai/polish` (+ empty → 400),
  `/ai/companion` (asserts the agent actually invoked a tool), unknown-room
  handled gracefully

---

## 📂 Changed files

```
server/lib/ai.js               rewritten — Groq via fetch; runClaude -> runLLM; OpenAI tool loop
server/.env                    GROQ_API_KEY / AI_MODEL=openai/gpt-oss-120b
server/package.json             - @anthropic-ai/sdk

client/src/styles/global.css   mobile-first responsive system (rewritten)
client/index.html              <title>, viewport-fit, theme-color, description
client/src/components/NavBar.tsx      class-based responsive nav
client/src/components/QuizModal.tsx   .cn-modal; options wrap
client/src/pages/RoomChat.tsx        fixed-height shell; scrollable toolbar; sidebar -> chip strip
client/src/pages/Assistant.tsx       fixed-height chat shell; GROQ_API_KEY in the "AI off" hint
client/src/pages/Home.tsx            fluid hero + grids
client/src/pages/Dashboard.tsx       .cn-split / .cn-grid
client/src/pages/Explore.tsx         wrapping result headers
client/src/pages/Profile.tsx         wrapping long values
client/e2e-test.mjs            (new)  full-pipeline test

README.md                      Groq env + e2e-test section
```

---

## ▶️ Running it

No new dependencies, no migration:

```bash
cd server && npm run dev
cd client && npm run dev
```

Add `GROQ_API_KEY` to `server/.env` for the AI features
(free key at <https://console.groq.com/keys>). Then, with both servers up:

```bash
cd client && node e2e-test.mjs
```

<div align="center">

**© 2026 Made by Brett Cooper** · [v2](versionTwo.md) · [v3](versionThree.md) · [v4](versionFour.md) · [v5](versionFive.md)

</div>
