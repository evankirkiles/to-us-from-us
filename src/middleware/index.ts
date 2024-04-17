import { isPreviewMode } from "@/utils/constants";
import { defineMiddleware, sequence } from "astro:middleware";
import { CloudflareR2Cache } from "@/lib/CloudflareR2Cache";

/**
 * The below is a middleware to reduce on unnecessary Sanity API calls from
 * crawlers visiting the preview environment. As anyone using the preview
 * environment should have dashboard access anyways, this just redirects
 * any unauthenticated users back to the studio.
 */
const previewRedirect = defineMiddleware(
  ({ request, cookies, redirect, locals }, next) => {
    // if preview mode but preview cookie not set (and it's requesting a non-api route)
    if (locals.runtime?.env.IS_PREVIEW_ENV === "yes") {
      const pathname = new URL(request.url).pathname;
      if (
        !isPreviewMode({ cookies, locals }) &&
        !["/api", "/admin"].some((prefix) => pathname.startsWith(prefix))
      ) {
        // redirect back to studio
        return redirect("/admin", 302);
      }
    }

    // return a Response or the result of calling `next()`
    return next();
  }
);

/**
 * The below is a middleware to cache page bodies using R2, much like a
 * traditional web hosting platform. This essentially allows us to practice
 * ISR with Astro's SSR mode, at the cost of the extra storage and the extra
 * network latency of getting the object. This is slower on miss, but
 * faster and cheaper on hit as it doesn't need to generate the page w/ Astro.
 * It also prevents unnecessary Sanity API calls.
 *
 * An initial version used KV as a cache, but KV is not globally consistent
 * (unlike R2). This way, changing content in Sanity immediately updates
 * content globally, but only requests from the origin once.
 */
const useCloudFlareR2Cache = defineMiddleware(
  async ({ request, locals }, next) => {
    if (!locals.runtime) return next();
    const { env, ctx } = locals.runtime;
    const { pathname } = new URL(request.url);
    // If in preview environment, don't cache
    if (locals.runtime.env.IS_PREVIEW_ENV === "yes") return next();
    // If R2 binding not present, don't cache
    if (!locals.runtime.env.R2) return next();
    // If going for API route, don't cache
    if (["/api", "/admin"].some((pref) => pathname.startsWith(pref)))
      return next();

    // Configure ISR cache
    const ISRCache = new CloudflareR2Cache({
      s3config: {
        region: "auto",
        endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
          secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
        },
      },
      R2: env.R2,
      bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      cfConfig: {
        origin: env.SANITY_PRODUCTION_URL,
        zoneId: env.CLOUDFLARE_ZONE_ID,
        apiToken: env.CLOUDFLARE_PURGE_API_TOKEN,
      },
    });

    // Attempt to read value from cache, return it if found
    const cached = await ISRCache.match(request);
    if (cached) {
      console.log(`R2 cache hit: ${pathname}`);
      return cached;
    }
    console.log(`R2 cache miss: ${pathname}`);

    // If not found, then get the response as usual
    const resp = await next();
    if (!(resp instanceof Response)) return resp;
    const body = await resp.arrayBuffer();

    // In the background, upload to R2 (clones response, waits for it, and uploads)
    ctx.waitUntil(ISRCache.put(request, new Response(body, resp)));
    resp.headers.set("Last-Modified", new Date().toUTCString());
    resp.headers.set(
      "CDN-Cache-Control",
      `public, max-age=${60 * 60 * 24 * 365}`
    );
    return new Response(body, resp);
  }
);

// Fetch cache for local development. To not run up bills.
const FETCH_CACHE = {};

/**
 * The below creates a per-request fetch cache so that we don't run duplicate
 * Sanity queries in the same Astro handler.
 */
const useFetchCache = defineMiddleware(async ({ locals }, next) => {
  locals.fetchCache = import.meta.env.DEV ? FETCH_CACHE : {};
  locals.fetchCache = {};
  locals.reqCount = 0;
  return next();
});

export const onRequest = sequence(
  ...[previewRedirect, useCloudFlareR2Cache, useFetchCache]
);
