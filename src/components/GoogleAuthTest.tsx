"use client";

import { authClient } from "~/server/better-auth/client";

export function GoogleAuthTest({ signedIn }: { signedIn: boolean }) {
  async function signInWithGoogle() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  }

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.reload();
        },
      },
    });
  }

  if (signedIn) {
    return (
      <button
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
        type="button"
        onClick={signOut}
      >
        Sign out
      </button>
    );
  }

  return (
    <button
      className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white"
      type="button"
      onClick={signInWithGoogle}
    >
      Sign in with Google
    </button>
  );
}
