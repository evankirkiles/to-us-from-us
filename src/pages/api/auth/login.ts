import { AUTH_COOKIE } from "@/utils/constants";
import type { APIContext } from "astro";

export async function POST({
  request,
  redirect,
  cookies,
  locals: {
    runtime: { env },
  },
}: APIContext) {
  const password = (await request.formData()).get("password");
  if (password === env.AUTH_PASSWORD) {
    cookies.set(AUTH_COOKIE, env.AUTH_SECRET, {
      path: "/",
    });
    return redirect("/");
  }
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return redirect("/login");
}
