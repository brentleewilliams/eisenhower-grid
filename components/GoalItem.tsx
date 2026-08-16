"use client";

import type { Goal } from "@/lib/types";

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const ACCENT = "#8a6d1f";

export function GoalItem({ goal, onToggle, onDelete }: GoalItemProps) {
  return (
    <li className="font-ui group flex items-center gap-2.5 border-b border-black/[.06] bg-white px-3 py-2 text-sm">
      <button
        type="button"
        onClick={() => onToggle(goal.id)}
        aria-pressed={goal.completed}
        aria-label={goal.completed ? "Mark as not done" : "Mark as done"}
        className="flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: goal.completed ? ACCENT : "#00000033",
          backgroundColor: goal.completed ? ACCENT : "transparent",
        }}
      >
        {goal.completed && (
          <svg viewBox="0 0 12 12" width="9" height="9" fill="none">
            <path
              d="M2.5 6.2 4.8 8.5 9.5 3.5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      <span
        className={
          "flex-1 break-words " +
          (goal.completed ? "text-black/40 line-through" : "text-black/85")
        }
      >
        {goal.title}
      </span>

      <button
        type="button"
        onClick={() => onDelete(goal.id)}
        aria-label={`Delete "${goal.title}"`}
        className="opacity-0 group-hover:opacity-100 text-black/30 hover:text-black/70 transition-opacity text-xs px-1"
      >
        ✕
      </button>
    </li>
  );
}
