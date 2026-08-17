"use client";

import { useState } from "react";
import type { Goal, Task } from "@/lib/types";

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  /** Monthly items are drag sources — dragging one onto a weekly goal links them. */
  draggable?: boolean;
  /** Weekly items are drop targets for a dragged monthly goal. */
  isDropTarget?: boolean;
  onDropGoal?: (draggedMonthlyId: string) => void;
  /** Every goal item accepts a dragged task, linking it to this goal. */
  onDropTask?: (draggedTaskId: string) => void;
  /** The monthly goal this (weekly) goal is linked to, if any. */
  linkedGoal?: Goal;
  onUnlink?: () => void;
  /** Tasks linked to this goal, if any. */
  linkedTasks?: Task[];
}

const ACCENT = "#8a6d1f";

function GripIcon() {
  return (
    <svg viewBox="0 0 10 16" width="8" height="14" fill="currentColor">
      {[2, 8].map((cy) =>
        [2, 8, 14].map((cx) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.3" />)
      )}
    </svg>
  );
}

export function GoalItem({
  goal,
  onToggle,
  onDelete,
  draggable,
  isDropTarget,
  onDropGoal,
  onDropTask,
  linkedGoal,
  onUnlink,
  linkedTasks,
}: GoalItemProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <li
      draggable={draggable}
      onDragStart={
        draggable
          ? (e) => {
              e.dataTransfer.effectAllowed = "link";
              e.dataTransfer.setData("application/x-goal-id", goal.id);
            }
          : undefined
      }
      onDragOver={(e) => {
        const types = e.dataTransfer.types;
        const acceptsGoal = isDropTarget && types.includes("application/x-goal-id");
        const acceptsTask = Boolean(onDropTask) && types.includes("application/x-task-id");
        if (acceptsGoal || acceptsTask) {
          e.preventDefault();
          setIsDragOver(true);
        }
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        setIsDragOver(false);
        const draggedGoalId = e.dataTransfer.getData("application/x-goal-id");
        const draggedTaskId = e.dataTransfer.getData("application/x-task-id");
        if (isDropTarget && draggedGoalId) {
          e.preventDefault();
          onDropGoal?.(draggedGoalId);
        } else if (onDropTask && draggedTaskId) {
          e.preventDefault();
          onDropTask(draggedTaskId);
        }
      }}
      className={
        "font-ui group flex flex-col gap-1 border-b border-black/[.06] bg-white px-3 py-2 text-sm transition-shadow " +
        (draggable ? "cursor-grab active:cursor-grabbing " : "")
      }
      style={isDragOver ? { boxShadow: `inset 0 0 0 2px ${ACCENT}` } : undefined}
    >
      <div className="flex items-center gap-2">
        {draggable && (
          <span className="text-black/20 group-hover:text-black/40" aria-hidden>
            <GripIcon />
          </span>
        )}

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
        <div className={"flex items-center gap-1 " + (draggable ? "ml-[22px]" : "ml-[26px]")}>
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

      {linkedTasks && linkedTasks.length > 0 && (
        <div className={"flex flex-wrap gap-1 " + (draggable ? "ml-[22px]" : "ml-[26px]")}>
          {linkedTasks.map((task) => (
            <span
              key={task.id}
              className="font-ui max-w-full truncate rounded-full bg-black/[.05] px-2 py-0.5 text-[10px] font-medium text-black/50"
              title={`Task: ${task.title}`}
            >
              {task.title}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
