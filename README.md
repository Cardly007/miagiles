# OnlyJam

**OnlyJam** is a collaborative live music-listening platform designed to connect people through shared audio experiences. Whether you are hosting a digital party, a focused study session, or just want to listen to music simultaneously with friends, OnlyJam ensures everyone is on the same beat.

## Core Concept
OnlyJam allows a **Host** to create a live session (a "Jam") that **Guests** can join. Guests can search for music and add it to a shared Live Queue. The core magic of OnlyJam is its **Jam Sync** technology, which ensures that playback starts and stays perfectly synchronized across all connected devices, down to the millisecond, no matter when a guest joins.

## Features

### 🎵 Free Music Streaming (Audius Integration)
Search and stream thousands of tracks directly within the app using the **Audius Public API**.
- No accounts or API keys required.
- Integrated backend proxy for fast, secure, and normalized search results mapping directly to the live queue.

### ⚡ Jam Sync (Precise Audio Synchronization)
Experience true synchronized listening.
- The Host acts as the "Time Master", setting the `startTime` when a track begins.
- Guests' devices calculate the precise time offset and utilize the browser's native **Audio Context API** to join the stream exactly where it currently is.
- No more counting down "3, 2, 1, Play!".

### 🛡️ Host Moderation & Suggestion Mode
Keep the vibe exactly how you want it with robust moderation tools designed for the Host.
- **Suggestion Mode:** When activated, any track added by a guest is placed in a `PENDING` state. It won't play until the Host explicitly approves it.
- **Host Panel:** A dedicated interface for the Host to manage settings, approve/reject pending track requests, and monitor the room.

### 🚫 User Banning System
Maintain a safe and enjoyable environment.
- Hosts can view the list of connected users and instantly ban disruptive guests.
- Banning immediately disconnects the user's socket connection and prevents them from re-joining the specific Jam session.

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Socket.io-client, Audio Context API.
- **Backend:** Node.js, Express, Socket.io (WebSockets).
- **Database:** SQLite with **Prisma ORM** (Typesafe queries and schema migrations).

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Initialize Database:**
   ```bash
   npx prisma@6 db push
   npx prisma@6 generate
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## License
MIT
