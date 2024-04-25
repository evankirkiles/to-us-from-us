import type {
  InternalLink,
  SanityKeyedReference,
  SanityReference,
  Year,
} from "@/sanity";

export type Linkable = ResolvedReference<InternalLink["linkTarget"]>;

export type ResolvedReference<T> =
  // match `SanityKeyedReference` and unwrap via `infer U`
  T extends SanityKeyedReference<infer U>
    ? U
    : // match `SanityReference` and unwrap via `infer U`
      T extends SanityReference<infer U>
      ? U
      : never;

export function resolveReference<
  T extends { _type: any },
  Ref extends SanityKeyedReference<T> | SanityReference<T>,
>(obj: Ref): ResolvedReference<Ref> {
  if (obj._type === "reference")
    throw new Error("Asset reference has not been expanded!");
  return obj as unknown as ResolvedReference<Ref>;
}

export function resolveLinkURL(link: Linkable) {
  switch (link._type) {
    case "year":
      return `/years/${link.year}`;
    default:
      return "/";
  }
}
