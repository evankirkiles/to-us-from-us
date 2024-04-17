import type { SanityImageAsset } from "@/cms";

export interface SanityImageAsset2 extends SanityImageAsset {
  title?: string;
  altText?: string;
  description?: string;
}
