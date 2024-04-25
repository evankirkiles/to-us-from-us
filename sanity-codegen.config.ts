import { type SanityCodegenConfig } from "sanity-codegen";

const config: SanityCodegenConfig = {
  schemaPath: "./cms/schemas",
  outputPath: "./src/sanity.ts",
};

export default config;
