import PostListPage from "@/components/PostListPage";

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string }> }) {
  return <PostListPage genre="blog" searchParams={await searchParams} />;
}
