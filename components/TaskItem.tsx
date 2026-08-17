"use client";

import { useEffect, useRef, useState } from "react";
import type { Goal, Task } from "@/lib/types";

interface TaskItemProps {
  task: Task;
  accent: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, "details" | "dueDate" | "linkedGoalId">>) => void;
  /** The goal this task supports, if any. */
  linkedGoal?: Goal;
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

function NotesIcon() {
  return (
    <svg viewBox="0 0 14 14" width="11" height="11" fill="none">
      <path
        d="M2.5 2.5h9M2.5 6h9M2.5 9.5h6"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function KebabIcon() {
  return (
    <svg viewBox="0 0 4 16" width="4" height="14" fill="currentColor">
      {[2, 8, 14].map((cy) => (
        <circle key={cy} cx="2" cy={cy} r="1.4" />
      ))}
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.3 8.2 7.2 10 10.7 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
      <path
        d="M3 4.5h10M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5M4.5 4.5 5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDue(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TaskItem({
  task,
  accent,
  onToggle,
  onDelete,
  onDragStart,
  onUpdate,
  linkedGoal,
}: TaskItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [draftDetails, setDraftDetails] = useState(task.details ?? "");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasDetails = Boolean(task.details?.trim());
  const isOverdue = Boolean(task.dueDate) && !task.completed && task.dueDate! < todayISO();

  function openEditor() {
    setDraftDetails(task.details ?? "");
    setExpanded(true);
  }

  function toggleEditor() {
    if (expanded) {
      setExpanded(false);
    } else {
      openEditor();
    }
  }

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <li
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/x-task-id", task.id);
        onDragStart(task.id);
      }}
      className="font-ui group relative flex flex-col gap-1.5 border-b border-black/[.06] bg-white px-5 py-2.5 text-sm cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-2.5">
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

        <button
          type="button"
          draggable={false}
          onClick={toggleEditor}
          aria-expanded={expanded}
          className={
            "flex-1 break-words text-left " +
            (task.completed ? "text-black/40 line-through" : "text-black/85")
          }
        >
          {task.title}
        </button>

        {hasDetails && (
          <span className="shrink-0 text-black/30" aria-hidden title="Has details">
            <NotesIcon />
          </span>
        )}

        {task.dueDate && (
          <span
            className="font-ui shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={
              isOverdue
                ? { backgroundColor: "#cb18181a", color: "#cb1818" }
                : { backgroundColor: "#00000010", color: "#00000080" }
            }
          >
            {formatDue(task.dueDate)}
          </span>
        )}

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            draggable={false}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Task options"
            aria-expanded={menuOpen}
            className={
              "flex size-5 items-center justify-center rounded transition-opacity hover:bg-black/[.05] " +
              (menuOpen ? "opacity-100 text-black/70" : "opacity-0 group-hover:opacity-100 text-black/40")
            }
          >
            <KebabIcon />
          </button>

          {menuOpen && (
            <div className="font-ui absolute right-0 top-6 z-10 w-40 overflow-hidden rounded-lg border border-black/[.08] bg-white py-1 text-left shadow-lg">
              <button
                type="button"
                draggable={false}
                onClick={() => {
                  openEditor();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black/75 hover:bg-black/[.04]"
              >
                <NotesIcon /> Edit details
              </button>
              <button
                type="button"
                draggable={false}
                onClick={() => {
                  onToggle(task.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-black/75 hover:bg-black/[.04]"
              >
                <CheckCircleIcon /> {task.completed ? "Mark incomplete" : "Complete"}
              </button>
              <button
                type="button"
                draggable={false}
                onClick={() => {
                  onDelete(task.id);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 border-t border-black/[.06] px-3 py-1.5 text-xs text-[#cb1818] hover:bg-black/[.04]"
              >
                <TrashIcon /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {linkedGoal && (
        <div className="ml-[26px] flex items-center gap-1">
          <span
            className="font-ui max-w-full truncate rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: "#8a6d1f1a", color: "#8a6d1f" }}
            title={`Supports goal: ${linkedGoal.title}`}
          >
            ↳ {linkedGoal.title}
          </span>
          <button
            type="button"
            onClick={() => onUpdate(task.id, { linkedGoalId: null })}
            aria-label="Unlink from goal"
            className="text-black/25 hover:text-black/60 text-[10px]"
          >
            ✕
          </button>
        </div>
      )}

      {expanded && (
        <div className="ml-[26px] flex flex-col gap-1.5">
          <input
            type="date"
            value={task.dueDate ?? ""}
            onChange={(e) => onUpdate(task.id, { dueDate: e.target.value || null })}
            className="font-ui w-fit rounded-md border border-black/10 bg-black/[.02] px-1.5 py-0.5 text-xs text-black/70 focus:outline-none"
          />
          <textarea
            value={draftDetails}
            onChange={(e) => setDraftDetails(e.target.value)}
            onBlur={() => {
              if (draftDetails !== (task.details ?? "")) {
                onUpdate(task.id, { details: draftDetails });
              }
            }}
            placeholder="Add details…"
            rows={2}
            className="font-ui w-full resize-y rounded-md border border-black/10 bg-black/[.02] px-2 py-1.5 text-xs text-black/70 placeholder:text-black/35 focus:outline-none"
          />
        </div>
      )}
    </li>
  );
}
