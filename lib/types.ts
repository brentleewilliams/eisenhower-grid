export type QuadrantId = "do-first" | "schedule" | "delegate" | "dont-do";

export interface Task {
  id: string;
  title: string;
  quadrant: QuadrantId;
  completed: boolean;
  createdAt: number;
}

export type GoalPeriod = "weekly" | "monthly";

export interface Goal {
  id: string;
  title: string;
  period: GoalPeriod;
  completed: boolean;
  createdAt: number;
}

export interface GoalPeriodMeta {
  id: GoalPeriod;
  title: string;
  placeholder: string;
  emptyLabel: string;
}

export const GOAL_PERIODS: GoalPeriodMeta[] = [
  {
    id: "weekly",
    title: "Weekly goals",
    placeholder: "Add a goal for this week",
    emptyLabel: "No weekly goals yet.",
  },
  {
    id: "monthly",
    title: "Monthly goals",
    placeholder: "Add a goal for this month",
    emptyLabel: "No monthly goals yet.",
  },
];

export interface QuadrantMeta {
  id: QuadrantId;
  title: string;
  subtitle: string;
  placeholder: string;
  emptyLabel: string;
  /** Saturated color for the header bar and accent stripe. */
  accent: string;
  /** Darker variant of `accent`, used for icons/borders drawn on a white background. */
  ink: string;
}

export const QUADRANTS: QuadrantMeta[] = [
  {
    id: "do-first",
    title: "Do first",
    subtitle: "Urgent & important",
    placeholder: "Add an urgent and important task",
    emptyLabel: "Nothing urgent and important right now.",
    accent: "#8fc42a",
    ink: "#4f7a0e",
  },
  {
    id: "schedule",
    title: "Schedule",
    subtitle: "Less urgent, but important",
    placeholder: "Add an important task to schedule",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#4a90e2",
    ink: "#1f5fa8",
  },
  {
    id: "delegate",
    title: "Delegate",
    subtitle: "Urgent, but less important",
    placeholder: "Add a task to delegate",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#f9a825",
    ink: "#a76f00",
  },
  {
    id: "dont-do",
    title: "Don't do",
    subtitle: "Neither urgent nor important",
    placeholder: "Add a temptation to ignore",
    emptyLabel: "Nothing here — that's allowed.",
    accent: "#cb1818",
    ink: "#8a0c0c",
  },
];
