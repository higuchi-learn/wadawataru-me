import AdminPostListPage from "@/components/AdminPostListPage";

export default async function AdminBooksPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string; status?: string }> }) {
  return <AdminPostListPage genre="books" searchParams={await searchParams} />;
}
