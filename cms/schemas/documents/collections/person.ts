import { UserIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Person",
  name: "person",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      title: "Name",
      name: "name",
      description: "Name of the person.",
      type: "string",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "Slug",
      name: "slug",
      description: "Slug of the person's name, used in URLs.",
      type: "slug",
      options: {
        source: "name",
      },
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "Color",
      name: "color",
      description: "A color to color-code this person by.",
      type: "color",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "slug.current",
    },
    prepare({ title, subtitle }) {
      return {
        title,
        subtitle: "/person/" + subtitle,
      };
    },
  },
});
