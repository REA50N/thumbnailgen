import { redirect } from "next/navigation";
import ThumbnailCreator from "~/components/thumbnail-creator";
import { getSession } from "~/server/better-auth/server";

export default async function DashboardPage() {
  const authSession = await getSession();
  if (!authSession) {
    redirect("/auth");
  }

  return (
    <div className="flex h-screen max-w-full items-center justify-center px-4 md:max-w-3xl md:px-0">
      <div className="flex max-w-full flex-col gap-10">
        <ThumbnailCreator />
      </div>
    </div>
  );
}
