import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { sanityClient } from "sanity:client";
import type { APIContext } from "astro";
import { PREVIEW_MODE_COOKIE } from "@/utils/constants";

export async function GET({
  request,
  redirect,
  cookies,
  locals: {
    runtime: { env },
  },
}: APIContext) {
  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    sanityClient.withConfig({
      // This has to be set in CloudFlare's project settings
      token: env.SANITY_API_READ_TOKEN,
    }),
    request.url,
    true,
  );
  if (!isValid) {
    cookies.delete(PREVIEW_MODE_COOKIE, { path: "/" });
    return new Response("Invalid secret", { status: 401 });
  }
  cookies.set(PREVIEW_MODE_COOKIE, env.SANITY_PREVIEW_SECRET, {
    path: "/",
  });
  return redirect(redirectTo);
}
