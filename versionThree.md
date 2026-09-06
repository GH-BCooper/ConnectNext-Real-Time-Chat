# ConnectNext — Version 3

What changed since v2: three new pages/routes, user-created rooms, a profile
page, in-chat message search, two more AI features, and a round of bug fixes and
cleanup.

## Tech used

Nothing new was added to the stack — v3 builds on what v2 already had:

- **Client:** React 19 + TypeScript, React Router (`Navigate` + a `*` catch-all
  route added), Axios, Socket.IO client, Vite
- **Server:** Express, Socket.IO, PostgreSQL (`pg`), `@anthropic-ai/sdk`
  (Claude Messages API, model `claude-opus-5`, override with `AI_MODEL`)

## New features

### Non-AI

1. **Create rooms (`POST /rooms`).** The Dashboard sidebar now has a "New Room"
   form (name + optional description). Rooms are stored with `created_by` so the
   profile page can count them. Duplicate names are rejected with a clear message.
   - Client: [Dashboard.tsx](client/src/pages/Dashboard.tsx)
   - Server: [roomRoutes.js](server/routes/roomRoutes.js)

2. **Profile page (`/profile`).** Shows your username, email, join date, number
   of messages you've sent, and number of rooms you've created.
   - Client: [Profile.tsx](client/src/pages/Profile.tsx)
   - Server: `GET /users/stats` in [userRoutes.js](server/routes/userRoutes.js)

3. **404 page + cleaner routing.** Added a [NotFound.tsx](client/src/pages/NotFound.tsx)
   catch-all. `/` is now the Home landing page, login moved to `/login`, and
   `/home` redirects to `/`.
   - Client: [App.tsx](client/src/App.tsx)

4. **Message search.** A search box in the room filters the visible messages as
   you type — no server round-trip.
   - Client: [RoomChat.tsx](client/src/pages/RoomChat.tsx)

5. **Room list shows message counts;** rooms are fetched with a `LEFT JOIN` count.

6. **Persisted message timestamps.** Old messages loaded from the DB now show
   their time (previously only live messages had one). Message history is also
   capped at the last 100 messages per room.

### AI (Claude API)

7. **💡 Icebreakers button** (room header). Claude looks at the room name and its
   last few messages and suggests 3 conversation starters, shown in a modal.
   - Server: `GET /ai/icebreakers/:roomId` → `getIcebreakers()` in
     [server/lib/ai.js](server/lib/ai.js)

8. **✨ Polish button** (next to the message input). Rewrites your draft message
   to be clearer and friendlier before you send it.
   - Server: `POST /ai/polish` → `getPolishedMessage()` in
     [server/lib/ai.js](server/lib/ai.js)

The existing `/ai` chat assistant and **✨ Summarize** button from v2 are
unchanged. `server/lib/ai.js` was refactored so all four AI features share one
`runClaude()` helper.

## Bugs fixed / cleanup

- **`server.listen(process.env.PORT)` with no fallback** — now defaults to `5000`
  if `PORT` is unset, so the server no longer binds a random port.
- **Schema didn't match older databases.** `schema.sql` now has idempotent
  `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` migrations for `rooms.description`,
  `rooms.created_by`, and `rooms.created_at`, and the sample-room seed runs after
  them. Re-running `schema.sql` on an existing DB is safe.
- **Full-page reloads on navigation.** The Dashboard used
  `window.location.href = ...` to open rooms, forcing a reload and dropping React
  state. Now uses React Router's `navigate()`.
- **Inconsistent post-logout / not-authenticated redirects** — all now go to
  `/login`.
- **`messages/:roomId` returned every message ever** with no limit — capped at 100.
- **Removed dead docs.** Deleted `FEATURES.md` (a stale v1 changelog) and
  `LOCAL_SETUP.md` (duplicated `QUICK_START.md`); rewrote the bloated `README.md`
  (it had two conflicting API-route sections and an out-of-date route table).

## New / changed files

```
server/routes/userRoutes.js     (new)
server/routes/roomRoutes.js     POST /rooms, counts, id ordering
server/routes/messageRoutes.js  100-message cap, created_at
server/routes/aiRoutes.js       + /icebreakers, + /polish
server/lib/ai.js                shared runClaude(), + getIcebreakers, getPolishedMessage
server/index.js                 mount /users, PORT fallback
server/schema.sql               idempotent migrations
client/src/App.tsx              new routes + 404
client/src/pages/Profile.tsx    (new)
client/src/pages/NotFound.tsx   (new)
client/src/pages/Dashboard.tsx  create room, profile link, navigate()
client/src/pages/RoomChat.tsx   search, icebreakers, polish, timestamps
client/src/pages/Home.tsx       Sign In → /login
client/src/pages/Register.tsx   Login link → /login
```
