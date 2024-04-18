import { type StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) => {
  const hiddenDocs = ["siteSettings", "siteFooter", "media.tag"];

  return S.list()
    .title("Content")
    .items([
      S.documentListItem().id("siteSettings").schemaType("siteSettings"),
      S.documentListItem().id("siteFooter").schemaType("siteFooter"),
      S.divider(),
      ...S.documentTypeListItems().filter(
        (listItem) =>
          ![...hiddenDocs].some((page) => page === listItem.getId()),
      ),
    ]);
};
