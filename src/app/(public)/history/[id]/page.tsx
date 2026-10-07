import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPublicHistoryEvent } from '@/db/queries/cached';
import { HISTORY_EVENT_ID_PATTERN, historyEraLabel, historyKindColor } from '@/lib/history';
import { canonical, siteOpenGraph } from '@/lib/siteMetadata';

// 出来事のデータは作り置き（getPublicHistoryEvent）を使い、アクセスのたびに Neon へ問い合わせないようにする
// 管理画面で保存すると作り置きを捨て、次のアクセスで最新になる

// 出来事がない id の 404 と、記事にリンクしている出来事の移動は、ローディング画面より手前の layout.tsx で済ませている

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!HISTORY_EVENT_ID_PATTERN.test(id)) return {};
  const event = await getPublicHistoryEvent(id);
  if (!event) return {};
  const title = `${event.title}（${event.dateLabel}）`;
  return {
    title,
    description: event.summary ?? undefined,
    // 題名を og:title にも入れる。画像があれば出来事の画像、なければサイト共通の画像（本人の写真）
    openGraph: event.thumbnail ? { ...siteOpenGraph(title), images: [{ url: event.thumbnail }] } : siteOpenGraph(title),
    // 画像があるときは、layout.tsx の twitter（本人の写真）を出来事の画像で上書きする
    alternates: canonical(`/history/${id}`),
    twitter: event.thumbnail ? { card: 'summary_large_image', images: [event.thumbnail] } : undefined,
  };
}

export default async function HistoryEventPage({ params }: Props) {
  const { id } = await params;
  // Next.js は layout.tsx の確認と並行してページ本体も動かし始めるので、形式が違う id はここでも DB に問い合わせる前に止める
  if (!HISTORY_EVENT_ID_PATTERN.test(id)) notFound();
  const event = await getPublicHistoryEvent(id);
  // 出来事がない id は layout.tsx で 404 にしている（ここは、確認とこの間に削除された場合のため）
  if (!event) notFound();

  const color = historyKindColor(event.kind);

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-[var(--page-bg)] border-b border-[var(--border)] px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-3 sm:py-4">
        <Link
          href="/history"
          className="text-xs font-bold text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors"
        >
          ← 年表に戻る
        </Link>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-6">
          <p className="text-2xl sm:text-3xl font-bold" style={{ color }}>
            {event.dateLabel}
          </p>
          <span className="text-xs text-[var(--lighttext)]">{historyEraLabel(event.era)}</span>
          {event.badge && (
            <span
              className="text-xs font-bold rounded-full px-2.5 py-0.5 text-white"
              style={{ backgroundColor: color }}
            >
              {event.badge}
            </span>
          )}
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mt-2">{event.title}</h1>
        {event.summary && <p className="text-sm text-[var(--lighttext)] mt-3 max-w-2xl leading-7">{event.summary}</p>}
      </div>

      <div className="bg-white px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28 py-12 sm:py-16">
        <article className="max-w-3xl mx-auto">
          {event.thumbnail && (
            <img
              src={event.thumbnail}
              alt={event.title}
              className="w-full rounded-xl border border-[var(--unclickable)] mb-10"
            />
          )}
          {event.content.trim() ? (
            <div className="markdown-preview">
              <Markdown remarkPlugins={[remarkGfm]}>{event.content}</Markdown>
            </div>
          ) : (
            <p className="text-sm text-[var(--lighttext)]">詳細はまだありません。</p>
          )}
        </article>
      </div>
    </div>
  );
}
