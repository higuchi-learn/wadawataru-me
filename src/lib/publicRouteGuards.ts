import { notFound, redirect } from 'next/navigation';
import type { Genre } from '@/components/GenreAbout';
import { isPublishedPostSlug, getPublicHistoryEvent } from '@/db/queries/cached';
import { HISTORY_EVENT_ID_PATTERN, historyArticleHref } from '@/lib/history';

// 公開ページの「その URL のページがあるか」の確認を、ローディング画面より手前（各 [slug] / [id] の layout.tsx）で行う関数
//
// 理由: loading.tsx を置くと、Next.js はヘッダーとローディング画面を先に送り始め、そのときにステータス 200 も送ってしまう。
// ページ本体（loading.tsx の内側）で notFound() を呼んでも、送ったステータスは変えられず、
// 404 の画面なのにステータスは 200（いわゆるソフト 404）になっていた。クローラーに対しても同じだった。
// layout.tsx は同じフォルダの loading.tsx より外側にあるので、ここで確かめれば送り始める前にステータスを決められる。
//
// ここでの確認は作り置き（cached.ts）を使い、Neon を待たない。記事本文の読み込みなど時間がかかる部分は、
// これまでどおりページ本体でローディング画面を出しながら待つ（何かの理由で遅いときにも反応が見えるように残している）

// 記事ページ: そのジャンルに公開中の記事がなければ 404（違うジャンルの URL も 404）
export async function ensurePublishedPost(genre: Genre, slug: string): Promise<void> {
  if (!(await isPublishedPostSlug(genre, slug))) notFound();
}

// 年表の詳細ページ: 出来事がなければ 404。記事にリンクしている出来事は、その記事へ移す（307）
// 移す処理もここで行うのは、ローディング画面を送り始めたあとだと、ステータスで移せず画面の中での移動になるため
export async function ensureHistoryEventPage(id: string): Promise<void> {
  // id は uuid なので、形式が違う値で DB に問い合わせると型エラーになる。先に弾いて 404 にする
  if (!HISTORY_EVENT_ID_PATTERN.test(id)) notFound();
  const event = await getPublicHistoryEvent(id);
  if (!event) notFound();
  // 記事にリンクしている出来事は詳細を記事に一本化しているので、URL を直接開いた場合もその記事（種類により制作物かブログ）へ移す
  if (event.productSlug) redirect(historyArticleHref(event.kind, event.productSlug));
}
