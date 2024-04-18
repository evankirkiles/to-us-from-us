import type { AstroGlobal } from "astro";

export const PREVIEW_MODE_COOKIE = "ASTRO_PREVIEW_SECRET";
export const AUTH_COOKIE = "tousfromus-auth";

export function isPreviewMode({
  cookies,
  locals: {
    runtime: { env },
  },
}: Pick<AstroGlobal, "cookies" | "locals">) {
  return (
    env.IS_PREVIEW_ENV === "yes" &&
    cookies.get(PREVIEW_MODE_COOKIE)?.value === env.SANITY_PREVIEW_SECRET
  );
}

export function isAuthenticated({
  cookies,
  locals: {
    runtime: { env },
  },
}: Pick<AstroGlobal, "cookies" | "locals">) {
  console.log(env.AUTH_SECRET);
  return cookies.get(AUTH_COOKIE)?.value === env.AUTH_SECRET;
}
