import ArticlePage from "@/components/ArticlePage";
import { MOCK_ARTICLE } from "@/lib/mockArticle";

// TODO: fetch real books article by id

export default function BooksArticlePage() {
  return <ArticlePage {...MOCK_ARTICLE} />;
}
