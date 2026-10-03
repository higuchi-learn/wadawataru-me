import PostListPage from '@/components/PostListPage';

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string }> }) {
  return <PostListPage genre="blogs" searchParams={await searchParams} />;
}
