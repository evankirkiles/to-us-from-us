import { type SanityCodegenConfig } from "sanity-codegen";

const config: SanityCodegenConfig = {
  schemaPath: "./cms/schemas",
  outputPath: "./src/sanity.d.ts",
};

export default config;
