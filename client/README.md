# ConnectNext

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
client/
│
├── src/
│   ├── api/
│   │   └── axios.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── RoomChat.tsx
│   │
│   ├── socket/
│   │   └── socket.ts
│   │
│   ├── styles/
│   │   └── global.css
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── public/
├── index.html
├── package.json
└── vite.config.ts
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
