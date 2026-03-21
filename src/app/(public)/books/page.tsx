import PostListPage from "@/components/PostListPage";

export default async function BooksPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string }> }) {
  return <PostListPage genre="books" searchParams={await searchParams} />;
}
