import PostDetailPage from '@/components/PostDetailPage';

export { generatePostMetadata as generateMetadata } from '@/lib/generatePostMetadata';

export default async function ProductsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailPage slug={slug} />;
}
