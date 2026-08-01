import { notFound } from "next/navigation";
import { backendFetch } from "@/lib/backend";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import type { BlogPost } from "@/lib/blog-types";

export const dynamic = "force-dynamic";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const response = await backendFetch(`/admin/blog/${id}`);

  if (response.status === 404) notFound();

  const post: BlogPost = await response.json();

  return <BlogPostForm post={post} />;
}
