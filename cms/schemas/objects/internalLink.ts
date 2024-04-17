import { BiDirections } from "react-icons/bi";
import { linkTargets } from "../../utils/internalLinkTargets";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Internal Link",
  name: "internalLink",
  type: "object",
  icon: BiDirections,
  fields: [
    {
      title: "Link Target",
      name: "linkTarget",
      type: "reference",
      to: linkTargets,
      options: {
        disableNew: true,
      },
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    },
    {
      title: "Title",
      description: "Keep empty to use the linked page's title",
      name: "title",
      type: "string",
    },
  ],
  preview: {
    select: {
      linkTitle: "title",
      targetType: "linkTarget._type",
      targetTitle: "linkTarget.title",
      linkTarget: "linkTarget.slug.current",
    },
    prepare({ linkTitle, targetType, targetTitle, linkTarget }) {
      return {
        title: linkTitle || targetTitle,
        subtitle:
          targetType === "article"
            ? "<Opens Article File>"
            : `/${linkTarget || ""}`,
      };
    },
  },
});
