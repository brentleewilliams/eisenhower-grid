"use client";

import { useState } from "react";
import { INBOX_META, type Goal, type Task } from "@/lib/types";
import { TaskItem } from "./TaskItem";

interface InboxPanelProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: () => void;
  onUpdate: (id: string, patch: Partial<Pick<Task, "details" | "dueDate" | "linkedGoalId">>) => void;
  goalsById: Map<string, Goal>;
}

const ACCENT = "#5c5647";

export function InboxPanel({
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onDragStart,
  onDrop,
  onUpdate,
  goalsById,
}: InboxPanelProps) {
  const [draft, setDraft] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const active = tasks.filter((t) => !t.completed);

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
      className="flex flex-col rounded-lg border border-black/[.06] bg-white shadow-sm transition-shadow"
      style={{ boxShadow: isDragOver ? `0 0 0 2px ${ACCENT}` : undefined }}
    >
      <header className="flex items-center gap-2 px-3 pb-1.5 pt-3">
        <h3 className="font-display text-[13px] font-bold uppercase tracking-wide text-black/50">
          {INBOX_META.title}
        </h3>
        <span className="flex h-4 min-w-[18px] items-center justify-center rounded-full bg-black/[.06] px-1 font-ui text-[10px] font-bold text-black/50">
          {active.length}
        </span>
      </header>

      <label className="flex items-center gap-2 border-b border-black/[.06] px-3 py-2 text-sm text-black/45">
        <span
          className="flex size-4 shrink-0 items-center justify-center rounded-md border-[1.5px] border-dashed text-[10px] leading-none"
          style={{ borderColor: ACCENT, color: ACCENT }}
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
          placeholder={INBOX_META.placeholder}
          className="font-ui w-full bg-transparent text-xs placeholder:text-black/40 focus:outline-none"
        />
      </label>

      {active.length === 0 ? (
        <p className="font-ui px-3 py-4 text-center text-xs italic text-black/40">
          {INBOX_META.emptyLabel}
        </p>
      ) : (
        <ul>
          {active.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              accent={ACCENT}
              onToggle={onToggle}
              onDelete={onDelete}
              onDragStart={onDragStart}
              onUpdate={onUpdate}
              linkedGoal={task.linkedGoalId ? goalsById.get(task.linkedGoalId) : undefined}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
