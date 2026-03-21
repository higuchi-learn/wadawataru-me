import PostEditPage from "@/components/PostEditPage";

export default async function BooksEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostEditPage id={id} genre="books" />;
}
