import { defineConfig } from "sanity";
import { sanityClient } from "sanity:client";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { colorInput } from "@sanity/color-input";
import { richDate } from "@sanity/rich-date-input";
import { media } from "sanity-plugin-media";
import schemaTypes from "./cms/schemas";
import { structure } from "./cms/config/structure";
import { defaultDocumentNode, resolveProductionUrl } from "./cms/config/views";
import { initialValueTemplates } from "./cms/config/initialValueTemplates";
import Icon from "./cms/components/Icon";
import "@/styles/sanityStudio.scss";

const { projectId, dataset, apiVersion } = sanityClient.config();

const { theme } = (await import(
  // @ts-expect-error -- TODO setup themer.d.ts to get correct typings
  "https://themer.sanity.build/api/hues?primary=ff40ff"
)) as { theme: import("sanity").StudioTheme };

export default defineConfig({
  theme,
  name: "to-us-from-us",
  title: "To Us From Us",
  icon: Icon,
  projectId: projectId!,
  dataset: dataset!,
  apiVersion: apiVersion!,
  plugins: [
    structureTool({
      structure,
      defaultDocumentNode,
    }),
    media(),
    visionTool(),
    colorInput(),
    richDate(),
  ],
  schema: {
    types: schemaTypes,
    templates: (prev) => initialValueTemplates(prev),
  },
  document: {
    productionUrl: async (prev, context) => resolveProductionUrl({ context }),
  },
});
