import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const { denied } = await searchParams;

  return (
    <main className="flex min-h-svh flex-1 items-center justify-center bg-bone px-6">
      <div className="w-full max-w-sm">
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-bronze/50">
          Ocham
        </p>
        <h1 className="font-display mt-3 text-4xl text-bronze">Sign in</h1>

        {denied && (
          <p className="mt-6 border-l-2 border-bronze/40 py-2 pl-4 text-sm text-bronze/70">
            That account isn&apos;t an admin on this label.
          </p>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
