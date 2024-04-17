import sanityIntegration from "@sanity/astro";
import { defineConfig, passthroughImageService } from "astro/config";
import dynamicImport from "astro-dynamic-import";
import addsToHead from "astro-adds-to-head";
import icon from "astro-icon";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";
import { loadEnv } from "vite";
import robotsTxt from "astro-robots-txt";

const env = loadEnv("", (process as any).cwd(), "") as ImportMetaEnv;

// https://astro.build/config
export default defineConfig({
  site: env.SANITY_PRODUCTION_URL,
  devToolbar: { enabled: false },
  integrations: [
    sanityIntegration({
      projectId: env.SANITY_STUDIO_PROJECT_ID,
      dataset: env.SANITY_STUDIO_DATASET || "production",
      apiVersion: env.SANITY_STUDIO_API_VERSION || "2021-03-25",
      useCdn: false,
      ...(env.SANITY_STUDIO_ENABLED ? { studioBasePath: "/admin" } : {}),
    }),
    react({ include: "**/react/*" }),
    icon(),
    robotsTxt(),
    dynamicImport(),
    addsToHead(),
  ],
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
    platformProxy: {
      enabled: true,
    },
  }),
  vite: {
    ssr: {
      external: ["node:path", "node:buffer", "node:fs", "node:os"],
    },
  },
  image: {
    service: passthroughImageService(),
  },
});
