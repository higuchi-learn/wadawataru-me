'use client';

import { usePathname } from 'next/navigation';
import RoundButton from '@/components/RoundButton';

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', href: '/' },
  { label: 'プロフィール', href: '/career' },
  { label: '年表', href: '/history' },
  { label: '資格', href: '/qualifications' },
  { label: '受賞歴', href: '/awards' },
  { label: '制作物', href: '/products' },
  { label: 'ブログ', href: '/blogs' },
  { label: '読書記録', href: '/books' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', href: '/' },
  { label: 'プロフィール', href: '/career' },
  { label: '年表', href: '/admin/history' },
  { label: '資格', href: '/qualifications' },
  { label: '受賞歴', href: '/awards' },
  { label: '制作物', href: '/admin/products' },
  { label: 'ブログ', href: '/admin/blogs' },
  { label: '読書記録', href: '/admin/books' },
  { label: 'タグ管理', href: '/admin/tags' },
  { label: '日記', href: '/admin/diary' },
];

// そのナビ項目を「今いる場所」としてハイライトするかどうか
// 完全一致だけだと、記事ページ（/products/bingo2）や年表の詳細（/history/xxx）でどの項目も光らず、
// 今どこにいるのかが分からない。そのため、配下のページ（href + '/' で始まるパス）にいるときも選択中とする
// ホーム（'/'）はすべてのパスが '/' で始まってしまうので、完全一致のときだけにする
export function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SelectBarProps = {
  items?: NavItem[];
  className?: string;
};

export default function SelectBar({ items = NAV_ITEMS, className }: SelectBarProps) {
  // usePathname() は現在の URL パスを返す（例: '/blog'）
  // 'use client' が必要な理由: pathname はブラウザのナビゲーションに依存するため
  // サーバー側では確定した値が得られない
  const pathname = usePathname();

  return (
    <nav className={className ?? 'flex items-center gap-2'} aria-label="サイト内のページ">
      {items.map(({ label, href }) => (
        // 今いる場所（そのページか、その配下のページ）のボタンを Enabled（選択済み）スタイルにする
        <RoundButton key={label} href={href} state={isNavActive(pathname, href) ? 'Enabled' : 'Disabled'}>
          {label}
        </RoundButton>
      ))}
    </nav>
  );
}
