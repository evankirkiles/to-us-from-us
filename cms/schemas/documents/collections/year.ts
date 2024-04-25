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
      title: "Year",
      name: "year",
      description: "Which year does this represent?",
      type: "number",
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
      title: "year",
      subtitle: "description",
    },
  },
});
