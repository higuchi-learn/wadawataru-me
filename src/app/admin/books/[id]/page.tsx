import BlogEditor from "@/components/BlogEditor";
import type { ArticleInitialData } from "@/components/BlogEditor";
import { MOCK_ARTICLE } from "@/lib/mockArticle";

// TODO: fetch real books article by id
const initialData: ArticleInitialData = {
  ...MOCK_ARTICLE,
  publishStatus: MOCK_ARTICLE.publishStatus,
};

export default function BooksEditPage() {
  return <BlogEditor genre="books" mode="edit" initialData={initialData} />;
}
