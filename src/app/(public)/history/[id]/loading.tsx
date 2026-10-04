import PageLoading from '@/components/PageLoading';

// 年表の出来事の詳細ページのデータを待つ間に表示する
// 出来事があるかどうかは、この外側の layout.tsx で先に確かめている（404 のステータスを正しく返すため）
export default function Loading() {
  return <PageLoading />;
}
