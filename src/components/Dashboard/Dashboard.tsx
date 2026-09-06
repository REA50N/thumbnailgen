import { redirect } from "next/navigation";

import { getSession } from "~/server/better-auth/server";

/**
 * Signed-in account dashboard. Fetches the Better Auth session on the server
 * and redirects to /auth when there is no session.
 */

interface DashboardPost {
  id: number;
  name: string | null;
  createdAt: Date;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function timeUntil(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours < 1) return "under 1h";
  if (hours < 48) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export async function Dashboard({
  posts = [],
}: {
  posts?: DashboardPost[];
} = {}) {
  const authSession = await getSession();

  if (!authSession) {
    redirect("/auth");
  }

  const { user, session } = authSession;

  return (
    <div className="min-h-screen bg-[#0B0D10] font-[system-ui,sans-serif] text-[#E8E6E1]">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-10 flex items-center gap-2 font-mono text-xs text-[#6B7280]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#4FD1C5]" />
          <span>session active · queried {formatDateTime(new Date())}</span>
        </div>

        <div className="mb-10 flex items-center gap-4">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt=""
              className="h-14 w-14 rounded-full border border-[#22262C] object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#22262C] bg-[#14171B] font-mono text-sm text-[#9CA3AF]">
              {initials(user.name)}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#F5F4F1]">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 font-mono text-sm text-[#9CA3AF]">
              <span>{user.email}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] tracking-wide uppercase ${
                  user.emailVerified
                    ? "bg-[#4FD1C5]/10 text-[#4FD1C5]"
                    : "bg-[#F2B84B]/10 text-[#F2B84B]"
                }`}
              >
                {user.emailVerified ? "verified" : "unverified"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-[#22262C] bg-[#111418] p-5">
            <h2 className="mb-4 font-mono text-xs tracking-wide text-[#6B7280] uppercase">
              Account
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#9CA3AF]">Member since</dt>
                <dd className="font-mono text-[#E8E6E1]">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#9CA3AF]">Email status</dt>
                <dd className="font-mono text-[#E8E6E1]">
                  {user.emailVerified ? "verified" : "pending"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-[#22262C] bg-[#111418] p-5">
            <h2 className="mb-4 font-mono text-xs tracking-wide text-[#6B7280] uppercase">
              Current session
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-[#9CA3AF]">Signed in</dt>
                <dd className="font-mono text-[#E8E6E1]">
                  {formatDateTime(session.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-[#9CA3AF]">Expires in</dt>
                <dd className="font-mono text-[#E8E6E1]">
                  {timeUntil(session.expiresAt)}
                </dd>
              </div>
              {session.ipAddress ? (
                <div className="flex items-center justify-between">
                  <dt className="text-[#9CA3AF]">IP address</dt>
                  <dd className="font-mono text-[#E8E6E1]">
                    {session.ipAddress}
                  </dd>
                </div>
              ) : null}
            </dl>
          </section>

          <section className="rounded-lg border border-[#22262C] bg-[#111418] p-5 sm:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-mono text-xs tracking-wide text-[#6B7280] uppercase">
                Recent posts
              </h2>
              <span className="font-mono text-xs text-[#6B7280]">
                {posts.length} total
              </span>
            </div>
            {posts.length > 0 ? (
              <ul className="divide-y divide-[#22262C]">
                {posts.map((post) => (
                  <li
                    key={post.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <span className="text-[#E8E6E1]">
                      {post.name ?? (
                        <span className="text-[#6B7280]">untitled</span>
                      )}
                    </span>
                    <span className="font-mono text-xs text-[#6B7280]">
                      {formatDate(post.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[#6B7280]">
                No posts yet. Anything created will show up here.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
