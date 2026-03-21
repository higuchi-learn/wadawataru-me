import PostEditPage from "@/components/PostEditPage";

export default async function BooksEditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PostEditPage slug={slug} genre="books" />;
}
