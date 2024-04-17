import { BiImage } from "react-icons/bi";
import { defineField, defineType } from "sanity";

export default defineType({
  title: "Image",
  name: "pictureTitled",
  type: "image",
  icon: BiImage,
  options: {
    hotspot: true,
  },
  fields: [
    defineField({
      title: "Caption",
      name: "caption",
      description:
        "A caption to render beneath the image. This is *not* the alt text, which you can set directly on the image itself.",
      type: "string",
    }),
  ],
  preview: {
    select: {
      filename: "asset.originalFilename",
      caption: "caption",
      dimensions: "asset.metadata.dimensions",
      image: "asset",
    },
    prepare(selection) {
      const { filename, caption, dimensions, image } = selection;
      const captionText = caption?.find(({ _key }: any) => _key === "en").value;
      return {
        title: filename ?? "",
        subtitle: captionText
          ? captionText
          : dimensions
            ? `(${dimensions.width}px × ${dimensions.height}px)`
            : "…",
        media: image,
      };
    },
  },
});
