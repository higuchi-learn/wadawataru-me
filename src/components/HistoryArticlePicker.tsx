'use client';

import { useId, useState } from 'react';
import { useDialog } from '@/lib/useDialog';

// 選べる記事（公開中の記事）。管理画面の年表のページ（サーバー）で取得して渡す
export type PickerArticle = {
  slug: string;
  title: string;
  description: string;
  thumbnail: string | null;
};

// 年表の出来事にリンクする記事を、記事のカードの一覧から選ぶ部品
// 以前は slug を直接入力していたが、slug を覚えていないと入力できず、打ち間違えると存在しない記事へのリンクになっていた
export default function HistoryArticlePicker({
  genreLabel,
  articles,
  value,
  onChange,
  error,
}: {
  // 「制作物」「ブログ」。種類（技術・開発・資格 / 学校・活動・仕事）によって切り替わる
  genreLabel: string;
  articles: PickerArticle[];
  // 選択中の記事の slug（空文字ならリンクしない）
  value: string;
  onChange: (slug: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const labelId = useId();
  const selected = articles.find((a) => a.slug === value);

  return (
    <div className="flex flex-col gap-0 p-1 w-full">
      <div className="flex items-center gap-1 text-xs leading-4">
        <span id={labelId} className="text-black">
          リンクする{genreLabel}の記事
        </span>
        {error && (
          <span role="alert" className="text-[var(--error)]">
            {error}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1" role="group" aria-labelledby={labelId}>
        {/* 選択中の記事。公開中の記事に見つからない slug（下書きに戻した・消したなど）のときは、そのことを示す */}
        <p className="flex-1 min-w-0 h-7 px-2 flex items-center text-sm leading-5 truncate bg-[var(--inputcontainer)] border border-[var(--inputborder,#9f9fa9)] rounded-sm">
          {value === '' ? (
            <span className="text-[var(--lighttext)]">リンクしない（年表から詳細をポップアップで表示）</span>
          ) : selected ? (
            selected.title
          ) : (
            <span className="text-[var(--error)]">
              「{value}」は公開中の{genreLabel}の記事に見つかりません。
            </span>
          )}
        </p>
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => setOpen(true)}
          className="h-7 px-2 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
        >
          {value === '' ? '記事を選ぶ' : '変更'}
        </button>
        {value !== '' && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="h-7 px-2 rounded-md bg-white shadow-sm text-[var(--lighttext)] text-sm whitespace-nowrap hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
          >
            リンクを外す
          </button>
        )}
      </div>
      {open && (
        <PickerDialog
          genreLabel={genreLabel}
          articles={articles}
          value={value}
          onSelect={(slug) => {
            onChange(slug);
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function PickerDialog({
  genreLabel,
  articles,
  value,
  onSelect,
  onClose,
}: {
  genreLabel: string;
  articles: PickerArticle[];
  value: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
}) {
  // フォーカスの移動・トラップ・復帰、Esc で閉じる、背後のスクロール停止（共通処理）
  const panelRef = useDialog(true, onClose);
  const titleId = useId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-4xl max-h-[85vh] bg-[var(--page-bg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 p-3 shrink-0">
          <h2 id={titleId} className="text-sm font-bold text-black">
            リンクする{genreLabel}の記事を選ぶ
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-full text-sm text-[var(--lighttext)] hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] transition-colors"
          >
            キャンセル
          </button>
        </div>
        <div className="flex-1 overflow-auto p-3">
          {articles.length === 0 ? (
            <p className="py-8 text-sm text-[var(--lighttext)] text-center">
              公開中の{genreLabel}の記事はまだありません。
            </p>
          ) : (
            // 記事一覧のカードと同じく、サムネイル・タイトル・説明で選べるようにする。押すとその記事を選んで閉じる
            <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
              {articles.map((article) => {
                const isSelected = article.slug === value;
                return (
                  <li key={article.slug}>
                    <button
                      type="button"
                      // aria-pressed: 今選ばれている記事を、色だけでなく読み上げソフトにも伝える
                      aria-pressed={isSelected}
                      onClick={() => onSelect(article.slug)}
                      className={`w-full h-full text-left flex flex-col bg-white rounded-xl overflow-hidden border transition-colors hover:border-[var(--ogangetext)] ${
                        isSelected
                          ? 'border-[var(--ogangetext)] ring-2 ring-[var(--ogangetext)]'
                          : 'border-[var(--softborder)]'
                      }`}
                    >
                      {/* サムネイル未設定の記事は、記事一覧と同じくタイトルから自動生成した画像（/api/og）を出す */}
                      <img
                        src={article.thumbnail ?? `/api/og?title=${encodeURIComponent(article.title)}`}
                        alt=""
                        className="w-full aspect-video object-cover"
                      />
                      <span className="p-2 flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-black leading-5 line-clamp-1">{article.title}</span>
                        <span className="text-xs text-[var(--lighttext)] leading-4 line-clamp-2">
                          {article.description}
                        </span>
                        {isSelected && <span className="text-xs font-bold text-[var(--ogangetext)]">選択中</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
