"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud } from "lucide-react";
import type { BlogContentBlock, BlogPost, BlogSection } from "@/lib/blog-types";
import { BlogContentEditor } from "./BlogContentEditor";
import { toast } from "@/lib/toast";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function isLegacySection(value: unknown): value is BlogSection {
  return Boolean(value) && typeof value === "object" && Array.isArray((value as BlogSection).paragraphs);
}

function isContentBlock(value: unknown): value is BlogContentBlock {
  return Boolean(value) && typeof value === "object" && "type" in (value as Record<string, unknown>);
}

/** Loads content saved by either the old paragraph-sections editor or the new block editor. */
function toBlocks(content: unknown): BlogContentBlock[] {
  if (!Array.isArray(content) || content.length === 0) return [];

  if (content.every(isContentBlock)) {
    return (content as BlogContentBlock[]).map((block) => ({ ...block, id: block.id || newId() }));
  }

  if (content.every(isLegacySection)) {
    return (content as BlogSection[]).map((section) => {
      const heading = section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : "";
      const paragraphs = section.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
      return { id: newId(), type: "text", html: heading + paragraphs };
    });
  }

  return [];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const router = useRouter();
  const isEditing = Boolean(post);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [author, setAuthor] = useState(post?.author ?? "Project Help Solutions");
  const [readingTime, setReadingTime] = useState(post?.readingTime ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(post?.coverImageUrl ?? "");
  const [published, setPublished] = useState(post?.published ?? true);
  const [blocks, setBlocks] = useState<BlogContentBlock[]>(toBlocks(post?.content));
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleCoverUpload(file: File) {
    if (file.size > MAX_UPLOAD_BYTES) {
      toast({ title: "File too large", description: "Cover images must be under 4 MB.", variant: "error" });
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: dataUrl }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Upload failed");
      setCoverImageUrl(data.url);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const content: BlogContentBlock[] = blocks.filter((block) =>
      block.type === "text" ? block.html.replace(/<[^>]+>/g, "").trim().length > 0 : Boolean(block.url)
    );

    const payload = {
      slug,
      title,
      excerpt,
      metaDescription,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      author,
      readingTime,
      coverImageUrl,
      content,
      published,
    };

    try {
      const response = await fetch(isEditing ? `/api/blog/${post!.id}` : "/api/blog", {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error ?? "Save failed");

      router.push("/blog");
      router.refresh();
    } catch (error) {
      toast({
        title: "Couldn't save post",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-heading">{isEditing ? "Edit Post" : "New Post"}</h1>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-heading">
          Title
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-heading">
          Slug
        </label>
        <input
          id="slug"
          required
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 font-mono text-sm text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-heading">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          required
          rows={2}
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="metaDescription" className="block text-sm font-medium text-heading">
          Meta description (SEO)
        </label>
        <textarea
          id="metaDescription"
          required
          rows={2}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-heading">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="readingTime" className="block text-sm font-medium text-heading">
            Reading time
          </label>
          <input
            id="readingTime"
            required
            placeholder="6 min read"
            value={readingTime}
            onChange={(e) => setReadingTime(e.target.value)}
            className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="author" className="block text-sm font-medium text-heading">
          Author
        </label>
        <input
          id="author"
          required
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="mt-2 w-full rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-heading focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-heading">Cover image</label>
        <div className="mt-2 flex items-center gap-3">
          <input
            value={coverImageUrl ?? ""}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="flex-1 rounded-lg border border-line/10 bg-surface px-4 py-2.5 text-sm text-heading focus:border-accent focus:outline-none"
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-lg border border-dashed border-line/20 px-4 py-2.5 text-sm text-body hover:border-accent">
            <UploadCloud aria-hidden size={16} />
            {isUploading ? "Uploading..." : "Upload"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
          </label>
        </div>
      </div>

      <BlogContentEditor blocks={blocks} onChange={setBlocks} />

      <label className="flex items-center gap-2 text-sm font-medium text-heading">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="h-4 w-4 rounded border-line/20"
        />
        Published
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary transition-colors hover:bg-secondary disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : isEditing ? "Save changes" : "Create post"}
      </button>
    </form>
  );
}
