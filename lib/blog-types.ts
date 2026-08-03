export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

/** Rich-text block, rendered from Tiptap-authored HTML. */
export type BlogTextBlock = {
  id: string;
  type: "text";
  html: string;
};

/** Standalone image block — can be dragged anywhere between text blocks. */
export type BlogImageBlock = {
  id: string;
  type: "image";
  url: string;
  alt?: string;
  caption?: string;
};

export type BlogContentBlock = BlogTextBlock | BlogImageBlock;

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  metaDescription: string;
  tags: string[];
  author: string;
  readingTime: string;
  coverImageUrl: string | null;
  content: unknown;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
};
