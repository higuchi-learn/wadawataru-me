import AdminPostListPage from "@/components/AdminPostListPage";

export default async function AdminProductsPage({ searchParams }: { searchParams: Promise<{ page?: string; tags?: string; status?: string }> }) {
  return <AdminPostListPage genre="products" searchParams={await searchParams} />;
}
