import { defineField, defineType } from "sanity";

export default defineType({
  title: "SEO",
  name: "seo",
  type: "object",
  fields: [
    defineField({
      title: "Meta Description",
      description: "A meta description of the page used in SEO.",
      name: "metaDescription",
      type: "text" as const,
    }),
    defineField({
      title: "Meta Keywords",
      description: "Comma-separated list of keywords related to this page.",
      name: "metaKeywords",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      title: "Open Graph Image",
      description:
        "An optional image shown as the page's image when the link is shared to social media",
      name: "ogImage",
      type: "image",
    }),
  ],
  // components: {
  //   input: CustomSEOGenerate,
  // },
});
