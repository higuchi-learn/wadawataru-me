import PageLoading from '@/components/PageLoading';

// 記事ページ（同じフォルダの page.tsx）のデータを待つ間に表示する。一覧ページは (list) の loading.tsx が担当する
export default function Loading() {
  return <PageLoading />;
}
