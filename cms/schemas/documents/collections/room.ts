import { HiOutlineCubeTransparent } from "react-icons/hi2";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Room",
  name: "room",
  type: "document",
  icon: HiOutlineCubeTransparent,
  fields: [
    defineField({
      title: "Room",
      name: "title",
      description: "Title of the room.",
      type: "string",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "Description",
      name: "description",
      description: "A description of the room.",
      type: "editorText",
    }),
    defineField({
      title: "Cover Image",
      name: "coverImage",
      description: "A cover image to use for the room.",
      type: "image",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
      options: {
        hotspot: true,
      },
    }),
    defineField({
      title: "Room File",
      name: "file",
      description: "The .glb file of the room.",
      type: "file",
    }),
    defineField({
      title: "Start Date",
      name: "startDate",
      description: "When did we start living here?",
      type: "richDate",
      validation: (Rule) => Rule.required(),
      codegen: { required: true },
    }),
    defineField({
      title: "End Date",
      name: "endDate",
      description: "When did we end living here?",
      type: "richDate",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
    },
  },
});
