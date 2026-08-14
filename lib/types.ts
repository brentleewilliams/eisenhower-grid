export type QuadrantId = "do-first" | "schedule" | "delegate" | "dont-do";

export interface Task {
  id: string;
  title: string;
  quadrant: QuadrantId;
  completed: boolean;
  createdAt: number;
}

export interface QuadrantMeta {
  id: QuadrantId;
  title: string;
  subtitle: string;
  placeholder: string;
  emptyLabel: string;
  accent: string;
  accentSoft: string;
}

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "do-first",
    title: "Do first",
    subtitle: "Urgent & important",
    placeholder: "Add an urgent and important task",
    emptyLabel: "Nothing urgent and important right now.",
    accent: "#4d7c0f",
    accentSoft: "#ecf6df",
  },
  {
    id: "schedule",
    title: "Schedule",
    subtitle: "Important, not urgent",
    placeholder: "Add an important task to schedule",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#1d4ed8",
    accentSoft: "#e6edfd",
  },
  {
    id: "delegate",
    title: "Delegate",
    subtitle: "Urgent, not important",
    placeholder: "Add a task to delegate",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#c2650a",
    accentSoft: "#fbead9",
  },
  {
    id: "dont-do",
    title: "Don't do",
    subtitle: "Neither urgent nor important",
    placeholder: "Add a temptation to ignore",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#b91c1c",
    accentSoft: "#fbe4e2",
  },
];
