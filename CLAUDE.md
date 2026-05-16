# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Smart Zelenilo** is a Progressive Web App (PWA) kanban/task management tool for "OJ Zelenilo, Komunalni Servis d.o.o. Rovinj". The UI is in Croatian. It is a mobile-first, offline-capable single-page application backed by Firebase.

## Commands

### Frontend
No build step — the frontend is a single self-contained `index.html`. Serve it directly (e.g. via Firebase Hosting or any static server):

```powershell
# Local dev server (if firebase-tools installed globally)
firebase serve --only hosting
```

### Firebase Functions
```powershell
cd functions
npm install               # install dependencies
firebase deploy --only functions   # deploy cloud functions
firebase deploy           # deploy everything (hosting + functions)
```

### Firebase CLI
```powershell
firebase login            # authenticate
firebase use zelenilo-rovinj   # select project (already set in .firebaserc)
```

## Architecture

### Frontend (`index.html`)
The entire frontend lives in a **single HTML file** (~42 KB). It uses **vanilla JS** and **Firebase SDK v10** (loaded from CDN). There is no bundler, no framework, no npm dependencies.

Key sections inside `index.html`:
- **`USERS` object** — hardcoded user accounts (username → name, avatar initials, admin flag). All users share one password.
- **Firebase init** — config + anonymous auth + Realtime Database listeners wired at the top of the `<script>` block.
- **`tasks` / `archivedTasks` in-memory maps** — synced from Firebase RTDB and mirrored to `localStorage` for offline use.
- **Drag & drop** — implemented for both desktop (mouse) and mobile (touch) events directly on kanban columns.
- **File attachments** — stored as base64 Data URLs embedded directly in task objects (no separate storage bucket used).
- **Push subscription** — client subscribes via `navigator.serviceWorker` + `PushManager`, saves the subscription object to `zelenilo/push_subs/{userId}` in RTDB.

### Service Worker (`sw.js`)
Cache-first strategy (cache v2). Caches `index.html`, `manifest.json`, and icon files. Excludes Firebase API/CDN URLs. Handles background push message display.

### Firebase Realtime Database Structure
```
zelenilo/
  kanban/         — active tasks (keyed by taskId)
  arhiva/         — archived tasks
  push_subs/      — push notification subscriptions per user
  notifications/  — ephemeral: Cloud Function trigger node (deleted after processing)
```

### Cloud Functions (`functions/index.js`)
Single function: `onValueCreated` trigger on `/zelenilo/notifications/{notifId}`.
- Reads all entries from `zelenilo/push_subs`
- Sends Web Push (via `web-push` library) to every subscriber except the task creator
- Removes expired subscriptions (HTTP 410 responses)
- Deletes the notification node after processing

Deploying requires **Node.js 24** runtime (set in `firebase.json`).

## Key Patterns

- **Optimistic UI** — tasks are written to the DOM and `localStorage` immediately; Firebase write happens in parallel.
- **Auth flow** — user enters username/password → validated against `USERS` + hardcoded password → Firebase anonymous `signInAnonymously()` is called → RTDB listeners activate.
- **Archive vs. delete** — tasks are never permanently deleted from the UI; they move to `zelenilo/arhiva` via the archive action.
- **Notification trigger** — after a new task is saved to RTDB, the client also writes a small object to `zelenilo/notifications/` which triggers the Cloud Function.
