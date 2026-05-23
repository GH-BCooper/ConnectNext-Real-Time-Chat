# ConnectNext

A full-stack real-time chat application built using React, TypeScript, Node.js, Express, PostgreSQL, and Socket.IO.

ConnectNext allows users to register, log in, join chat rooms, send messages instantly, view online users, and interact in real time using WebSockets.

The project consists of:

* A React + TypeScript frontend built with Vite
* A Node.js + Express backend
* PostgreSQL database integration
* Real-time communication using Socket.IO
* Session-based authentication

A real-time chat application built using React, TypeScript, Socket.IO, and Axios. ConnectNext allows users to register, log in, join chat rooms, send messages instantly, view online users, and see typing indicators in real time.

---

# Features

* User Registration & Login
* Real-Time Messaging with Socket.IO
* Multiple Chat Rooms
* Online Users Tracking
* Typing Indicators
* Auto Scroll to Latest Messages
* Persistent Authentication using Cookies
* Responsive Frontend Structure

---

# Tech Stack

## Frontend

* React
* TypeScript
* React Router DOM
* Axios
* Socket.IO Client
* Vite

## Backend

* Node.js
* Express.js
* Socket.IO
* Authentication APIs

---

# Project Structure

```bash
project-root/
│
├── client/
│   │
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   └── RoomChat.tsx
│   │   │
│   │   ├── socket/
│   │   │   └── socket.ts
│   │   │
│   │   ├── styles/
│   │   │   └── global.css
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── server/
│   │
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── roomRoutes.js
│   │   └── messageRoutes.js
│   │
│   ├── db.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

# Backend Features

* Express.js REST API
* PostgreSQL Database Integration
* Session-Based Authentication
* Socket.IO Real-Time Communication
* Room-Based Chat System
* Online Users Tracking
* Typing Indicators
* Persistent Message Storage
* CORS Configuration
* Environment Variable Support

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

* `joinRoom`
* `sendMessage`
* `typing`

## Client Listens

* `receiveMessage`
* `typing`
* `systemMessage`
* `roomUsers`

---

# Current Functionalities

## Authentication

Users can:

* Register
* Login
* Logout
* Stay authenticated using cookies

## Dashboard

Users can:

* View available chat rooms
* Navigate into rooms
* View logged-in username

## Chat Room

Users can:

* Send messages instantly
* Receive messages in real time
* View online users
* View typing indicators
* Auto-scroll to latest messages

---

# Deployment

## Frontend

Recommended platforms:

* Vercel
* Netlify
* Render

## Backend

Currently configured for:

```bash
https://connectnext-backend.onrender.com
```

---

# Future Improvements

* Private Messaging
* Image/File Uploads
* Emoji Support
* Message Reactions
* Voice Channels
* Better UI Design
* Dark/Light Themes
* Notifications
* Mobile Responsiveness Improvements

---

# Author

Made by Brett Cooper

---

# License

This project is currently for learning and development purposes.
