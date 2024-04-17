/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="@sanity/astro/module" />
/// <reference types="vite/client" />
/// <reference types='astro-dynamic-import/client' />

declare module "sanity:client" {
  export const sanityClient: import("@sanity/client").SanityClient;
}

declare module "sanity:studio" {
  export const studioConfig: import("sanity").Config;
}

type R2Bucket = import("@cloudflare/workers-types/experimental").R2Bucket;

interface CloudFlareEnvBindings {
  readonly IS_PREVIEW_ENV: string;
  readonly SANITY_PRODUCTION_URL: string;
  readonly CLOUDFLARE_ZONE_ID: string;
  readonly CLOUDFLARE_ACCOUNT_ID: string;
  readonly CLOUDFLARE_PURGE_API_TOKEN: string;
  readonly CLOUDFLARE_R2_ACCESS_KEY_ID: string;
  readonly CLOUDFLARE_R2_SECRET_ACCESS_KEY: string;
  readonly CLOUDFLARE_R2_BUCKET_NAME: string;
  readonly SANITY_API_READ_TOKEN: string;
  readonly SANITY_PREVIEW_SECRET: string;
  readonly R2: R2Bucket;
}

interface ImportMeta {
  readonly env: ImportMetaEnv & CloudFlareEnvBindings;
}

type Runtime = import("@astrojs/cloudflare").Runtime<CloudFlareEnvBindings>;

declare namespace App {
  interface Locals extends Runtime {
    fetchCache: { [key: string]: any };
    reqCount: number;
  }
}
