"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "~/server/better-auth/client";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: authError } =
      mode === "sign-in"
        ? await authClient.signIn.email({ email, password })
        : await authClient.signUp.email({ email, password, name: email });

    setPending(false);

    if (authError) {
      setError(authError.message ?? "Something went wrong.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">
          {mode === "sign-in" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {mode === "sign-in"
            ? "Welcome back. Sign in to continue."
            : "Get started with a new account."}
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            className="rounded-md border border-neutral-300 px-3 py-2"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            className="rounded-md border border-neutral-300 px-3 py-2"
            type="password"
            name="password"
            autoComplete={
              mode === "sign-in" ? "current-password" : "new-password"
            }
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending
            ? "Please wait..."
            : mode === "sign-in"
              ? "Sign in"
              : "Sign up"}
        </button>
      </form>

      <button
        className="text-left text-sm text-neutral-600 underline"
        type="button"
        onClick={() => {
          setError(null);
          setMode(mode === "sign-in" ? "sign-up" : "sign-in");
        }}
      >
        {mode === "sign-in"
          ? "Need an account? Sign up"
          : "Already have an account? Sign in"}
      </button>

      <Link className="text-sm text-neutral-600 underline" href="/">
        Back home
      </Link>
    </main>
  );
}
