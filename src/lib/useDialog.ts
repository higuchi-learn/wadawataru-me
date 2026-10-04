'use client';

import { useEffect, useRef, type RefObject } from 'react';

// ダイアログ内で Tab キーの移動先になる要素
const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

// モーダル（ダイアログ）を、キーボードや読み上げソフトでも使えるようにするための共通処理
// タグの選択画面・タグの編集・スマホのメニューなどで使う
//
// やること（open が true の間だけ）:
//   - 開いたらフォーカスをダイアログの中へ移す（背後の要素に残ったままだと、Tab で暗くした背後を移動してしまう）
//   - Tab がダイアログの外へ出ないようにする（最後の次は最初へ、最初の前は最後へ回す = フォーカストラップ）
//   - Esc で閉じる
//   - 開いている間は背後のページをスクロールさせない
//   - 閉じたら、開く前にフォーカスしていた要素（開くボタンなど）へフォーカスを戻す
//
// 使い方: const panelRef = useDialog(open, onClose); をダイアログ本体の要素の ref に渡し、
//         その要素に role="dialog" aria-modal="true" と、tabIndex={-1}（フォーカスを受け取るため）を付ける
export function useDialog<T extends HTMLElement = HTMLDivElement>(
  open: boolean,
  onClose: () => void,
): RefObject<T | null> {
  const panelRef = useRef<T>(null);
  // onClose は親が描画のたびに作り直すことがあるので、最新のものを ref に入れておき、
  // 下の useEffect（open が変わったときだけ動く）からは ref 経由で呼ぶ
  // ref の書き換えは描画中ではなく useEffect の中で行う（描画中の書き換えは react-hooks/refs で禁止されている）
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panelRef.current) return;
      const items = panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === panelRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open]);

  return panelRef;
}
