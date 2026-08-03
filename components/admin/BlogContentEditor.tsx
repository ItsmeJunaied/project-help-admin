"use client";

import { useState, type ChangeEvent } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Trash2, Type as TypeIcon } from "lucide-react";
import type { BlogContentBlock, BlogImageBlock, BlogTextBlock } from "@/lib/blog-types";
import { RichTextEditor } from "./RichTextEditor";
import { toast } from "@/lib/toast";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/** "team-meeting_2024.jpg" -> "Team meeting 2024" — a reasonable starting point, still editable. */
function filenameToAlt(fileName: string): string {
  const withoutExt = fileName.replace(/\.[^./]+$/, "");
  const words = withoutExt.replace(/[-_]+/g, " ").trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type BlogContentEditorProps = {
  blocks: BlogContentBlock[];
  onChange: (blocks: BlogContentBlock[]) => void;
};

export function BlogContentEditor({ blocks, onChange }: BlogContentEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function updateBlock(id: string, patch: Partial<BlogTextBlock> | Partial<BlogImageBlock>) {
    onChange(blocks.map((block) => (block.id === id ? ({ ...block, ...patch } as BlogContentBlock) : block)));
  }

  function removeBlock(id: string) {
    onChange(blocks.filter((block) => block.id !== id));
  }

  function addTextBlock() {
    onChange([...blocks, { id: newId(), type: "text", html: "" }]);
  }

  async function addImageBlocks(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const oversized = files.find((file) => file.size > MAX_UPLOAD_BYTES);
    if (oversized) {
      toast({
        title: "File too large",
        description: `"${oversized.name}" is over 4 MB. Please use smaller images.`,
        variant: "error",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        files.map(async (file) => {
          const dataUrl = await readFileAsDataUrl(file);
          const response = await fetch("/api/upload", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file: dataUrl }),
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data?.error ?? `Upload failed for ${file.name}`);
          const block: BlogImageBlock = { id: newId(), type: "image", url: data.url, alt: filenameToAlt(file.name) };
          return block;
        })
      );
      onChange([...blocks, ...uploaded]);
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    onChange(arrayMove(blocks, oldIndex, newIndex));
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-heading">Content</p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={addTextBlock}
            className="inline-flex items-center gap-1 text-sm font-semibold text-accent hover:underline"
          >
            <TypeIcon aria-hidden size={16} />
            Add text
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-accent hover:underline">
            <ImagePlus aria-hidden size={16} />
            {isUploading ? "Uploading..." : "Add images"}
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={isUploading}
              onChange={addImageBlocks}
            />
          </label>
        </div>
      </div>
      <p className="mt-1 text-xs text-body">
        Drag the handle to reorder text and images anywhere in the post.
      </p>

      <div className="mt-3 space-y-3">
        {blocks.length === 0 && (
          <div className="rounded-lg border border-dashed border-line/20 p-6 text-center text-sm text-body">
            No content yet — add a text block or upload some images to get started.
          </div>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableBlockCard key={block.id} block={block} onChange={updateBlock} onRemove={removeBlock} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

function SortableBlockCard({
  block,
  onChange,
  onRemove,
}: {
  block: BlogContentBlock;
  onChange: (id: string, patch: Partial<BlogTextBlock> | Partial<BlogImageBlock>) => void;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-line/10 bg-surface p-3"
    >
      <div className="flex items-center justify-between gap-3 pb-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="cursor-grab touch-none rounded p-1 text-body hover:bg-surface-2 hover:text-heading active:cursor-grabbing"
        >
          <GripVertical aria-hidden size={16} />
        </button>
        <span className="flex-1 text-xs font-semibold uppercase tracking-wide text-body">
          {block.type === "text" ? "Text" : "Image"}
        </span>
        <button
          type="button"
          onClick={() => onRemove(block.id)}
          aria-label="Remove block"
          className="text-body hover:text-red-400"
        >
          <Trash2 aria-hidden size={16} />
        </button>
      </div>

      {block.type === "text" ? (
        <RichTextEditor html={block.html} onChange={(html) => onChange(block.id, { html })} />
      ) : (
        <ImageBlockEditor block={block} onChange={onChange} />
      )}
    </div>
  );
}

function ImageBlockEditor({
  block,
  onChange,
}: {
  block: BlogImageBlock;
  onChange: (id: string, patch: Partial<BlogImageBlock>) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="overflow-hidden rounded-lg border border-line/10 bg-surface-2 sm:w-48 sm:shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary remote Cloudinary URL, thumbnail only */}
        <img src={block.url} alt="" className="aspect-video w-full object-cover" />
      </div>
      <div className="flex-1 space-y-2">
        <input
          value={block.alt ?? ""}
          onChange={(e) => onChange(block.id, { alt: e.target.value })}
          placeholder="Alt text (for accessibility & SEO)"
          className="w-full rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-sm text-heading focus:border-accent focus:outline-none"
        />
        <input
          value={block.caption ?? ""}
          onChange={(e) => onChange(block.id, { caption: e.target.value })}
          placeholder="Caption (optional, shown under the image)"
          className="w-full rounded-lg border border-line/10 bg-surface-2 px-3 py-2 text-sm text-heading focus:border-accent focus:outline-none"
        />
      </div>
    </div>
  );
}
