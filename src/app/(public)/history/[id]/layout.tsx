import { ensureHistoryEventPage } from '@/lib/publicRouteGuards';

// 出来事があるかどうか（なければ 404）と、記事にリンクしている出来事の移動を、
// ローディング画面（同じフォルダの loading.tsx）を出し始める前に済ませる。理由は src/lib/publicRouteGuards.ts
export default async function HistoryEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  await ensureHistoryEventPage((await params).id);
  return children;
}
