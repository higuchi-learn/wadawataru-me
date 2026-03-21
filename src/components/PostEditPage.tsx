import BlogEditor from "@/components/BlogEditor";
import type { ArticleInitialData } from "@/components/BlogEditor";
import { getPostByIdForAdmin, getTagsByPostId } from "@/db/queries/select";
import { formatSavedAt } from "@/lib/formatDate";
import type { Genre } from "@/components/GenreAbout";
import { notFound } from "next/navigation";

export default async function PostEditPage({ id, genre }: { id: string; genre: Genre }) {
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();
  const tags = await getTagsByPostId(post.id);
  const initialData: ArticleInitialData = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    thumbnail: post.thumbnail ?? "",
    tags: tags.map((t) => t.name),
    publishStatus: post.status,
    savedAt: formatSavedAt(post.updatedAt),
  };
  return <BlogEditor genre={genre} mode="edit" initialData={initialData} />;
}
