import PostEditPage from '@/components/PostEditPage';

export default async function BlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditPage id={id} genre="blog" />;
}
