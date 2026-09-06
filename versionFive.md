<div align="center">

# 📚 ConnectNext — Version 5

### _The "chat app becomes a study platform" release_

`new purpose` · `Quiz Me` · `1 new route` · `study-first UI` · `bug fixes` · `cleanup`

</div>

---

## 🎯 TL;DR

| # | What | Type |
|---|------|------|
| 1 | 🧭 **New purpose** — ConnectNext is now a platform for **real-time group study rooms** | 🔄 repositioning |
| 2 | ❓ **Quiz Me** — one tap turns a session into an interactive multiple-choice recall quiz | 🆕 new AI feature |
| 3 | 📝 **Revision Notes / 💡 Discuss / 🎯 Focus** — the old AI tools, re-aimed at studying | ♻️ reframed |
| 4 | 🧑‍🏫 **AI Tutor** — the Companion, now a patient study assistant over your sessions | ♻️ reframed |
| 5 | 🎨 **Study-first UI** — nav, landing page and auth screens rebuilt around the new job | ♻️ upgrade |
| 6 | 🐛 **Bug fixes + cleanup** — unknown-user crash guard, consistent auth pages | 🔧 fix |

---

## 🧭 Why the change

Version 4 was a competent **chat app with AI features** — but "a chat app" isn't a
problem anyone is looking to solve. Everyone already has five of them.

**What people _do_ need:** studying with others is proven to work better than
studying alone, but remote study groups drift — you talk for an hour and walk away
with nothing written down and no idea whether any of it stuck.

**Version 5 wraps ConnectNext around exactly that gap:**

> A study room is a live space where a group learns a topic out loud. When you're
> done, the room hands you a **quiz** (did it stick?) and **revision notes** (keep
> this), and an **AI tutor** sits in the room the whole time.

Same engine — rooms, real-time messaging, presence, Claude. Every feature now
points at one outcome: **learn something with other people, and prove it stuck.**

---

## ❓ The new feature — **Quiz Me** (`/chat` → `❓ Quiz Me`)

The heart of v5. Active recall — testing yourself instead of re-reading — is the
single most effective study technique there is. Quiz Me makes it one tap.

**How it works**

1. Your group studies a topic in the room (chat, `/ai` the tutor, whatever).
2. Anyone hits **❓ Quiz Me** in the room header.
3. The server pulls the last 60 messages and asks Claude for a **3–5 question
   multiple-choice quiz** on the concepts the group actually discussed — strict
   JSON, validated server-side.
4. An interactive quiz opens: pick an answer per question → **Submit** → see your
   score, the correct answers in green, your misses in red, and a one-line
   explanation for each.
5. **Try again** re-runs the same quiz; close and study more, then re-quiz.

**Where it lives**

| Piece | File |
|-------|------|
| Quiz generation | `getQuiz()` in [server/lib/ai.js](server/lib/ai.js) |
| Route | `GET /ai/quiz/:roomId` in [server/routes/aiRoutes.js](server/routes/aiRoutes.js) |
| Interactive UI | [client/src/components/QuizModal.tsx](client/src/components/QuizModal.tsx) _(new)_ |
| Wiring | `quizMe()` in [client/src/pages/RoomChat.tsx](client/src/pages/RoomChat.tsx) |

If there isn't enough discussion yet, it says so instead of inventing questions.

---

## ♻️ The existing AI tools, re-aimed at studying

Nothing was thrown away — the prompts and labels were pointed at a study session
instead of a generic group chat.

| v4 | v5 | What changed |
|----|----|--------------|
| ✨ Summarize | 📝 **Notes** | Now produces **revision notes** — key concepts, definitions and takeaways, small talk skipped. |
| 💡 Icebreakers | 💡 **Discuss** | Now suggests questions that **test understanding** or open the topic up further. |
| 🎭 Vibe | 🎯 **Focus** | Now reads whether the room is **locked in, drifting or confused** — with one line on what to do. |
| 🤖 AI Companion | 🧑‍🏫 **AI Tutor** | Same agentic tool-use loop; system prompt is now a patient tutor over your **rooms, sessions and progress**. |
| 🧭 Explore | 🔍 **Search** | Same global search, framed as "find anything you've covered". |
| `/ai` in-room reply | _(unchanged mechanic)_ | Reworded as pinging the **tutor**; still answers into the room for everyone. |

---

## 🎨 UI — rebuilt around studying

- **Landing page** ([Home.tsx](client/src/pages/Home.tsx)) — new headline
  _"Study together in real time — and prove it stuck"_, study-focused feature
  grid, and a **"How a session works"** 1-2-3 walkthrough.
- **Nav** ([NavBar.tsx](client/src/components/NavBar.tsx)) —
  `Study Rooms · Search · AI Tutor · Progress`.
- **Login / Register** ([Login.tsx](client/src/pages/Login.tsx),
  [Register.tsx](client/src/pages/Register.tsx)) — **rebuilt on the v4 design
  system**. They were the last two pages still using hand-written inline hex
  colours from v1; now they use `cn-card` / `cn-page` / gradient text like
  everything else, with `Enter`-to-submit and lighter validation.
- **404** ([NotFound.tsx](client/src/pages/NotFound.tsx)) — same treatment.
- **Dashboard** — copy now says _"What are you studying?"_ instead of _"Room name"_.

---

## 🐛 Bugs fixed / 🧹 cleanup

| Fix | Detail |
|-----|--------|
| 💥 **Crash on message from unknown user** | `sendMessage` looked up the user id and passed it straight into an `INSERT`; `messages.user_id` is `NOT NULL`, so a message from a stale/renamed session threw an unhandled DB error. Now it logs and drops the message. |
| 🔁 **Inconsistent auth pages** | Login had an "already logged in → dashboard" redirect; Register didn't. Both do now, via the same one-liner. |
| 🎨 **Two pages off the design system** | Login/Register/404 carried ~120 lines each of inline styling. Replaced with the shared classes — less code, one consistent look. |
| 🔗 **Raw `<a>` for in-app nav** | Auth pages used `navigate()` buttons styled as links; now real `<Link>`s. |

No new dependencies. No schema changes — v5 runs on a v4 database as-is.

---

## 🗺️ Routes & endpoints after v5

### Pages

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Study-focused landing |
| `/login` · `/register` | Auth | rebuilt on the design system |
| `/dashboard` | Study Rooms | rooms grid + create |
| `/chat?roomId=ID` | Study room | + ❓ Quiz Me · 📝 Notes · 💡 Discuss · 🎯 Focus |
| `/explore` | Search | global message search |
| `/assistant` | AI Tutor | agentic multi-turn tutor |
| `/profile` | Progress | your info + stats |
| `*` | 404 | |

### API

| Method | Endpoint | New? |
|--------|----------|------|
| `GET` | `/ai/quiz/:roomId` | 🆕 |
| `GET` | `/ai/summarize/:roomId` · `/ai/icebreakers/:roomId` · `/ai/vibe/:roomId` | prompts re-aimed at studying |
| `POST` | `/ai/companion` | tutor system prompt |
| — | everything else (auth / rooms / messages / users / `/ai/status` / `/ai/polish`) | unchanged |

---

## 📂 New / changed files

```
server/lib/ai.js                + getQuiz(); study-focused prompts across all helpers
server/routes/aiRoutes.js       + GET /ai/quiz/:roomId; tutor tool descriptions
server/index.js                 sendMessage: guard against unknown user_id

client/src/components/QuizModal.tsx   (new)  interactive recall quiz
client/src/pages/RoomChat.tsx    + Quiz Me; buttons re-labelled for studying
client/src/pages/Home.tsx        rewritten — study platform landing page
client/src/pages/Assistant.tsx   AI Companion -> AI Tutor
client/src/pages/Explore.tsx     Explore -> Search (copy)
client/src/pages/Dashboard.tsx   study-focused copy
client/src/pages/Login.tsx       rebuilt on the design system
client/src/pages/Register.tsx    rebuilt on the design system + auth redirect
client/src/pages/NotFound.tsx    rebuilt on the design system
client/src/components/NavBar.tsx study-focused labels

README.md, QUICK_START.md        updated for v5
```

---

## ▶️ Running it

No new dependencies, no migration:

```bash
psql -U postgres -d connectnext -f server/schema.sql   # still safe to re-run
cd server && npm run dev
cd client && npm run dev
```

Add `ANTHROPIC_API_KEY` to `server/.env` for the AI features. Without it the app
still works — the AI buttons just show a friendly "AI is off" message.

<div align="center">

**© 2026 Made by Brett Cooper** · [v2](versionTwo.md) · [v3](versionThree.md) · [v4](versionFour.md)

</div>
