import { BiFile } from "react-icons/bi";
import { defineField, defineType } from "sanity";
import { MdOutlineCalendarToday } from "react-icons/md";

export default defineType({
  title: "Year",
  name: "year",
  type: "document",
  icon: MdOutlineCalendarToday,
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
