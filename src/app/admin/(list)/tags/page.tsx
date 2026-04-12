import TagManagementPage from '@/components/TagManagementPage';
import { getTagsForGenre } from '@/db/queries/select';

export default async function AdminTagsPage() {
  // 全ジャンルのタグを並列取得してクライアントコンポーネントに渡す
  // クライアント側でジャンルタブを切り替えるだけで再フェッチ不要になる
  const [products, blogs, books] = await Promise.all([
    getTagsForGenre('products'),
    getTagsForGenre('blogs'),
    getTagsForGenre('books'),
  ]);

  return (
    <TagManagementPage
      initialTagsByGenre={{ products, blogs, books }}
    />
  );
}
