import { decorators } from "../text/decorators";
import { annotations } from "../text/annotations";
import { defineArrayMember, defineField } from "sanity";

export default defineField({
  title: "Editor",
  name: "editorTextMin",
  type: "array" as const,
  of: [
    defineArrayMember({
      type: "block" as const,
      styles: [{ title: "Regular", value: "normal" }],
      lists: [],
      marks: {
        decorators,
        annotations,
      },
    }),
  ],
});
