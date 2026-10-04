import PostDetailPage from '@/components/PostDetailPage';
import { generatePostMetadata } from '@/lib/generatePostMetadata';

export { generateStaticParams } from '@/lib/generatePostMetadata';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return generatePostMetadata('books', (await params).slug);
}

export default async function BooksArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostDetailPage genre="books" slug={slug} />;
}
