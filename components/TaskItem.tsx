"use client";

import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  accent: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
}

function GripIcon() {
  return (
    <svg viewBox="0 0 10 16" width="8" height="14" fill="currentColor">
      {[2, 8].map((cy) =>
        [2, 8, 14].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" />)
      )}
    </svg>
  );
}

export function TaskItem({ task, accent, onToggle, onDelete, onDragStart }: TaskItemProps) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      className="font-ui group flex items-center gap-2.5 border-b border-black/[.06] bg-white px-5 py-2.5 text-sm cursor-grab active:cursor-grabbing"
    >
      <span className="text-black/20 group-hover:text-black/40" aria-hidden>
        <GripIcon />
      </span>

      <button
        type="button"
        draggable={false}
        onClick={() => onToggle(task.id)}
        aria-pressed={task.completed}
        aria-label={task.completed ? "Mark as not done" : "Mark as done"}
        className="flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors"
        style={{
          borderColor: task.completed ? accent : "#00000033",
          backgroundColor: task.completed ? accent : "transparent",
        }}
      >
        {task.completed && (
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
          (task.completed ? "text-black/40 line-through" : "text-black/85")
        }
      >
        {task.title}
      </span>

      <button
        type="button"
        draggable={false}
        onClick={() => onDelete(task.id)}
        aria-label={`Delete "${task.title}"`}
        className="opacity-0 group-hover:opacity-100 text-black/30 hover:text-black/70 transition-opacity text-xs px-1"
      >
        ✕
      </button>
    </li>
  );
}
