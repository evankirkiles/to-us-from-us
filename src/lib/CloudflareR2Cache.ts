import {
  S3Client,
  paginateListObjectsV2,
  type S3ClientConfig,
  type ObjectIdentifier,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import type {
  R2Object,
  R2HTTPMetadata,
} from "@cloudflare/workers-types/experimental";
import type { R2Bucket } from "@cloudflare/workers-types";

interface CloudflareR2CacheOptions {
  s3config: S3ClientConfig;
  R2: R2Bucket;
  bucket: string;
  cfConfig?: {
    origin: string;
    zoneId: string;
    apiToken: string;
  };
}

/* ------------------------------- Serializers ------------------------------ */

export function serializeHTTPMetadata(headers: Headers): R2HTTPMetadata {
  const expires = headers.get("expires");
  return {
    cacheControl: headers.get("cache-control") || undefined,
    cacheExpiry: expires ? new Date(expires) : undefined,
    contentType: headers.get("content-type") || undefined,
    contentDisposition: headers.get("content-disposition") || undefined,
    contentEncoding: headers.get("content-encoding") || undefined,
    contentLanguage: headers.get("content-language") || undefined,
  };
}

export function parseHTTPMetadata(headers?: R2HTTPMetadata): Headers {
  const result = new Headers();
  if (!headers) return result;
  if (headers.cacheControl) result.set("Cache-Control", headers.cacheControl);
  if (headers.cacheExpiry)
    result.set("Expires", headers.cacheExpiry.toUTCString());
  if (headers.contentType) result.set("Content-Type", headers.contentType);
  if (headers.contentDisposition)
    result.set("Content-Disposition", headers.contentDisposition);
  if (headers.contentEncoding)
    result.set("Content-Encoding", headers.contentEncoding);
  if (headers.contentLanguage)
    result.set("Content-Language", headers.contentLanguage);
  return result;
}

/* ---------------------------------- Utils --------------------------------- */

function _getKey(request?: URL | RequestInfo | undefined) {
  if (request instanceof Request) request = new URL(request.url);
  if (request instanceof URL) return request.pathname;
  return request;
}

/* -------------------------------------------------------------------------- */
/*                              CloudflareR2Cache                             */
/* -------------------------------------------------------------------------- */

/**
 * A class abstracting a push-style CDN caching layer built on CloudFlare R2.
 * It integrates with Cloudflare's own caching network, meaning invalidations
 * are propogated across the edge network atomically.
 *
 * In order to support multiple purges and purge-alls, it must be provided both
 * an R2 binding *and* S3 credentials.
 */
export class CloudflareR2Cache {
  private readonly S3: S3Client;
  private readonly R2: R2Bucket;
  private readonly bucket: string;
  private readonly CFCache:
    | {
        origin: string;
        url: string;
        headers: HeadersInit;
      }
    | undefined;

  constructor({ s3config, R2, bucket, cfConfig }: CloudflareR2CacheOptions) {
    this.S3 = new S3Client(s3config);
    this.R2 = R2;
    this.bucket = bucket;
    if (cfConfig) {
      this.CFCache = {
        origin: cfConfig.origin,
        url: `https://api.cloudflare.com/client/v4/zones/${cfConfig.zoneId}/purge_cache`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cfConfig.apiToken}`,
        },
      };
    }
  }

  async keys(request?: URL | RequestInfo | undefined) {
    // Retrieve paginated list of all objects in the bucket
    //  - S3 List Objects: max 1000 results returned per page
    // https://aws.amazon.com/blogs/developer/pagination-using-async-iterators-in-modular-aws-sdk-for-javascript/
    const paginator = paginateListObjectsV2(
      { client: this.S3, pageSize: 1000 },
      { Bucket: this.bucket, Prefix: _getKey(request) },
    );
    const Objects: ObjectIdentifier[] = [];
    for await (const page of paginator) {
      Objects.push(
        ...((page.Contents?.map(({ Key }) =>
          Key ? { Key } : undefined,
        ).filter(Boolean) as ObjectIdentifier[]) || []),
      );
    }
    return Objects.map(({ Key }) => Key).filter(Boolean) as string[];
  }

  /* ------------------------------- Deletion ------------------------------- */

  /**
   * Evicts a single item from the Cloudflare R2 cache.
   *
   * @param request
   * @param options Ignored.
   * @returns
   */
  async delete(request: URL | RequestInfo) {
    return this.deleteMany([request]);
  }

  /**
   * Evicts all items from the cache, likewise purging them from the CDN.
   */
  async deleteAll() {
    const keys = await this.keys();
    if (!keys.length) return [];
    const { Deleted } = await this.S3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: keys.map((req) => ({ Key: _getKey(req) })) },
      }),
    );

    // Purge the entire CF cache. This is super inefficient and will
    // lead to a ton of cache misses == tons of Sanity API calls. Try not to.
    const { CFCache } = this;
    if (CFCache) {
      await fetch(CFCache.url, {
        method: "POST",
        headers: CFCache.headers,
        body: JSON.stringify({ purge_everything: true }),
      });
    }

    return Deleted;
  }

  /**
   * Evicts multiple keys from the R2 / CloudFlare cache
   *
   * @param requests
   */
  async deleteMany(requests: (RequestInfo | URL)[]) {
    if (!requests.length) return [];
    const { Deleted } = await this.S3.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: { Objects: requests.map((req) => ({ Key: _getKey(req) })) },
      }),
    );

    // Purge the CF cache for the specified keys. We have to wait for the R2
    // cache to be purged before purging the CDN itself.
    const purgeKeys = requests.map((req) => _getKey(req));
    const { CFCache } = this;
    if (CFCache) {
      await fetch(CFCache.url, {
        method: "POST",
        headers: CFCache.headers,
        body: JSON.stringify({
          files: purgeKeys.map((pathname) => `${CFCache.origin}${pathname}`),
        }),
      });
    }

    return Deleted;
  }

  /* ------------------------------- Matching ------------------------------- */

  /**
   * Attempts to match the request with an entry in the cache.
   *
   * @param request The request to match in the cache.
   * @returns A response if found, or undefined.
   */
  async match(request: URL | RequestInfo): Promise<Response | undefined> {
    const key = _getKey(request);
    if (!key) throw new Error("Invalid cache key from request.");
    const object = await this.R2.get(key);
    if (!object) return undefined;
    const { customMetadata } = object;
    const headers = parseHTTPMetadata(object.httpMetadata);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Length", object.size.toString());
    headers.set("Last-Modified", object.uploaded.toUTCString());
    headers.set("CDN-Cache-Control", `public, max-age=${60 * 60 * 24 * 365}`);
    let status = object.body ? 200 : 304;
    let statusText = "";
    if (customMetadata?.statusCode)
      status = parseInt(customMetadata.statusCode);
    if (customMetadata?.statusText) statusText = customMetadata.statusText;
    return new Response(object.body as ReadableStream<any> | null, {
      headers,
      status,
      statusText,
    });
  }

  /* -------------------------------- Putting ------------------------------- */

  /**
   * Uploads a response to the cache.
   *
   * The response is cloned, and so can be returned as normal from the main
   * handler.
   *
   * @param request
   * @param response
   * @returns
   */
  async put(request: Request, response: Response): Promise<R2Object> {
    const key = _getKey(request);
    if (!key) throw new Error("Invalid cache key from request.");
    const body = await response.arrayBuffer();
    return this.R2.put(key, body, {
      httpMetadata: serializeHTTPMetadata(response.headers),
      customMetadata: {
        statusCode: response.status.toString(),
        statusText: response.statusText,
      },
    });
  }
}
