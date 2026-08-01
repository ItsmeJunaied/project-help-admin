export type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

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
