import { type StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentListItem().id("siteSettings").schemaType("siteSettings"),
      S.documentListItem().id("siteFooter").schemaType("siteFooter"),
      S.divider(),
      S.documentTypeListItem("year"),
      S.documentTypeListItem("memory"),
    ]);
