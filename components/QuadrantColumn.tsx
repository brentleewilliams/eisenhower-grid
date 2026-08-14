"use client";

import { useState } from "react";
import type { QuadrantMeta, Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

interface QuadrantColumnProps {
  meta: QuadrantMeta;
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: () => void;
}

export function QuadrantColumn({
  meta,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onDragStart,
  onDrop,
}: QuadrantColumnProps) {
  const [draft, setDraft] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const active = tasks.filter((t) => !t.completed);
  const completed = tasks.filter((t) => t.completed);
  const [showCompleted, setShowCompleted] = useState(false);

  function submit() {
    onAdd(draft);
    setDraft("");
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        onDrop();
      }}
      className={
        "flex flex-col rounded-xl border overflow-hidden transition-colors" +
        (isDragOver ? " ring-2 ring-offset-2" : "")
      }
      style={{
        borderColor: meta.accent + "33",
        backgroundColor: meta.accentSoft,
      }}
    >
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: meta.accent }}
      >
        <div>
          <h2 className="font-semibold leading-tight">{meta.title}</h2>
          <p className="text-xs text-white/80">{meta.subtitle}</p>
        </div>
        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
          {active.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 p-3 flex-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
          placeholder={meta.placeholder}
          className="w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm placeholder:text-black/40 focus:outline-none focus:ring-2"
          style={{ outlineColor: meta.accent }}
        />

        {active.length === 0 ? (
          <p className="py-6 text-center text-xs italic text-black/40">
            {meta.emptyLabel}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {active.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onDelete={onDelete}
                onDragStart={onDragStart}
              />
            ))}
          </ul>
        )}

        {completed.length > 0 && (
          <div className="mt-1">
            <button
              type="button"
              onClick={() => setShowCompleted((v) => !v)}
              className="text-xs font-medium text-black/50 hover:text-black/80"
            >
              {showCompleted ? "Hide" : "Show"} {completed.length} completed{" "}
              {completed.length === 1 ? "task" : "tasks"}
            </button>
            {showCompleted && (
              <ul className="mt-2 flex flex-col gap-2">
                {completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onDragStart={onDragStart}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
