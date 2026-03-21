import PostListPage from "@/components/PostListPage";

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string }> }) {
  return <PostListPage genre="products" searchParams={await searchParams} />;
}
