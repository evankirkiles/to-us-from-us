import groq from "groq";
import { sanityClient } from "sanity:client";
import type { AstroGlobal } from "astro";
import { isPreviewMode } from "@/utils/constants";
import { type Year } from "@/sanity";
import { blockQuery } from "@/queries/helperFragments";

export type TypedGroq<T, P> = string & [T, P];
type SlugParam = { slug: string };
type RefParam = { ref: string };

// This is a noop but allows us to annotate our query strings with actual types.
// Kind of hacky but works really well I've found...
export const t = <T = never, Params = never>(
  query: string,
): TypedGroq<T, Params> => query as any;

/**
 * Our main access point for Sanity's API
 *
 * Takes a type-annotated GROQ query and returns:
 *  - the "previewDrafts" perspective, if the `ASTRO_PREVIEW_SECRET` cookie is set
 *    and matches the value specified by the environment variables
 *  - the "published" perspective, otherwise.
 *
 * Example usage:
 *
 * ```
 * // `artists` correctly typed as Artist[], inferred from artistsQuery
 * const artists = await useQuery(Astro)(artistsQuery);
 * ```
 *
 * @param Astro The global Astro instance, only accessible in page contexts
 * @returns A function to perform the query
 */
export function useQuery(Astro: Pick<AstroGlobal, "cookies" | "locals">) {
  let client = sanityClient;
  if (isPreviewMode(Astro)) {
    client = sanityClient.withConfig({
      perspective: "previewDrafts",
      token: Astro.locals.runtime.env.SANITY_API_READ_TOKEN,
      useCdn: false,
    });
  }

  return async function <T, P>(
    query: TypedGroq<T, P>,
    ...rest: [P] extends [never] ? [] : [P]
  ): Promise<T> {
    const queryKey = getQueryKey(query, ...rest);
    if (Astro.locals.fetchCache[queryKey]) {
      return Astro.locals.fetchCache[queryKey];
    }
    Astro.locals.reqCount += 1;
    const resp = await client.fetch<T>(query, (rest as any)?.[0]);
    Astro.locals.fetchCache[queryKey] = resp;
    return resp;
  };
}

// Builds a query key for caching fetches within a run
export const getQueryKey = (
  query: TypedGroq<any, any>,
  ...rest: [any] | []
) => {
  return query + (rest?.[0] ? JSON.stringify(rest[0]) : "");
};

/* -------------------------------------------------------------------------- */
/*                                Static Paths                                */
/* -------------------------------------------------------------------------- */

export const sitemapSlugs = t<
  {
    _type: string;
    _createdAt: string;
    _updatedAt: string;
    slug: { current: string };
  }[]
>(groq`
  *[defined(slug.current)] {
    _type,
    _createdAt,
    _updatedAt,
    slug
  }
`);

const slugsQuery = (type: string) => groq`
*[_type == "${type}" && defined(slug.current)] {
  "slug": slug.current
}
`;

export const slugsFor = (type: string) => async () => {
  const slugs = await sanityClient.fetch<{ slug: string }[]>(slugsQuery(type));
  return slugs.map(({ slug }: { slug: string }) => ({ params: { slug } }));
};

/* -------------------------------------------------------------------------- */
/*                              Top-level Queries                             */
/* -------------------------------------------------------------------------- */

export const yearsQuery = t<Year[]>(groq`
*[_type == "year"] | order(year asc) {
  _type,
  year,
  description[] { ${blockQuery} }
}
`);
