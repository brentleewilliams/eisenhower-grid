# Eisenhower Grid

A lightweight clone of the core [Eisenhower Matrix](https://app.eisenhower.me) task
prioritization tool. Sort tasks into four quadrants by urgency and importance:

- **Do first** — urgent & important
- **Schedule** — important, not urgent
- **Delegate** — urgent, not important
- **Don't do** — neither urgent nor important

## Features (v0)

- Add, complete, and delete tasks per quadrant
- Drag and drop tasks between quadrants
- Tasks persist locally (`localStorage`) — no account or backend required

## Stack

Next.js (App Router) + React + TypeScript + Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Roadmap

Out of scope for v0, potential follow-ups: Goals view, Board (Kanban) view,
Calendar view, account sync, and other features from the original product's
paid tiers.
