import { BiSliderAlt } from "react-icons/bi";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "siteFooter",
  type: "document",
  title: "Site Footer",
  icon: BiSliderAlt,
  fields: [
    defineField({
      title: "Picture",
      name: "credits",
      description: "The picture for the footer.",
      type: "image",
    }),
    defineField({
      title: "Description",
      name: "description",
      description: "Text for the site description, top of column 1",
      type: "editorTextMin",
    }),
    defineField({
      title: "Copyright",
      name: "copyright",
      description: "Text for the copyright, bottom of columns 1 + 2",
      type: "editorTextMin",
    }),
  ],
  preview: {
    prepare({}) {
      return {
        title: "Site Footer",
      };
    },
  },
});
