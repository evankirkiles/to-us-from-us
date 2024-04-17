import { BiLinkAlt } from "react-icons/bi";
import { defineType } from "sanity";

export default defineType({
  title: "External Link",
  name: "link",
  type: "object",
  icon: BiLinkAlt,
  initialValue: {
    blank: false,
  },
  fields: [
    {
      title: "URL",
      name: "href",
      description: "The external webpage this link points to to.",
      type: "url",
      validation: (Rule) =>
        Rule.uri({
          allowRelative: false,
          scheme: ["https", "http", "mailto", "tel"],
        }).required(),
      codegen: { required: true },
    },
    {
      title: "Title",
      name: "title",
      description: "An accessible title for the link.",
      type: "string",
    },
    {
      title: "Open in new tab?",
      description:
        "Opens the link in a new tab. This should be avoided for accessibility purposes.",
      name: "blank",
      type: "boolean",
    },
  ],
  preview: {
    select: {
      url: "href",
      title: "title",
    },
    prepare({ url, title }) {
      return {
        title: title ?? "Untitled Link",
        subtitle: url,
        media: BiLinkAlt,
      };
    },
  },
});
