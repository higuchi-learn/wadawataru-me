import PageLoading from '@/components/PageLoading';

// 管理画面の編集ページ（記事・年表・日記の作成・編集）のデータを待つ間に表示する。一覧ページは (list) の loading.tsx が担当する
export default function Loading() {
  return <PageLoading />;
}
