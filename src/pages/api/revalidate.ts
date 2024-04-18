import type { SiteSettings } from "@/sanity";
import { resolveLinkURL, type Linkable } from "@/utils/resolveLinks";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import type { APIContext } from "astro";
import groq from "groq";
import { sanityClient } from "sanity:client";
import { type DeletedObject } from "@aws-sdk/client-s3";
import { CloudflareR2Cache } from "@/lib/CloudflareR2Cache";

type AllDocTypes = SiteSettings | Linkable;

export async function POST({
  request,
  locals: {
    runtime: { env },
  },
}: APIContext) {
  // 1. Validate the request, making sure it's from Sanity webhook
  const body = await request.text();
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) || "";
  if (!(await isValidSignature(body, signature, env.SANITY_PREVIEW_SECRET))) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid signature",
      }),
      { status: 401 },
    );
  }

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

  // 2. Parse the pages needing revalidation
  const content: AllDocTypes = JSON.parse(body);
  const references: AllDocTypes[] = await sanityClient
    .withConfig({ useCdn: false })
    .fetch(groq`*[references($id)] { _type, slug }`, { id: content._id });
  let purgeAll = false;
  const purgeUrls = new Set<string>([]);
  const items = [content, ...references];
  for (let i = 0; i < items.length && !purgeAll; i++) {
    const item = items[i]!;
    switch (item._type) {
      case "siteSettings": {
        // only do a full purge if the exact item itself has changed (not if
        // what was changed was in the navbar, for example)
        if (i !== 0) break;
        // remove cached shared requests from R2 cache
        const cacheKeyToDelete = {
          siteSettings: "_queries/settings",
        }[item._type];
        await ISRCache.delete(cacheKeyToDelete);
        purgeAll = true;
        break;
      }
      default: {
        const url = resolveLinkURL(item);
        if (url) purgeUrls.add(url);
        break;
      }
    }
  }

  // 3. If everything needs updating, clear full cache and empty the bucket
  try {
    let message = "";
    let totalDeleted: DeletedObject[] = [];
    if (purgeAll) {
      totalDeleted = (await ISRCache.deleteAll()) || [];
      message = `Purged entire cache (${totalDeleted?.length || 0} keys)`;
    } else {
      totalDeleted = (await ISRCache.deleteMany([...purgeUrls])) || [];
      message = `Purged specific URLs (${totalDeleted?.length || 0} keys)`;
    }

    // Return with success on success
    return new Response(
      JSON.stringify({
        success: true,
        message,
        purged: totalDeleted.map(({ Key }) => Key),
      }),
    );
  } catch (err) {
    // Uh-oh! Something happened.
    let name = "Unnamed error";
    let message = "<no error message>";
    let stack: string | undefined = "<no stack trace>";
    if (err instanceof Error) {
      name = err.name;
      stack = err.stack;
      message = err.message;
    }
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        errorName: name,
        message,
        stack,
      }),
      {
        status: 500,
        statusText: "Internal server error.",
      },
    );
  }
}

export async function DELETE({
  request,
  locals: {
    runtime: { env },
  },
}: APIContext) {
  // 1. Validate the request, making sure it's okay to use
  const signature = request.headers.get(SIGNATURE_HEADER_NAME) || "";
  if (signature !== env.SANITY_PREVIEW_SECRET) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Invalid signature",
      }),
      { status: 401 },
    );
  }

  // 2. Connect to the ISR cache
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

  try {
    // Perform a full cache purge
    const totalDeleted = await ISRCache.deleteAll();

    // Return with success on success
    return new Response(
      JSON.stringify({
        success: true,
        message: "Performed full cache purge.",
        purged: totalDeleted?.map(({ Key }) => Key),
      }),
    );
  } catch (err) {
    // Uh-oh! Something happened.
    let name = "Unnamed error";
    let message = "<no error message>";
    let stack: string | undefined = "<no stack trace>";
    if (err instanceof Error) {
      name = err.name;
      stack = err.stack;
      message = err.message;
    }
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        errorName: name,
        message,
      }),
      {
        status: 500,
        statusText: "Internal server error.",
      },
    );
  }
}
