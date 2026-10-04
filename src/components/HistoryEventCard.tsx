import Link from 'next/link';
import { historyKindColor, type HistoryKind } from '@/lib/history';
import HistoryEventDetailDialog, { type HistoryEventDetail } from '@/components/HistoryEventDetailDialog';

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
  // 制作物の記事の slug。あれば詳細ページではなく記事（/products/slug）へリンクする
  productSlug: string | null;
  // 期間のある出来事のとき、終わりの文言（「2023年9月まで」など）と年表上の線の色。期間がなければ null
  period: { label: string; color: string } | null;
  // 詳細（Markdown）をダイアログで表示するためのデータ。渡されたときは、別ページへ移動せずダイアログで開く
  detail?: Omit<HistoryEventDetail, 'color'>;
};

// 年表（/history）の1件分の表示。公開ページと管理画面のプレビューで共有する
// align: 'left' は md 以上で中央線の左側に置くときの右寄せ表示
export default function HistoryEventCard({ event, align }: { event: HistoryEventCardData; align: 'left' | 'right' }) {
  const color = historyKindColor(event.kind);
  // 制作物の出来事は、受賞歴やトップページと同じ記事へ飛ばし、どこから押しても行き先が揃うようにする
  const detailHref = event.productSlug ? `/products/${event.productSlug}` : event.id ? `/history/${event.id}` : '#';
  const hasLink = event.productSlug !== null || event.hasDetail;
  // 制作物の記事がない出来事で、詳細のデータがあるときは、リンクではなくダイアログを開くボタンにする
  const dialogDetail: HistoryEventDetail | null =
    !event.productSlug && event.hasDetail && event.detail ? { ...event.detail, color } : null;
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
      {event.period && (
        <p
          className={`flex items-center gap-1.5 mt-1 text-xs font-bold ${align === 'left' ? 'md:justify-end' : ''}`}
          style={{ color: event.period.color }}
        >
          <span className="w-4 h-[3px] rounded-full" style={{ backgroundColor: event.period.color }} />
          {event.period.label}
        </p>
      )}
      <h3 className="text-sm font-bold text-black mt-1.5 leading-6">
        {/* 詳細をポップアップで開く出来事は、ほかのページのカードと同じく、タイトルは文字のままにして下の「くわしく ›」から開く */}
        {dialogDetail ? (
          event.title
        ) : hasLink ? (
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
      {dialogDetail ? (
        // 経歴ページなどのカードと同じ「くわしく ›」（MoreDetails）で開く
        // md 以上で中央線の左側に置くカード（右寄せ）では、ボタンも右端にそろえる
        // （ボタンはピルの内側に左右 12px の余白があるので、-mr-3 で文字の右端をカードの文字の右端に合わせる）
        <div className={`mt-2 ${align === 'left' ? 'md:flex md:justify-end md:-mr-3' : ''}`}>
          <HistoryEventDetailDialog detail={dialogDetail} />
        </div>
      ) : (
        hasLink && (
          <Link
            href={detailHref}
            className="inline-block mt-2 text-xs font-bold text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors border-b border-[var(--border)] pb-0.5"
          >
            {event.productSlug ? '制作物の記事を読む →' : '詳しく見る →'}
          </Link>
        )
      )}
    </div>
  );
}
