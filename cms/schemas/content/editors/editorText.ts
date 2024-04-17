import { styles } from "../text/styles";
import { decorators } from "../text/decorators";
import { annotations } from "../text/annotations";
import { defineArrayMember, defineField } from "sanity";

export default defineField({
  title: "Editor",
  name: "editorText",
  type: "array" as const,
  of: [
    defineArrayMember({
      type: "block" as const,
      styles,
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Number", value: "number" },
      ],
      marks: {
        decorators,
        annotations,
      },
    }),
  ],
});
