import PostDetailPage from '@/components/PostDetailPage';

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} />;
}
