import groq from "groq";
import { useMemo } from "react";
import {
  type Rule,
  type Slug,
  useClient,
  type SlugIsUniqueValidator,
} from "sanity";
import type { SanityBlock } from "sanity-codegen";

export function useSanityClient() {
  const client = useClient({ apiVersion: "2022-05-04" });
  return useMemo(
    () => client.withConfig({ apiVersion: "2022-05-04" }),
    [client]
  );
}

export const slugify = (input: { _key: string; value: string }[]) => {
  return input
    .toString()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[\s+\+]/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .slice(0, 200);
};

export const validateSlug = (Rule: Rule) =>
  Rule.custom((slug: Slug, ctx) => {
    if (!slug) {
      return "A slug is required. Click “Generate” to generate a valid slug";
    }
    const rule = new RegExp("^[A-Za-z0-9]+(-[A-Za-z0-9]+)*$");
    if (!rule.test(slug.current))
      return "A slug should only contain lowercase letters and “-”. Click “Generate” to generate a valid slug.";
    return true;
  });

export const isUniqueSlug: SlugIsUniqueValidator = async (slug, context) => {
  const { document, getClient } = context;
  if (!document?.language) {
    return true;
  }
  const client = getClient({ apiVersion: "2023-04-24" });
  const id = document._id.replace(/^drafts\./, "");
  const params = {
    draft: `drafts.${id}`,
    published: id,
    language: document.language,
    slug,
  };
  const query = groq`
  !defined(*[
    !(_id in [$draft, $published]) &&
    slug.current == $slug &&
    language == $language
  ][0]._id)`;
  const result = await client.fetch(query, params);
  return result;
};

export function capitalized(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function blocksToText(
  blocks: SanityBlock[],
  opts: { nonTextBehavior?: "remove" } = {}
) {
  const options = Object.assign({}, opts);
  return blocks
    .map((block) => {
      if (block._type !== "block" || !block.children) {
        return options.nonTextBehavior === "remove"
          ? ""
          : `[${capitalized(block._type)} block]`;
      }
      return block.children.map((child: SanityBlock) => child.text).join("");
    })
    .join("\n\n");
}
