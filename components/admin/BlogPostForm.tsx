"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, UploadCloud } from "lucide-react";
import type { BlogPost, BlogSection } from "@/lib/blog-types";
import { toast } from "@/lib/toast";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

type SectionDraft = { heading: string; paragraphsText: string };

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function toSectionDrafts(content: unknown): SectionDraft[] {
  if (!Array.isArray(content) || content.length === 0) {
    return [{ heading: "", paragraphsText: "" }];
  }
  return (content as BlogSection[]).map((section) => ({
    heading: section.heading ?? "",
    paragraphsText: section.paragraphs.join("\n\n"),
  }));
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
  const [sections, setSections] = useState<SectionDraft[]>(toSectionDrafts(post?.content));
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function updateSection(index: number, patch: Partial<SectionDraft>) {
    setSections((current) => current.map((section, i) => (i === index ? { ...section, ...patch } : section)));
  }

  function addSection() {
    setSections((current) => [...current, { heading: "", paragraphsText: "" }]);
  }

  function removeSection(index: number) {
    setSections((current) => current.filter((_, i) => i !== index));
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

    const content: BlogSection[] = sections
      .map((section) => ({
        heading: section.heading.trim() || undefined,
        paragraphs: section.paragraphsText
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean),
      }))
      .filter((section) => section.paragraphs.length > 0);

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

      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-heading">Content sections</p>
          <button
            type="button"
            onClick={addSection}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            <Plus aria-hidden size={16} />
            Add section
          </button>
        </div>

        <div className="mt-3 space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="rounded-lg border border-line/10 bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  value={section.heading}
                  onChange={(e) => updateSection(index, { heading: e.target.value })}
                  placeholder="Section heading (optional)"
                  className="flex-1 rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-sm text-heading focus:border-accent focus:outline-none"
                />
                {sections.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    aria-label="Remove section"
                    className="text-body hover:text-red-400"
                  >
                    <Trash2 aria-hidden size={16} />
                  </button>
                )}
              </div>
              <textarea
                value={section.paragraphsText}
                onChange={(e) => updateSection(index, { paragraphsText: e.target.value })}
                rows={5}
                placeholder={"Paragraph one.\n\nParagraph two."}
                className="mt-3 w-full rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-sm text-heading focus:border-accent focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

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
