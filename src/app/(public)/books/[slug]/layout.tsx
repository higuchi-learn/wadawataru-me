import { ensurePublishedPost } from '@/lib/publicRouteGuards';

// 記事があるかどうかを、ローディング画面（同じフォルダの loading.tsx）を出し始める前に確かめる
// 理由は src/lib/publicRouteGuards.ts
export default async function ArticleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  await ensurePublishedPost('books', (await params).slug);
  return children;
}
