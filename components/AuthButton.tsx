"use client";

import { useAuth } from "@/lib/AuthContext";

export function AuthButton() {
  const { user, loading, configured, signInWithGoogle, signOutUser } = useAuth();

  if (!configured) {
    return (
      <span
        title="Google sign-in isn't configured for this deployment yet"
        className="font-ui flex cursor-not-allowed items-center rounded-md border border-black/10 px-3 py-1.5 text-sm font-medium text-black/40"
      >
        Sign in
      </span>
    );
  }

  if (loading) {
    return <span className="font-ui px-3 text-sm text-black/40">…</span>;
  }

  if (user) {
    return (
      <button
        type="button"
        onClick={() => signOutUser()}
        title={`Signed in as ${user.email ?? user.displayName ?? "you"} — click to sign out`}
        className="font-ui flex items-center gap-2 rounded-full border border-black/10 py-1 pr-3 pl-1 text-sm font-medium text-black/70 hover:bg-black/[.04]"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element -- small avatar from a dynamic Google URL
          <img
            src={user.photoURL}
            alt=""
            referrerPolicy="no-referrer"
            className="size-6 rounded-full"
          />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full bg-black/10 text-xs">
            {(user.displayName ?? user.email ?? "?")[0].toUpperCase()}
          </span>
        )}
        <span className="hidden sm:inline">{user.displayName ?? user.email}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      className="font-ui rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-black/80"
    >
      Sign in with Google
    </button>
  );
}
