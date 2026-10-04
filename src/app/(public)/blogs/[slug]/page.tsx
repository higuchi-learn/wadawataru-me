import PostDetailPage from '@/components/PostDetailPage';

export { generatePostMetadata as generateMetadata } from '@/lib/generatePostMetadata';
export { generateStaticParams } from '@/lib/generatePostMetadata';

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailPage genre="blogs" slug={slug} />;
}
