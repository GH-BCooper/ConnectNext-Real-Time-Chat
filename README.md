# ConnectNext 📚

**Real-time study rooms with a built-in AI tutor.** Make a room for whatever
you're revising, study out loud with other people, then turn the session into an
interactive **quiz** and a set of **revision notes**. Built with **React +
TypeScript** (client) and **Node.js + Express + Socket.IO + PostgreSQL** (server),
with **Claude** woven through it.

Built as a learning project. **© 2026 Made by Brett Cooper**

Version history: [v2](versionTwo.md) · [v3](versionThree.md) · [v4](versionFour.md) · [**v5**](versionFive.md)

---

## Quick start

See [QUICK_START.md](QUICK_START.md) for the 4-step version. In short:

```bash
# 1. database (once)
psql -U postgres -c "CREATE DATABASE connectnext;"
psql -U postgres -d connectnext -f server/schema.sql   # safe to re-run

# 2. install
cd server && npm install
cd ../client && npm install

# 3. run (two terminals)
cd server && npm run dev     # http://localhost:5000
cd client && npm run dev     # http://localhost:5173
```

Then open http://localhost:5173.

### Environment

`server/.env` (already set for local dev):

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgre@bCooper
DB_HOST=localhost
DB_PORT=5432
DB_NAME=connectnext
CLIENT_URL=http://localhost:5173
SESSION_SECRET=connectnextsecret-local-dev
NODE_ENV=development
ANTHROPIC_API_KEY=        # optional — needed only for the AI features
AI_MODEL=claude-sonnet-5 # optional override (opus-5 for deeper answers)
```

`client/.env`:

```
VITE_API_URL=http://localhost:5000
```

Without `ANTHROPIC_API_KEY` the app works normally; AI buttons just show a friendly "AI is off" message.

---

## Tech stack

**Client:** React 19, TypeScript, React Router, Axios, Socket.IO client, Vite
**Server:** Node.js, Express, Socket.IO, PostgreSQL (`pg`), bcrypt, express-session + connect-pg-simple, `@anthropic-ai/sdk`

---

## Pages / routes

| Route              | Page       | Notes                          |
| ----------------- | ---------- | ------------------------------ |
| `/`               | Home       | Landing page                   |
| `/login`          | Login      | Redirects to dashboard if in   |
| `/register`       | Register   |                                |
| `/dashboard`      | Study Rooms | Room grid + create room (protected) |
| `/chat?roomId=ID` | Study room | Real-time chat + Quiz Me / Notes / Discuss / Focus (protected) |
| `/explore`        | Search     | Global message search (protected) |
| `/assistant`      | AI Tutor   | Agentic multi-turn tutor with tool use (protected) |
| `/profile`        | Progress   | Your info + stats (protected)  |
| `*`               | 404        | Not found page                 |

---

## API endpoints

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ----------------------------------- |
| POST   | `/auth/register`        | Register + start session            |
| POST   | `/auth/login`           | Login                               |
| POST   | `/auth/logout`          | Logout                              |
| GET    | `/auth/me`              | Current user (protected)            |
| GET    | `/rooms`                | List rooms + message counts (protected) |
| POST   | `/rooms`                | Create a room (protected)           |
| GET    | `/messages/:roomId`     | Last 100 messages, oldest first (protected) |
| GET    | `/users/stats`          | Your profile + message/room counts (protected) |
| GET    | `/messages/search?q=`   | Global message search across all rooms (protected) |
| GET    | `/health`               | Health check                        |
| GET    | `/ai/status`            | Whether AI is enabled + which model |
| GET    | `/ai/summarize/:roomId` | AI revision notes from a session (protected) |
| GET    | `/ai/icebreakers/:roomId` | AI discussion prompts (protected) |
| GET    | `/ai/quiz/:roomId`      | AI recall quiz from a session — JSON questions (protected) |
| GET    | `/ai/vibe/:roomId`      | AI focus/energy read of a session (protected) |
| POST   | `/ai/polish`            | AI rewrite of a draft message (protected) |
| POST   | `/ai/companion`         | Agentic multi-turn AI tutor with tool use (protected) |

---

## Socket.IO events

**Client → server:** `joinRoom`, `leaveRoom`, `sendMessage`, `typing`
**Server → client:** `receiveMessage`, `roomUsers`, `systemMessage`, `typing`, `aiTyping`

`sendMessage` with a message starting `/ai ` or `@ai ` pings the AI tutor, which replies into the room for everyone.

---

## Project structure

```
client/src/
  api/axios.ts          socket/socket.ts
  lib/useAuth.ts        components/NavBar.tsx  components/QuizModal.tsx
  styles/global.css     (design system)
  pages/  Home  Login  Register  Dashboard  RoomChat  Explore  Assistant  Profile  NotFound
server/
  index.js              db.js              schema.sql
  routes/  authRoutes  roomRoutes  messageRoutes  userRoutes  aiRoutes
  middleware/auth.js    lib/ai.js  (runClaude, getQuiz, runCompanion agent loop)
```

---

## License

MIT — for learning and personal use.
