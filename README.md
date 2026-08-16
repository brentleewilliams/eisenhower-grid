# Eisenhower Grid

A lightweight clone of the core [Eisenhower Matrix](https://app.eisenhower.me) task
prioritization tool. Sort tasks into four quadrants by urgency and importance:

- **Do first** — urgent & important
- **Schedule** — important, not urgent
- **Delegate** — urgent, not important
- **Don't do** — neither urgent nor important

## Features

- Add, complete, and delete tasks per quadrant
- Drag and drop tasks between quadrants
- Weekly and monthly goals panel alongside the matrix
- Sign in with Google to sync tasks and goals across devices (optional —
  works fully offline with `localStorage` if you never sign in)

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS + Firebase
(Auth + Firestore, only used when signed in).

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Setting up Google sign-in / sync (optional)

The app works fully without this — it just won't sync across devices.

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication → Sign-in method** → enable **Google**.
3. **Firestore Database** → create a database, then paste the contents of
   [`firestore.rules`](./firestore.rules) into **Firestore → Rules** and publish.
4. **Project settings → General → Your apps** → add a Web app, copy the
   `firebaseConfig` values.
5. Copy `.env.local.example` to `.env.local` and fill in the six
   `NEXT_PUBLIC_FIREBASE_*` values from step 4. (These are public/client-safe
   config values, not secrets.)
6. **Authentication → Settings → Authorized domains** → add your deployment
   domain (e.g. `your-app.vercel.app`).
7. If deploying, add the same env vars in your host's project settings
   (e.g. Vercel → Project → Settings → Environment Variables) and redeploy.

Each signed-in user's tasks and goals live in a single Firestore document at
`users/{uid}` (`tasks` and `goals` fields). On first sign-in on a device, any
local data is copied up to Firestore as the starting point; after that,
Firestore is the source of truth.

## Roadmap

Out of scope for now, potential follow-ups: quarterly goals, Board (Kanban)
view, Calendar view, a real Settings feature (currently just a disabled nav
item), and other features from the original product's paid tiers.
