'use client';

import { usePathname } from 'next/navigation';
import { useDialog } from '@/lib/useDialog';
import RoundButton from '@/components/RoundButton';
import { NAV_ITEMS, isNavActive, type NavItem } from '@/components/SelectBar';

type SideBarProps = {
  isOpen: boolean;
  onClose: () => void;
  items?: NavItem[];
};

export default function SideBar({ isOpen, onClose, items = NAV_ITEMS }: SideBarProps) {
  const pathname = usePathname();
  // 開いている間だけ、フォーカスの移動・トラップ・復帰、Esc で閉じる、背後のスクロール停止を行う（共通処理）
  // 閉じたときは、開くボタン（ハンバーガー）へフォーカスが戻る
  const panelRef = useDialog(isOpen, onClose);

  return (
    <>
      {/*
        オーバーレイ: サイドバーの外側を暗くして、クリックで閉じられるようにする
        fixed inset-0 で画面全体を覆い、z-40 でサイドバー（z-50）より下に置く
        isOpen のときだけレンダリングすることで DOM 上に余分な要素を残さない
      */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20 print:hidden" onClick={onClose} aria-hidden="true" />}

      {/*
        サイドバー本体: translate-x-full で画面右外に隠し、isOpen で translate-x-0 に切り替える
        transition-transform duration-300 でスライドアニメーションを付ける
        display: none より transform を使う方がアニメーションがスムーズになる
      */}
      {/* inert: 閉じているときは、画面の外に隠したリンクに Tab でフォーカスが移らないようにする
          （transform で隠しているだけなので、inert がないと見えない場所にフォーカスが移ってしまう）
          開いているときは role="dialog" + aria-modal でメニューのダイアログとして扱う */}
      <div
        ref={panelRef}
        id="site-menu"
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? true : undefined}
        aria-label="ナビゲーションメニュー"
        tabIndex={-1}
        inert={!isOpen}
        className={`fixed top-0 right-0 z-50 flex flex-col w-[200px] h-full bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)] transition-transform duration-300 print:hidden focus:outline-none ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 閉じるボタン */}
        <div className="flex items-center justify-end px-1 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center cursor-pointer"
            aria-label="メニューを閉じる"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current text-[var(--lighttext)]" aria-hidden="true">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-col items-center gap-1 py-1">
          {items.map(({ label, href }) => (
            <RoundButton
              key={label}
              href={href}
              state={isNavActive(pathname, href) ? 'Enabled' : 'Disabled'}
              onClick={onClose}
            >
              {label}
            </RoundButton>
          ))}
        </nav>
      </div>
    </>
  );
}
