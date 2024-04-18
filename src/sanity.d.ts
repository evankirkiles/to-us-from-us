import type {
  SanityReference,
  SanityKeyedReference,
  SanityAsset,
  SanityImage,
  SanityFile,
  SanityGeoPoint,
  SanityBlock,
  SanityDocument,
  SanityImageCrop,
  SanityImageHotspot,
  SanityKeyed,
  SanityImageAsset,
  SanityImageMetadata,
  SanityImageDimensions,
  SanityImagePalette,
  SanityImagePaletteSwatch,
} from "sanity-codegen";

export type {
  SanityReference,
  SanityKeyedReference,
  SanityAsset,
  SanityImage,
  SanityFile,
  SanityGeoPoint,
  SanityBlock,
  SanityDocument,
  SanityImageCrop,
  SanityImageHotspot,
  SanityKeyed,
  SanityImageAsset,
  SanityImageMetadata,
  SanityImageDimensions,
  SanityImagePalette,
  SanityImagePaletteSwatch,
};

/**
 * Site Settings
 *
 *
 */
export interface SiteSettings extends SanityDocument {
  _type: "siteSettings";

  /**
   * SEO Title — `string`
   *
   * The base title for the website, used in the SEO for all pages.
   */
  title?: string;

  /**
   * SEO Base — `seo`
   *
   * The base SEO information for the website, used in all pages (if not overridden on a per-page basis).
   */
  seo?: Seo;

  /**
   * Navigation Bar — `array`
   *
   * Items to display in the top navigation bar.
   */
  navItems?: Array<SanityKeyed<InternalLink> | SanityKeyed<Link>>;
}

/**
 * Site Footer
 *
 *
 */
export interface SiteFooter extends SanityDocument {
  _type: "siteFooter";

  /**
   * Picture — `image`
   *
   * The picture for the footer.
   */
  credits?: {
    _type: "image";
    asset: SanityReference<SanityImageAsset>;
    crop?: SanityImageCrop;
    hotspot?: SanityImageHotspot;
  };

  /**
   * Description — `editorTextMin`
   *
   * Text for the site description, top of column 1
   */
  description?: EditorTextMin;

  /**
   * Copyright — `editorTextMin`
   *
   * Text for the copyright, bottom of columns 1 + 2
   */
  copyright?: EditorTextMin;
}

/**
 * Year
 *
 *
 */
export interface Year extends SanityDocument {
  _type: "year";

  /**
   * Title — `string`
   *
   * Title to use for links and SEO
   */
  title: string;

  /**
   * Description — `editorText`
   *
   * A textual description of the year.
   */
  description: EditorText;
}

/**
 * Memory
 *
 *
 */
export interface Memory extends SanityDocument {
  _type: "memory";

  /**
   * Title — `string`
   *
   * Title to use for links and SEO
   */
  title: string;

  /**
   * Description — `editorTextMedia`
   *
   * The memory.
   */
  description: EditorTextMedia;

  /**
   * Date — `richDate`
   *
   * The approximate date of the memory, used for ordering.
   */
  date: RichDate;
}

/**
 * Room
 *
 *
 */
export interface Room extends SanityDocument {
  _type: "room";

  /**
   * Room — `string`
   *
   * Title of the room.
   */
  title: string;

  /**
   * Description — `editorText`
   *
   * A description of the room.
   */
  description?: EditorText;

  /**
   * Cover Image — `image`
   *
   * A cover image to use for the room.
   */
  coverImage: {
    _type: "image";
    asset: SanityReference<SanityImageAsset>;
    crop?: SanityImageCrop;
    hotspot?: SanityImageHotspot;
  };

  /**
   * Room File — `file`
   *
   * The .glb file of the room.
   */
  file: { _type: "file"; asset: SanityReference<any> };

  /**
   * Start Date — `richDate`
   *
   * When did we start living here?
   */
  startDate: RichDate;

  /**
   * End Date — `richDate`
   *
   * When did we end living here?
   */
  endDate?: RichDate;
}

export type EditorText = Array<SanityKeyed<SanityBlock>>;

export type EditorTextMin = Array<SanityKeyed<SanityBlock>>;

export type EditorTextMedia = Array<SanityKeyed<SanityBlock>>;

export type Link = {
  _type: "link";
  /**
   * URL — `url`
   *
   * The external webpage this link points to to.
   */
  href: string;

  /**
   * Title — `string`
   *
   * An accessible title for the link.
   */
  title?: string;

  /**
   * Open in new tab? — `boolean`
   *
   * Opens the link in a new tab. This should be avoided for accessibility purposes.
   */
  blank?: boolean;
};

export type InternalLink = {
  _type: "internalLink";
  /**
   * Link Target — `reference`
   *
   *
   */
  linkTarget: SanityReference<Year | Memory>;

  /**
   * Title — `string`
   *
   * Keep empty to use the linked page's title
   */
  title?: string;
};

export type PictureTitled = {
  _type: "pictureTitled";
  asset: SanityReference<SanityImageAsset>;
  crop?: SanityImageCrop;
  hotspot?: SanityImageHotspot;

  /**
   * Caption — `string`
   *
   * A caption to render beneath the image. This is *not* the alt text, which you can set directly on the image itself.
   */
  caption?: string;
};

export type Seo = {
  _type: "seo";
  /**
   * Meta Description — `text`
   *
   * A meta description of the page used in SEO.
   */
  metaDescription?: string;

  /**
   * Meta Keywords — `array`
   *
   * Comma-separated list of keywords related to this page.
   */
  metaKeywords?: Array<SanityKeyed<string>>;

  /**
   * Open Graph Image — `image`
   *
   * An optional image shown as the page's image when the link is shared to social media
   */
  ogImage?: {
    _type: "image";
    asset: SanityReference<SanityImageAsset>;
    crop?: SanityImageCrop;
    hotspot?: SanityImageHotspot;
  };
};

export type Documents = SiteSettings | SiteFooter | Year | Memory | Room;

/**
 * This interface is a stub. It was referenced in your sanity schema but
 * the definition was not actually found. Future versions of
 * sanity-codegen will let you type this explicity.
 */
type RichDate = any;
