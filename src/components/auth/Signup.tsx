import { getSession } from "~/server/better-auth/server";

export async function Signup() {
  const authSession = await getSession();

  return <div>Signin</div>;
}
