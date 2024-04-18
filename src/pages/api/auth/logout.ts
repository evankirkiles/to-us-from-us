import { AUTH_COOKIE } from "@/utils/constants";
import type { APIContext } from "astro";

export async function GET({ redirect, cookies }: APIContext) {
  cookies.delete(AUTH_COOKIE, { path: "/" });
  return redirect("/login");
}
