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
  onUpdate: (id: string, patch: Partial<Pick<Task, "details" | "dueDate">>) => void;
}

export function QuadrantColumn({
  meta,
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onDragStart,
  onDrop,
  onUpdate,
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
    <section
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={() => {
        setIsDragOver(false);
        onDrop();
      }}
      className="relative flex min-h-[280px] flex-col rounded-lg border border-black/[.06] bg-white pl-1 shadow-sm transition-shadow"
      style={{
        boxShadow: isDragOver ? `0 0 0 2px ${meta.accent}` : undefined,
      }}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-0 w-1 rounded-l-lg"
        style={{ backgroundColor: meta.accent }}
      />
      <div className="flex flex-1 flex-col bg-white">
        <header
          className="flex min-h-[50px] items-center gap-2.5 rounded-tr-lg px-5 py-3 text-white"
          style={{ backgroundColor: meta.accent }}
        >
          <h2 className="font-display text-[18px] font-bold leading-[1.2]">
            {meta.title}
          </h2>
          <span
            className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-white px-1.5 font-ui text-xs font-bold"
            style={{ color: meta.accent }}
          >
            {active.length}
          </span>
          <span className="font-ui ml-auto text-xs text-white/80">
            {meta.subtitle}
          </span>
        </header>

        <label className="flex items-center gap-2.5 border-b border-black/[.06] px-5 py-2.5 text-sm text-black/45">
          <span
            className="flex size-[18px] shrink-0 items-center justify-center rounded-md border-[1.5px] border-dashed text-[11px] leading-none"
            style={{ borderColor: meta.ink, color: meta.ink }}
            aria-hidden
          >
            +
          </span>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder={meta.placeholder}
            className="font-ui w-full bg-transparent placeholder:text-black/40 focus:outline-none"
          />
        </label>

        {active.length === 0 ? (
          <p className="font-ui flex flex-1 items-center justify-center py-8 text-center text-xs italic text-black/40">
            {meta.emptyLabel}
          </p>
        ) : (
          <ul>
            {active.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                accent={meta.ink}
                onToggle={onToggle}
                onDelete={onDelete}
                onDragStart={onDragStart}
                onUpdate={onUpdate}
              />
            ))}
          </ul>
        )}

        {completed.length > 0 && (
          <div className="font-ui px-5 py-2">
            <button
              type="button"
              onClick={() => setShowCompleted((v) => !v)}
              className="rounded-full bg-black/[.04] px-3 py-1 text-xs font-medium text-black/50 hover:bg-black/[.07] hover:text-black/80"
            >
              {showCompleted ? "Hide" : "Show"} {completed.length} completed{" "}
              {completed.length === 1 ? "task" : "tasks"}
            </button>
            {showCompleted && (
              <ul className="mt-1">
                {completed.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    accent={meta.ink}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onDragStart={onDragStart}
                    onUpdate={onUpdate}
                  />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
