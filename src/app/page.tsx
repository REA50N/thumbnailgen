import Link from "next/link";

import { Dashboard } from "~/components/Dashboard/Dashboard";
import { GoogleAuthTest } from "~/components/GoogleAuthTest";
import { Sidebar } from "~/components/Sidebar/Sidebar";
import { Button } from "~/components/ui/button";
import { getSession } from "~/server/better-auth/server";

export default async function Home() {
  const authSession = await getSession();

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <section className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-4">
        <h1 className="text-xl font-semibold">Google OAuth test</h1>
        <p className="text-sm text-neutral-500">
          {authSession
            ? `Signed in as ${authSession.user.email}`
            : "Not signed in"}
        </p>
        <GoogleAuthTest signedIn={Boolean(authSession)} />
        {authSession ? (
          <Link className="text-sm underline" href="/dashboard">
            Open dashboard
          </Link>
        ) : null}
      </section>
      <Sidebar />
      <Button>
        <Link className="text-sm underline" href="/dashboard">
          Open dashboard
        </Link>
      </Button>
    </main>
  );
}
