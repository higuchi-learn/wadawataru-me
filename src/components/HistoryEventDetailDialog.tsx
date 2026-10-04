import type { ReactNode } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import MoreDetails from '@/components/MoreDetails';

export type HistoryEventDetail = {
  dateLabel: string;
  eraLabel: string;
  title: string;
  summary: string | null;
  badge: string | null;
  // 種類ごとの色（日付・ラベルの色に使う）。年表のカードと同じ色にそろえる
  color: string;
  thumbnail: string | null;
  content: string;
};

// 年表の出来事の詳細を、ページを移動せずにポップアップで表示する「くわしく ›」ボタン
// 経歴ページやトップページのカードの「くわしく」と同じ MoreDetails を使い、開き方（ふわっと拡大・背景のぼかし）・
// 見た目（上に画像、見出し、区切り線、本文）・閉じ方（× ボタン・背景のクリック・Esc）をサイト全体でそろえる
//
// 以前は /history/[id] の別ページへ移動していたが、年表を読み進める途中で毎回ページが切り替わり、
// 戻るたびに読んでいた位置を探し直す必要があった。ポップアップなら、閉じるとそのまま年表の同じ位置に戻れる
// （/history/[id] のページ自体は、外部からの直接リンクやサイトマップのために残している）
export default function HistoryEventDetailDialog({ detail }: { detail: HistoryEventDetail }) {
  const parts = historyDetailParts(detail);
  return (
    <MoreDetails title={detail.title} media={parts.media} header={parts.header}>
      {parts.body}
    </MoreDetails>
  );
}

// ポップアップに入れる部品（画像・見出しの下の情報・本文）
// 年表のポップアップと、管理画面の年表エディタのプレビュー（MoreDetailsBody）の両方で使い、見た目を一致させる
export function historyDetailParts(detail: HistoryEventDetail): {
  media?: ReactNode;
  header: ReactNode;
  body: ReactNode;
} {
  return {
    // 画像はポップアップの上部に全幅で出す（経歴ページの「くわしく」と同じ配置）
    media: detail.thumbnail ? (
      <img src={detail.thumbnail} alt={detail.title} className="w-full aspect-video object-cover" />
    ) : undefined,
    // 見出しの下: 日付・時代・ラベル → 概要（詳細ページ /history/[id] と同じ並び）
    header: (
      <>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="text-lg font-bold" style={{ color: detail.color }}>
            {detail.dateLabel}
          </p>
          <span className="text-xs text-[var(--lighttext)]">{detail.eraLabel}</span>
          {detail.badge && (
            <span
              className="text-xs font-bold rounded-full px-2.5 py-0.5 text-white"
              style={{ backgroundColor: detail.color }}
            >
              {detail.badge}
            </span>
          )}
        </div>
        {detail.summary && <p className="text-sm text-[var(--lighttext)] mt-2 leading-7">{detail.summary}</p>}
      </>
    ),
    body: (
      <div className="markdown-preview">
        <Markdown remarkPlugins={[remarkGfm]}>{detail.content}</Markdown>
      </div>
    ),
  };
}
