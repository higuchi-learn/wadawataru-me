import AdminPostListPage from "@/components/AdminPostListPage";

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string; status?: string }> }) {
  return <AdminPostListPage genre="blog" searchParams={await searchParams} />;
}
