// documents
import siteSettings from "./documents/site/siteSettings";
import siteFooter from "./documents/site/siteFooter";
// content
import editorText from "./content/editors/editorText";
import editorTextMin from "./content/editors/editorTextMin";
import editorTextMedia from "./content/editors/editorTextMedia";
// objects
import link from "./objects/link";
import internalLink from "./objects/internalLink";
import pictureTitled from "./objects/pictureTitled";
import seo from "./objects/seo";
import collections from "./documents/collections";

const schemaTypes = [
  siteSettings,
  siteFooter,
  ...collections,
  editorText,
  editorTextMin,
  editorTextMedia,
  link,
  internalLink,
  pictureTitled,
  seo,
];

export default schemaTypes;
