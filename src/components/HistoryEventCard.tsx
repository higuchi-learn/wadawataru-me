import Link from 'next/link';
import { historyKindColor, type HistoryKind } from '@/lib/history';

export type HistoryEventCardData = {
  id?: string;
  dateLabel: string;
  title: string;
  summary: string | null;
  kind: HistoryKind;
  badge: string | null;
  thumbnail: string | null;
  // 詳細本文があるときだけ詳細ページへのリンクを出す
  hasDetail: boolean;
};

// 年表（/history）の1件分の表示。公開ページと管理画面のプレビューで共有する
// align: 'left' は md 以上で中央線の左側に置くときの右寄せ表示
export default function HistoryEventCard({ event, align }: { event: HistoryEventCardData; align: 'left' | 'right' }) {
  const color = historyKindColor(event.kind);
  const detailHref = event.id ? `/history/${event.id}` : '#';
  return (
    <div className={align === 'left' ? 'md:text-right' : ''}>
      <div className={`flex flex-wrap items-baseline gap-x-3 gap-y-1 ${align === 'left' ? 'md:justify-end' : ''}`}>
        <p className="text-xl sm:text-2xl font-bold leading-tight" style={{ color }}>
          {event.dateLabel}
        </p>
        {event.badge && (
          <span className="text-xs font-bold rounded-full px-2.5 py-0.5 text-white" style={{ backgroundColor: color }}>
            {event.badge}
          </span>
        )}
      </div>
      <h3 className="text-sm font-bold text-black mt-1.5 leading-6">
        {event.hasDetail ? (
          <Link href={detailHref} className="hover:text-[var(--ogangetext)] transition-colors">
            {event.title}
          </Link>
        ) : (
          event.title
        )}
      </h3>
      {event.summary && <p className="text-xs text-[var(--lighttext)] mt-1 leading-6">{event.summary}</p>}
      {event.thumbnail && (
        <img
          src={event.thumbnail}
          alt={event.title}
          className={`mt-3 w-full max-w-sm aspect-video object-cover rounded-lg border border-[var(--unclickable)] ${align === 'left' ? 'md:ml-auto' : ''}`}
        />
      )}
      {event.hasDetail && (
        <Link
          href={detailHref}
          className="inline-block mt-2 text-xs font-bold text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
        >
          詳しく見る →
        </Link>
      )}
    </div>
  );
}
