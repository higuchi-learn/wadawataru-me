import ArticlePage from "@/components/ArticlePage";
import { MOCK_ARTICLE } from "@/lib/mockArticle";

// TODO: fetch real products article by id

export default function ProductsArticlePage() {
  return <ArticlePage {...MOCK_ARTICLE} />;
}
