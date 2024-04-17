import { BiFile } from "react-icons/bi";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Memory",
  name: "memory",
  type: "document",
  icon: BiFile,
  fields: [
    defineField({
      title: "Title",
      name: "title",
      description: "Title to use for links and SEO",
      type: "string",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "Description",
      name: "description",
      description: "The memory.",
      type: "editorTextMedia",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "Date",
      name: "date",
      description: "The approximate date of the memory, used for ordering.",
      type: "richDate",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
  ],
  preview: {
    select: {
      title: "date.date",
      subtitle: "description",
    },
  },
});
