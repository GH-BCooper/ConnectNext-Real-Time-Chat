# ConnectNext 🚀

A modern, real-time chat application built with **React**, **TypeScript**, **Node.js**, **Express**, **PostgreSQL**, and **Socket.IO**.

ConnectNext enables users to register, log in, join chat rooms, send messages instantly, view online users, and collaborate in real-time with WebSocket technology.

**© 2026 Made by Brett Cooper**

---

## ✨ Features

### Authentication & Security

- ✅ User registration with validation
- ✅ Secure login with session management
- ✅ Password hashing with bcrypt
- ✅ Protected routes and API endpoints
- ✅ Session-based authentication
- ✅ Automatic redirect for unauthorized access

### Real-Time Chat

- ✅ Multiple chat rooms
- ✅ Real-time messaging with Socket.IO
- ✅ Online user tracking
- ✅ Typing indicators
- ✅ System notifications (user join/leave)
- ✅ Auto-scroll to latest messages
- ✅ Message history

### User Experience

- ✅ Beautiful, responsive UI
- ✅ Professional dark theme
- ✅ Loading states
- ✅ Error handling and validation
- ✅ User-friendly navigation
- ✅ Exit room functionality
- ✅ Online user list with status indicators

### Frontend Pages

- 🏠 **Home Page** - Landing page with Sign In/Sign Up links
- 🔐 **Login** - Secure login form with validation
- 📝 **Register** - User registration with password validation
- 📊 **Dashboard** - Chat rooms list and user info
- 💬 **Room Chat** - Real-time chat interface with online users

---

## 🛠 Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **Socket.IO Client** - Real-time communication
- **Vite** - Build tool
- **CSS** - Styling with dark theme

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket library
- **PostgreSQL** - Database
- **bcrypt** - Password hashing
- **dotenv** - Environment variables
- **express-session** - Session management
- **CORS** - Cross-origin requests

---

## 📁 Project Structure

```
ConnectNext/
│
├── client/                          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts             # Axios instance with API config
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing page
│   │   │   ├── Login.tsx            # Login form
│   │   │   ├── Register.tsx         # Registration form
│   │   │   ├── Dashboard.tsx        # Main dashboard
│   │   │   └── RoomChat.tsx         # Chat room
│   │   │
│   │   ├── socket/
│   │   │   └── socket.ts            # Socket.IO configuration
│   │   │
│   │   ├── styles/
│   │   │   └── global.css           # Global styles
│   │   │
│   │   ├── App.tsx                  # Main app component
│   │   └── main.tsx                 # Entry point
│   │
│   ├── .env                         # Environment variables
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── server/                          # Backend (Node.js + Express)
│   ├── routes/
│   │   ├── authRoutes.js            # Auth endpoints
│   │   ├── roomRoutes.js            # Room endpoints
│   │   └── messageRoutes.js         # Message endpoints
│   │
│   ├── middleware/
│   │   └── auth.js                  # Authentication middleware
│   │
│   ├── db.js                        # Database configuration
│   ├── index.js                     # Server entry point
│   ├── schema.sql                   # Database schema
│   ├── .env                         # Environment variables
│   └── package.json
│
├── README.md                        # This file
├── LOCAL_SETUP.md                   # Local setup guide
├── QUICK_START.md                   # Quick start guide
├── FEATURES.md                      # Detailed features
└── .env.example files              # Environment templates
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (running locally)
- Git

### Installation & Setup

#### 1. Clone the Repository

```bash
cd ConnectNext
```

#### 2. Setup Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE connectnext;
\q

# Load schema
cd server
psql -U postgres -d connectnext -f schema.sql
```

#### 3. Install Dependencies

**Client:**

```bash
cd client
npm install
```

**Server:**

```bash
cd server
npm install
```

#### 4. Configure Environment Variables

**Client (.env):**

```
VITE_API_URL=http://localhost:5000
```

**Server (.env):**

```
PORT=5000
DB_USER=postgres
DB_PASSWORD=postgre@bCooper
DB_HOST=localhost
DB_PORT=5432
DB_NAME=connectnext
CLIENT_URL=http://localhost:5173
SESSION_SECRET=your-secret-key
NODE_ENV=development
```

#### 5. Start the Application

**Terminal 1 - Start Server:**

```bash
cd server
npm run dev
```

Server runs on: `http://localhost:5000`

**Terminal 2 - Start Client:**

```bash
cd client
npm run dev
```

Client runs on: `http://localhost:5173`

#### 6. Access the Application

Open your browser and visit: **http://localhost:5173**

---

## 📝 Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Rooms Table

```sql
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Messages Table

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication Flow

1. **Registration** - User creates account with username, email, password
2. **Login** - User logs in with email and password
3. **Session Creation** - Express-session creates secure session cookie
4. **Protected Access** - Middleware checks session for protected routes
5. **Socket Auth** - Socket.IO verifies session before connection
6. **Logout** - Session destroyed, user redirected to login

---

## 🌐 API Endpoints

### Authentication Routes

| Method | Endpoint         | Description                  |
| ------ | ---------------- | ---------------------------- |
| POST   | `/auth/register` | Register new user            |
| POST   | `/auth/login`    | Login user                   |
| POST   | `/auth/logout`   | Logout user                  |
| GET    | `/auth/me`       | Get current user (protected) |

### Room Routes

| Method | Endpoint | Description               |
| ------ | -------- | ------------------------- |
| GET    | `/rooms` | Get all rooms (protected) |

### Message Routes

| Method | Endpoint            | Description                      |
| ------ | ------------------- | -------------------------------- |
| GET    | `/messages/:roomId` | Get messages by room (protected) |

---

## 🔌 Socket.IO Events

### Client to Server

| Event         | Data                            | Description       |
| ------------- | ------------------------------- | ----------------- |
| `joinRoom`    | `{ roomId, username }`          | Join a chat room  |
| `leaveRoom`   | `{ roomId, username }`          | Leave a chat room |
| `sendMessage` | `{ roomId, message, username }` | Send message      |
| `typing`      | `{ roomId, username }`          | Typing indicator  |

### Server to Client

| Event            | Data                                  | Description         |
| ---------------- | ------------------------------------- | ------------------- |
| `receiveMessage` | `{ roomId, message, username, time }` | Receive message     |
| `roomUsers`      | `[usernames]`                         | Online users list   |
| `systemMessage`  | `{ message }`                         | System notification |
| `typing`         | `{ username }`                        | User typing         |

---

## 🎨 UI/UX Features

- **Dark Theme** - Professional dark color scheme (#0f172a, #1e293b)
- **Responsive Design** - Works on desktop and tablet
- **Loading States** - Feedback during operations
- **Error Handling** - User-friendly error messages
- **Smooth Animations** - Hover effects and transitions
- **Professional Typography** - Clear hierarchy and readability

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **Session Management** - Secure session cookies
- **CORS Protection** - Restricted origin access
- **Input Validation** - Frontend and backend validation
- **API Protection** - Authentication middleware on protected routes
- **Socket Protection** - Auth check for Socket.IO connections
- **Environment Variables** - Sensitive data in .env files

---

## 🐛 Troubleshooting

### Database Connection Error

- Ensure PostgreSQL is running
- Check DB credentials in `.env`
- Verify database exists: `psql -U postgres -l`

### Cannot Connect to API

- Ensure server is running on port 5000
- Check client `.env` has correct `VITE_API_URL`
- Look for errors in server terminal

### Port Already in Use

- Change `PORT` in `.env` or kill process using the port
- On Windows: `netstat -ano | findstr :5000`
- On Mac/Linux: `lsof -i :5000`

### Session Not Persisting

- Clear browser cookies
- Restart server and client
- Check `SESSION_SECRET` is set

### Socket Connection Issues

- Clear browser cache
- Check CORS settings in server
- Verify Socket.IO events are spelled correctly

---

## 📚 Documentation

- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Detailed local setup guide
- [QUICK_START.md](QUICK_START.md) - 4-step quick start
- [FEATURES.md](FEATURES.md) - Complete feature list

---

## 🚢 Deployment

When ready to deploy to production:

1. **Update Environment Variables**
   - Set `NODE_ENV=production`
   - Use production database URL (Neon, etc.)
   - Update `CLIENT_URL` to production domain

2. **Deploy Frontend (Vercel)**
   - Connect Git repo
   - Set `VITE_API_URL` to production server URL
   - Deploy

3. **Deploy Backend (Render)**
   - Connect Git repo
   - Set environment variables
   - Deploy

See individual platform docs for detailed instructions.

---

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

---

## 👨‍💻 Author

**Brett Cooper**

© 2026 Made by Brett Cooper

---

## 🎯 Future Enhancements

- [ ] Direct messaging between users
- [ ] File/image sharing
- [ ] Message reactions/emojis
- [ ] User profiles
- [ ] Room creation by users
- [ ] Message search
- [ ] Dark/light theme toggle
- [ ] Push notifications
- [ ] Audio/video chat

---

## ❓ Support

For issues or questions, please check the troubleshooting section or refer to the documentation files.

- Express.js REST API
- PostgreSQL Database Integration
- Session-Based Authentication
- Socket.IO Real-Time Communication
- Room-Based Chat System
- Online Users Tracking
- Typing Indicators
- Persistent Message Storage
- CORS Configuration
- Environment Variable Support

---

# Backend API Routes

## Authentication Routes

| Method | Route            | Description         |
| ------ | ---------------- | ------------------- |
| POST   | `/auth/register` | Register a new user |
| POST   | `/auth/login`    | Login existing user |
| POST   | `/auth/logout`   | Logout current user |
| GET    | `/auth/me`       | Get logged in user  |

## Room Routes

| Method | Route    | Description          |
| ------ | -------- | -------------------- |
| GET    | `/rooms` | Fetch all chat rooms |

## Message Routes

| Method | Route               | Description         |
| ------ | ------------------- | ------------------- |
| GET    | `/messages/:roomId` | Fetch room messages |

---

# Socket.IO Events

## Client Emits

| Event         | Purpose              |
| ------------- | -------------------- |
| `joinRoom`    | Join a chat room     |
| `sendMessage` | Send a chat message  |
| `typing`      | Notify typing status |

## Server Emits

| Event            | Purpose                       |
| ---------------- | ----------------------------- |
| `receiveMessage` | Receive new message           |
| `typing`         | Receive typing indicator      |
| `systemMessage`  | Room join/leave notifications |
| `roomUsers`      | Updated online users list     |

---

# Backend Environment Variables

Create a `.env` file inside the server folder.

Example:

```env
PORT=5000
DATABASE_URL=your_database_url
SESSION_SECRET=your_secret_key
CLIENT_URL=http://localhost:5173
```

---

# Installation

## Clone the Repository

```bash
git clone <your-repository-url>
```

## Navigate to the Client Folder

```bash
cd client
```

## Install Dependencies

```bash
npm install
```

---

# Running the Project

## Start Development Server

```bash
npm run dev
```

The frontend will run on:

```bash
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file inside the client folder.

Example:

```env
VITE_API_URL=http://localhost:5000
```

For production:

```env
VITE_API_URL=https://connectnext-backend.onrender.com
```

---

# Authentication Routes

| Route             | Description   |
| ----------------- | ------------- |
| `/`               | Login Page    |
| `/register`       | Register Page |
| `/dashboard`      | Dashboard     |
| `/chat?roomId=id` | Chat Room     |

---

# Socket Events

## Client Emits

- `joinRoom`
- `sendMessage`
- `typing`

## Client Listens

- `receiveMessage`
- `typing`
- `systemMessage`
- `roomUsers`

---

# Current Functionalities

## Authentication

Users can:

- Register
- Login
- Logout
- Stay authenticated using cookies

## Dashboard

Users can:

- View available chat rooms
- Navigate into rooms
- View logged-in username

## Chat Room

Users can:

- Send messages instantly
- Receive messages in real time
- View online users
- View typing indicators
- Auto-scroll to latest messages

---

# Deployment

## Frontend

Recommended platforms:

- Vercel
- Netlify
- Render

## Backend

Currently configured for:

```bash
https://connectnext-backend.onrender.com
```

---

# Future Improvements

- Private Messaging
- Image/File Uploads
- Emoji Support
- Message Reactions
- Voice Channels
- Better UI Design
- Dark/Light Themes
- Notifications
- Mobile Responsiveness Improvements

---

# Author

Made by Brett Cooper

---

# License

This project is currently for learning and development purposes.
