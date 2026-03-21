import BlogEditor from "@/components/BlogEditor";
import type { ArticleInitialData } from "@/components/BlogEditor";
import { MOCK_ARTICLE } from "@/lib/mockArticle";

// TODO: fetch real products article by id
const initialData: ArticleInitialData = {
  ...MOCK_ARTICLE,
  publishStatus: MOCK_ARTICLE.publishStatus,
};

export default function ProductsEditPage() {
  return <BlogEditor genre="products" mode="edit" initialData={initialData} />;
}
