'use client';

import { usePathname } from 'next/navigation';
import RoundButton from '@/components/RoundButton';
import { NAV_ITEMS, type NavItem } from '@/components/SelectBar';

type SideBarProps = {
  isOpen: boolean;
  onClose: () => void;
  items?: NavItem[];
};

export default function SideBar({ isOpen, onClose, items = NAV_ITEMS }: SideBarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* オーバーレイ */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} aria-hidden="true" />}

      {/* サイドバー本体 */}
      <div
        className={`fixed top-0 right-0 z-50 flex flex-col w-[200px] h-full bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="ナビゲーションメニュー"
      >
        {/* 閉じるボタン */}
        <div className="flex items-center justify-end px-1 py-2.5">
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center cursor-pointer"
            aria-label="メニューを閉じる"
          >
            <svg viewBox="0 0 24 24" className="size-5 fill-current text-[var(--lighttext)]">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="flex flex-col items-center gap-1 py-1">
          {items.map(({ label, href }) => (
            <RoundButton key={label} href={href} state={pathname === href ? 'Enabled' : 'Disabled'} onClick={onClose}>
              {label}
            </RoundButton>
          ))}
        </nav>
      </div>
    </>
  );
}
