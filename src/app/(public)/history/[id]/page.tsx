import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getHistoryEventById } from '@/db/queries/select';
import { historyArticleHref, historyEraLabel, historyKindColor } from '@/lib/history';

// 管理画面での編集をすぐ反映するため、リクエストごとにレンダリングする
export const dynamic = 'force-dynamic';

// id は uuid なので、形式が違う値で DB に問い合わせると型エラーになる。先に弾いて 404 にする
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) return {};
  const event = await getHistoryEventById(id);
  if (!event) return {};
  return {
    title: `${event.title}（${event.dateLabel}）`,
    description: event.summary ?? undefined,
    openGraph: event.thumbnail ? { images: [{ url: event.thumbnail }] } : undefined,
  };
}

export default async function HistoryEventPage({ params }: Props) {
  const { id } = await params;
  if (!UUID_PATTERN.test(id)) notFound();
  const event = await getHistoryEventById(id);
  if (!event) notFound();
  // 記事にリンクしている出来事は詳細を記事に一本化しているので、URL を直接開いた場合もその記事（種類により制作物かブログ）へ移す
  if (event.productSlug) redirect(historyArticleHref(event.kind, event.productSlug));

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
