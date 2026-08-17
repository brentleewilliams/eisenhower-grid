"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/lib/useChat";

const ACCENT = "#3d3226";

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none">
      <path
        d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13H9l-3.2 2.6a.5.5 0 0 1-.8-.4V13h-.5A1.5 1.5 0 0 1 3 11.5v-6Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, sendMessage, sending, error } = useChat();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function submit() {
    if (!draft.trim() || sending) return;
    sendMessage(draft);
    setDraft("");
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat"
          className="fixed bottom-4 right-4 z-40 flex size-12 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 sm:right-6"
          style={{ backgroundColor: ACCENT }}
        >
          <ChatIcon />
        </button>
      )}

      {/* Backdrop — click to dismiss, mainly useful on narrow viewports where the drawer is full width */}
      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={
          "fixed inset-0 z-40 bg-black/20 transition-opacity duration-300 sm:hidden " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />

      <div
        role="dialog"
        aria-label="Assistant chat"
        aria-hidden={!open}
        className={
          "fixed inset-y-0 right-0 z-50 flex h-dvh w-full max-w-sm flex-col border-l border-black/[.08] bg-white shadow-2xl transition-transform duration-300 ease-in-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div
          className="flex shrink-0 items-center justify-between px-4 py-3"
          style={{ backgroundColor: ACCENT }}
        >
          <span className="font-display text-sm font-bold tracking-tight text-white">
            Assistant
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            className="text-white/70 transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        <div ref={scrollRef} className="font-ui flex-1 space-y-3 overflow-y-auto px-4 py-4 text-sm">
          {messages.length === 0 && (
            <p className="px-1 text-xs italic text-black/40">
              Ask me to add, move, complete, or clean up tasks and goals — e.g. &ldquo;add
              &lsquo;call the dentist&rsquo; to do first&rdquo; or &ldquo;what&rsquo;s on my
              plate this week?&rdquo;
            </p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                "max-w-[85%] whitespace-pre-wrap break-words rounded-lg px-3 py-2 " +
                (m.role === "user" ? "ml-auto text-white" : "mr-auto bg-black/[.05] text-black/85")
              }
              style={m.role === "user" ? { backgroundColor: ACCENT } : undefined}
            >
              {m.text}
            </div>
          ))}
          {sending && <div className="mr-auto text-xs italic text-black/40">Thinking…</div>}
          {error && <div className="mr-auto text-xs text-red-600">{error}</div>}
        </div>

        <div className="flex shrink-0 items-center gap-2 border-t border-black/[.06] px-3 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
            placeholder="Message the assistant"
            className="font-ui w-full bg-transparent text-sm placeholder:text-black/40 focus:outline-none"
            disabled={sending}
          />
          <button
            type="button"
            onClick={submit}
            disabled={sending || !draft.trim()}
            aria-label="Send"
            className="font-ui shrink-0 rounded-md px-2.5 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            style={{ backgroundColor: ACCENT }}
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
