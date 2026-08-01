import { backendFetch } from "@/lib/backend";
import { BlogPostList } from "@/components/admin/BlogPostList";
import type { BlogPost } from "@/lib/blog-types";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const response = await backendFetch("/admin/blog");
  const posts: BlogPost[] = await response.json();
  return <BlogPostList posts={posts} />;
}
