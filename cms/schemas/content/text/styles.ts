import {
  TextLg,
  TextBold,
  TextSm,
  TextSpeaker,
  TextPullQuote,
} from "../../../components/TextPreviews";

// Define Hierarchie of text
export const styles = [
  { title: "Regular", value: "normal" },
  {
    title: "Heading 1",
    value: "h2",
    component: TextLg,
  },
  {
    title: "Heading 2",
    value: "h3",
    component: TextLg,
  },
  {
    title: "Heading 3",
    value: "h4",
    component: TextBold,
  },
  {
    title: "Small",
    value: "small",
    component: TextSm,
  },
  {
    title: "Quote",
    value: "blockquote",
    component: TextPullQuote,
  },
];
