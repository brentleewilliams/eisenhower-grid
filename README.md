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
- Chat assistant (bottom-right) that can add, move, complete, and delete
  tasks and goals on your behalf via natural language

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS + Firebase
(Auth + Firestore, only used when signed in) + OpenAI (chat assistant).

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

## Setting up the chat assistant (optional)

The assistant button (bottom-right) works once `OPENAI_API_KEY` is set — without
it, the rest of the app still works, but the chat panel will show an error when
you send a message.

1. Copy `.env.local.example` to `.env.local` (if you haven't already) and set
   `OPENAI_API_KEY` to a key from [platform.openai.com](https://platform.openai.com/api-keys).
2. If deploying, add the same env var in your host's project settings and redeploy.

The assistant runs on OpenAI's `gpt-5.6-luna` model via the Responses API
(`app/api/chat/route.ts`), with function tools for adding/moving/completing/
deleting tasks and goals. Tool calls are executed client-side against the same
`useTasks`/`useGoals` hooks the rest of the UI uses, so changes sync the same
way (`localStorage` or Firestore) regardless of whether they came from the UI
or the chat.

## Roadmap

Out of scope for now, potential follow-ups: quarterly goals, Board (Kanban)
view, Calendar view, a real Settings feature (currently just a disabled nav
item), and other features from the original product's paid tiers.
