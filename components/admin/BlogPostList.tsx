"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/blog-types";

export function BlogPostList({ posts: initialPosts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);

  async function togglePublished(post: BlogPost) {
    setPosts((current) =>
      current.map((p) => (p.id === post.id ? { ...p, published: !p.published } : p))
    );

    await fetch(`/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !post.published }),
    });
  }

  async function handleDelete(post: BlogPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;

    setPosts((current) => current.filter((p) => p.id !== post.id));
    await fetch(`/api/blog/${post.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-heading">Blog Posts</h1>
        <Link
          href="/blog/new"
          className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-on-primary transition-colors hover:bg-secondary"
        >
          New Post
        </Link>
      </div>

      <div className="mt-6 space-y-3">
        {posts.length === 0 && (
          <p className="rounded-2xl border border-line/10 bg-surface p-6 text-center text-body">
            No blog posts yet.
          </p>
        )}

        {posts.map((post) => {
          const isScheduled = post.published && new Date(post.publishedAt) > new Date();

          return (
          <div
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line/10 bg-surface p-5"
          >
            <div>
              <p className="font-bold text-heading">{post.title}</p>
              <p className="text-xs text-body">
                /blog/{post.slug} &middot;{" "}
                {new Date(post.publishedAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => togglePublished(post)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isScheduled
                    ? "bg-amber-500/10 text-amber-500"
                    : post.published
                      ? "bg-primary/10 text-accent"
                      : "bg-surface-2 text-body"
                }`}
              >
                {isScheduled ? "Scheduled" : post.published ? "Published" : "Draft"}
              </button>

              <Link
                href={`/blog/${post.id}/edit`}
                aria-label={`Edit ${post.title}`}
                className="text-body transition-colors hover:text-heading"
              >
                <Pencil aria-hidden size={18} />
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(post)}
                aria-label={`Delete ${post.title}`}
                className="text-body transition-colors hover:text-red-400"
              >
                <Trash2 aria-hidden size={18} />
              </button>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}
