import PageLoading from '@/components/PageLoading';

// 管理画面の一覧ページ（記事・年表・タグ・日記）のデータを待つ間に表示する。(list) の layout（ヘッダー）は表示したまま中身だけ差し替わる
export default function Loading() {
  return <PageLoading />;
}
