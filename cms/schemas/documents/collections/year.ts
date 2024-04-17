import { BiFile } from "react-icons/bi";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Year",
  name: "year",
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
      description: "A textual description of the year.",
      type: "editorText",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
