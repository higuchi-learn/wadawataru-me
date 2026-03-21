import PostDetailPage from "@/components/PostDetailPage";

export default async function ProductsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} />;
}
