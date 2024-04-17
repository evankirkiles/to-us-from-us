import { BiMapAlt } from "react-icons/bi";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Site Settings",
  name: "siteSettings",
  type: "document",
  icon: BiMapAlt,
  fields: [
    defineField({
      title: "SEO Title",
      description:
        "The base title for the website, used in the SEO for all pages.",
      name: "title",
      type: "string",
    }),
    defineField({
      title: "SEO Base",
      description:
        "The base SEO information for the website, used in all pages (if not overridden on a per-page basis).",
      name: "seo",
      type: "seo",
    }),
    defineField({
      title: "Navigation Bar",
      description: "Items to display in the top navigation bar.",
      name: "navItems",
      type: "array" as const,
      of: [
        {
          type: "internalLink",
        },
        {
          type: "link",
        },
      ],
    }),
  ],
  preview: {
    prepare({}) {
      return {
        title: "Site Settings",
      };
    },
  },
});
