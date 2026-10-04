import PageLoading from '@/components/PageLoading';

// 年表の一覧のデータを待つ間に表示する
// 詳細（[id]）は、ローディング画面より手前の layout.tsx で 404 を判定するため、別に [id]/loading.tsx を置いている
// （ここ（history/）に置くと [id] の layout.tsx まで内側に入り、404 のステータスを返せなくなる）
export default function Loading() {
  return <PageLoading />;
}
