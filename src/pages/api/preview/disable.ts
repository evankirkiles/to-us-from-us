import { PREVIEW_MODE_COOKIE } from "@/utils/constants";
import type { APIContext } from "astro";

// export async
export async function GET({ redirect, cookies, url }: APIContext) {
  const redirectTo = url.searchParams.get("redirect") || "/";
  cookies.delete(PREVIEW_MODE_COOKIE, { path: "/" });
  return redirect(redirectTo);
}
