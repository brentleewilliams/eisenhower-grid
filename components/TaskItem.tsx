"use client";

import type { Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete, onDragStart }: TaskItemProps) {
  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart(task.id);
      }}
      className="group flex items-center gap-2 rounded-md border border-black/5 bg-white/80 px-3 py-2 text-sm shadow-sm cursor-grab active:cursor-grabbing"
    >
      <input
        type="checkbox"
        draggable={false}
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="size-4 shrink-0 cursor-pointer accent-current"
      />
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
