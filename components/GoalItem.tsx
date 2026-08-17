"use client";

import { useState } from "react";
import type { Goal } from "@/lib/types";

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  /** Monthly items are drag sources — dragging one onto a weekly goal links them. */
  draggable?: boolean;
  /** Weekly items are drop targets for a dragged monthly goal. */
  isDropTarget?: boolean;
  onDropGoal?: (draggedMonthlyId: string) => void;
  /** The monthly goal this (weekly) goal is linked to, if any. */
  linkedGoal?: Goal;
  onUnlink?: () => void;
}

const ACCENT = "#8a6d1f";

export function GoalItem({
  goal,
  onToggle,
  onDelete,
  draggable,
  isDropTarget,
  onDropGoal,
  linkedGoal,
  onUnlink,
}: GoalItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <li
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              e.dataTransfer.effectAllowed = "link";
              e.dataTransfer.setData("text/plain", goal.id);
            }
          : undefined
      }
      onDragOver={
        isDropTarget
          ? (e) => {
              e.preventDefault();
              setIsDragOver(true);
            }
          : undefined
      }
      onDragLeave={isDropTarget ? () => setIsDragOver(false) : undefined}
      onDrop={
        isDropTarget
          ? (e) => {
              e.preventDefault();
              setIsDragOver(false);
              const draggedId = e.dataTransfer.getData("text/plain");
              if (draggedId) onDropGoal?.(draggedId);
            }
          : undefined
      }
      className={
        "font-ui group flex flex-col gap-1 border-b border-black/[.06] bg-white px-3 py-2 text-sm transition-shadow " +
        (draggable ? "cursor-grab active:cursor-grabbing " : "")
      }
      style={isDragOver ? { boxShadow: `inset 0 0 0 2px ${ACCENT}` } : undefined}
    >
      <div className="flex items-center gap-2.5">
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
      </div>

      {linkedGoal && (
        <div className="ml-[26px] flex items-center gap-1">
          <span
            className="font-ui max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${ACCENT}1a`, color: ACCENT }}
            title={`Supports monthly goal: ${linkedGoal.title}`}
          >
            ↳ {linkedGoal.title}
          </span>
          <button
            type="button"
            onClick={onUnlink}
            aria-label="Unlink from monthly goal"
            className="text-black/25 hover:text-black/60 text-[10px]"
          >
            ✕
          </button>
        </div>
      )}
    </li>
  );
}
