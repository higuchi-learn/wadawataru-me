'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { formatDiaryDate } from '@/lib/formatDate';
import {
  A4_WIDTH_MM,
  A4_HEIGHT_MM,
  A4_MARGIN_MM,
  A4_MM_TO_PX,
  A4_TEXT_CLASS,
  A4CoverPage,
  A4TextPage,
  diaryContentToHtml,
} from '@/components/DiaryPageView';

type Entry = { date: string; content: string };

type Props = {
  entries: Entry[];
};

// ◀▶ボタン自体の幅と、ボタン⇔本の間の余白。ページ幅はここを差し引いた残り全部を使う
const ARROW_WIDTH = 40;
const ARROW_GAP = 8;

const SLIDE_MS = 350;

// 表紙も含めて「1件＝1ページ」として一列に並べたもの
type ContentPage = { isCover: true } | { isCover?: false; date: string; text: string };

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

// requestAnimationFrame を2回挟むことで、ブラウザが「移動前の状態」を1度描画してから
// 移動後の値をセットできる。1回だけだと稀に描画が間に合わず transition が発火しないことがある
function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}

// 本文を「1ページ（A4）に収まる長さ」ごとに区切る
// fits(text) は、その文字列がはみ出さずに1ページに収まるかどうかを返す関数
// 二分探索で「収まる最大の文字数」を探し、それを1ページぶんとして切り出す処理を繰り返す
function splitIntoPages(content: string, fits: (text: string) => boolean): string[] {
  if (!content) return [''];

  const pages: string[] = [];
  let remaining = content;

  while (remaining.length > 0) {
    if (fits(remaining)) {
      pages.push(remaining);
      break;
    }

    let lo = 1;
    let hi = remaining.length;
    let best = 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (fits(remaining.slice(0, mid))) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    pages.push(remaining.slice(0, best));
    remaining = remaining.slice(best);
  }

  return pages;
}

function PageView({ page }: { page: ContentPage }) {
  return page.isCover ? <A4CoverPage /> : <A4TextPage text={page.text} />;
}

export default function DiaryBook({ entries }: Props) {
  // 本のページは古い日付から新しい日付の順（進むほど日付が進む）にするため昇順に並べ替える
  const ascending = useMemo(() => [...entries].sort((a, b) => (a.date < b.date ? -1 : 1)), [entries]);

  const measurerRef = useRef<HTMLDivElement | null>(null);
  const [contentPages, setContentPages] = useState<ContentPage[] | null>(null);

  // 本文をA4ページと同じフォント・行間・実寸（mm）で計測し、「1ページに収まる分」ごとに切り分ける
  // 日をまたぐときに前日の余白に翌日の文章を詰め込まないよう、日ごとに独立して分割している
  useEffect(() => {
    const measurer = measurerRef.current;
    if (!measurer) return;

    // 実際のページ（A4TextPage）と同じ diaryContentToHtml() で描画してから測ることで、
    // 段落間の余白や字下げ込みの本当の見た目に対して「収まるかどうか」を判定できる
    const fits = (text: string) => {
      measurer.innerHTML = diaryContentToHtml(text);
      return measurer.scrollWidth <= measurer.clientWidth;
    };

    const pages: ContentPage[] = [{ isCover: true }];
    for (const entry of ascending) {
      for (const text of splitIntoPages(entry.content, fits)) {
        pages.push({ date: entry.date, text });
      }
    }
    setContentPages(pages);
  }, [ascending]);

  // 画面表示用に、A4の実寸（mm）を「本の表示エリア（◀ ページ ▶ の行）」に収まる倍率へ縮小する
  // 実寸そのものより大きく表示することはしない（scale の上限を1にしている）
  // ウィンドウのリサイズには追従しない（初回マウント時の1回だけ計測する）
  const rowRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const availableWidth = Math.max(100, rect.width - (ARROW_WIDTH + ARROW_GAP) * 2);
    const availableHeight = Math.max(100, rect.height);
    const a4WidthPx = A4_WIDTH_MM * A4_MM_TO_PX;
    const a4HeightPx = A4_HEIGHT_MM * A4_MM_TO_PX;
    setScale(Math.min(availableWidth / a4WidthPx, availableHeight / a4HeightPx, 1));
  }, []);

  const [pageIndex, setPageIndex] = useState(0);
  const pageIndexRef = useRef(pageIndex);
  pageIndexRef.current = pageIndex;

  // 初回にページ分割が終わったら、最新（一番最後）のページをアニメーションなしで表示する
  const initializedRef = useRef(false);
  useEffect(() => {
    if (contentPages && !initializedRef.current) {
      initializedRef.current = true;
      setPageIndex(contentPages.length - 1);
    }
  }, [contentPages]);

  const isAnimatingRef = useRef(false);
  const [slide, setSlide] = useState<{ outgoing: ContentPage; incoming: ContentPage; forward: boolean } | null>(null);
  const [settled, setSettled] = useState(false);
  const [transitionMs, setTransitionMs] = useState(0);

  const displayPage = contentPages ? contentPages[pageIndex] : undefined;

  // 常に1ページだけを表示し、◀▶では横にスライドして次・前のページへ移る
  // 進む（◀）: 今のページは右へスライドして消え、次のページが左から入ってくる
  // 戻る（▶）: 今のページは左へスライドして消え、前のページが右から入ってくる
  const goTo = async (targetIndex: number) => {
    if (isAnimatingRef.current) return;
    if (!contentPages) return;
    if (targetIndex < 0 || targetIndex >= contentPages.length) return;
    const fromIndex = pageIndexRef.current;
    if (targetIndex === fromIndex) return;

    isAnimatingRef.current = true;

    const forward = targetIndex > fromIndex;
    setSlide({ outgoing: contentPages[fromIndex], incoming: contentPages[targetIndex], forward });
    setTransitionMs(0);
    setSettled(false);

    await nextFrame();

    setTransitionMs(SLIDE_MS);
    setSettled(true);

    await sleep(SLIDE_MS);

    setPageIndex(targetIndex);
    setSlide(null);
    setSettled(false);
    isAnimatingRef.current = false;
  };

  if (ascending.length === 0) {
    return (
      <div className="flex-1 min-h-0 flex items-center justify-center border border-[var(--inputborder,#9f9fa9)] rounded-sm text-sm text-[var(--lighttext,#6a7282)]">
        本を開くにはまず日記を書いてください。
      </div>
    );
  }

  const hasPrev = pageIndex > 0;
  const hasNext = !!contentPages && pageIndex < contentPages.length - 1;
  const a4WidthPx = A4_WIDTH_MM * A4_MM_TO_PX;
  const a4HeightPx = A4_HEIGHT_MM * A4_MM_TO_PX;

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center gap-2 w-full">
      {/* 実際には表示しない計測用の要素。ページ本文と全く同じフォント・行間・実寸にしておくことで
          「この文字数までなら1ページに収まる」を正確に判定できる
          print:hidden が無いと、position: fixed + 画面外への大きな負の座標が原因で、印刷時に
          先頭へ余計な白紙ページが1枚挿入されてしまうことがある（ブラウザの印刷ページ計算のバグ） */}
      <div
        ref={measurerRef}
        aria-hidden
        className={`${A4_TEXT_CLASS} print:hidden`}
        style={{
          position: 'fixed',
          top: -99999,
          left: -99999,
          width: `${A4_WIDTH_MM - A4_MARGIN_MM * 2}mm`,
          height: `${A4_HEIGHT_MM - A4_MARGIN_MM * 2}mm`,
          writingMode: 'vertical-rl',
          whiteSpace: 'pre-wrap',
          visibility: 'hidden',
        }}
      />

      <div className="flex items-center justify-center gap-3 w-full shrink-0 print:hidden">
        {contentPages && displayPage ? (
          displayPage.isCover ? (
            <span className="text-sm text-[var(--lighttext,#6a7282)]">表紙</span>
          ) : (
            <>
              <span className="text-sm font-bold text-black">{formatDiaryDate(displayPage.date)}</span>
              <Link
                href={`/admin/diary/${displayPage.date}`}
                className="text-xs text-[var(--ogangetext)] hover:underline"
              >
                編集する
              </Link>
            </>
          )
        ) : (
          <span className="text-sm text-transparent select-none">-</span>
        )}
      </div>

      {/* この行の実測サイズを元にA4ページの縮小倍率を決めるので、中身が空でも常に描画しておく必要がある */}
      <div ref={rowRef} className="flex-1 min-h-0 w-full flex items-stretch justify-center gap-2 print:hidden">
        {scale === null ? null : contentPages === null ? (
          <p className="self-center text-sm text-[var(--lighttext,#6a7282)]">本を準備しています…</p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => void goTo(pageIndex + 1)}
              disabled={!hasNext}
              aria-label="次のページ"
              style={{ width: ARROW_WIDTH }}
              className="shrink-0 flex items-center justify-center text-2xl text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              ◀
            </button>

            <div
              className="relative shrink-0 border border-[var(--inputborder,#9f9fa9)] rounded-sm shadow-md overflow-hidden"
              style={{ width: a4WidthPx * scale, height: a4HeightPx * scale }}
            >
              <div
                className="relative"
                style={{
                  width: a4WidthPx,
                  height: a4HeightPx,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
              >
                {!slide ? (
                  displayPage && <PageView page={displayPage} />
                ) : (
                  <>
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `translateX(${settled ? (slide.forward ? '100%' : '-100%') : '0%'})`,
                        transition: transitionMs ? `transform ${transitionMs}ms ease-in-out` : 'none',
                      }}
                    >
                      <PageView page={slide.outgoing} />
                    </div>
                    <div
                      className="absolute inset-0"
                      style={{
                        transform: `translateX(${settled ? '0%' : slide.forward ? '-100%' : '100%'})`,
                        transition: transitionMs ? `transform ${transitionMs}ms ease-in-out` : 'none',
                      }}
                    >
                      <PageView page={slide.incoming} />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => void goTo(pageIndex - 1)}
              disabled={!hasPrev}
              aria-label="前のページ"
              style={{ width: ARROW_WIDTH }}
              className="shrink-0 flex items-center justify-center text-2xl text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors disabled:opacity-30 disabled:pointer-events-none"
            >
              ▶
            </button>
          </>
        )}
      </div>

      {/* 印刷時だけ表示する。表紙は印刷不要なので除き、日記の中身だけを実際のA4サイズ（mm）のまま
          1ページずつ改ページして並べる */}
      <div className="hidden print:block">
        {contentPages
          ?.filter((page): page is Exclude<ContentPage, { isCover: true }> => !page.isCover)
          .map((page, i, printPages) => (
            <div key={page.date + i} style={{ pageBreakAfter: i < printPages.length - 1 ? 'always' : 'auto' }}>
              <PageView page={page} />
            </div>
          ))}
      </div>
    </div>
  );
}
