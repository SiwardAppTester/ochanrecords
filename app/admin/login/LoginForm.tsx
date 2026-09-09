"use client";

import { useActionState } from "react";
import { signIn, type ActionResult } from "../actions";

const FIELD =
  "w-full border-0 border-b border-bronze/25 bg-transparent px-0 pb-2 pt-1 " +
  "text-lg text-bronze placeholder:text-bronze/30 transition-colors " +
  "focus:border-bronze focus:outline-none focus:ring-0";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    signIn,
    null,
  );

  return (
    <form action={formAction} className="mt-10">
      <label className="block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze/50">
          Email
        </span>
        <input
          required
          type="email"
          name="email"
          autoComplete="username"
          className={`${FIELD} mt-2`}
        />
      </label>

      <label className="mt-8 block">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-bronze/50">
          Password
        </span>
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          className={`${FIELD} mt-2`}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="mt-10 border-b border-bronze/50 pb-1 font-display text-2xl text-bronze transition-colors hover:border-bronze disabled:cursor-wait disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Sign in →"}
      </button>

      {state && !state.ok && (
        <p className="mt-6 border-l-2 border-bronze/40 py-2 pl-4 text-sm text-bronze/70">
          {state.message}
        </p>
      )}
    </form>
  );
}
