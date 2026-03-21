import ArticlePage from "@/components/ArticlePage";
import { getPostById, getTagsByPostId } from "@/db/queries/select";
import { formatDate } from "@/lib/formatDate";
import { notFound } from "next/navigation";

export default async function PostDetailPage({ slug }: { slug: string }) {
  const post = await getPostById(slug);
  if (!post) notFound();
  const tags = await getTagsByPostId(post.id);
  return (
    <ArticlePage
      title={post.title}
      description={post.description}
      tags={tags.map((t) => t.name)}
      publishedAt={formatDate(post.publishedAt)}
      updatedAt={formatDate(post.updatedAt)}
      content={post.content}
    />
  );
}
