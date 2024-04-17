import { BiLinkAlt, BiDirections, BiPaperclip } from "react-icons/bi";
import { linkTargets } from "../../../utils/internalLinkTargets";
import { defineArrayMember } from "sanity";

export const annotations = [
  defineArrayMember({
    title: "External Link",
    name: "link",
    type: "object",
    icon: BiLinkAlt,
    initialValue: {
      blank: true,
    },
    fields: [
      {
        title: "URL",
        name: "href",
        type: "url",
        validation: (Rule) =>
          Rule.uri({
            allowRelative: true,
            scheme: ["https", "http", "mailto", "tel"],
          }),
      },
      {
        title: "Open in new tab?",
        name: "blank",
        type: "boolean",
      },
    ],
  }),
  defineArrayMember({
    title: "Internal Link",
    name: "internalLink",
    type: "object",
    icon: BiDirections,
    fields: [
      {
        title: "Internal Link",
        name: "linkTarget",
        type: "reference",
        to: linkTargets,
      },
    ],
  }),
  defineArrayMember({
    title: "Download",
    name: "download",
    type: "file",
    icon: BiPaperclip,
  }),
];
