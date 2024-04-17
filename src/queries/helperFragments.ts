import groq from "groq";

export const linkQuery = groq`
  _type,
  blank,
  title,
  _type == "internalLink" => {
    subpath,
    linkTarget -> {
      _type,
      slug,
      title
    }
  }
`;

export const fileQuery = groq`
  asset -> {
    _ref,
    _type,
    url,
    title,
    altText,
    description,
    mimeType
  }
`;

export const imageQuery = groq`
  crop,
  hotspot,
  asset -> {
    _id,
    url,
    altText,
    description,
    metadata {
      lqip,
      dimensions
    }
  }
`;

/* --------------------------------- Modules -------------------------------- */

export const ifModuleIsBlockQuery = groq`
_type == "module_block" => {
  content[] {
    ...,
    _type == "pictureTitled" => {
      caption,
      ${imageQuery}
    },
  }
}
`;
