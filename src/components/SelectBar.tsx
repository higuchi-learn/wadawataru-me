'use client';

import { usePathname } from 'next/navigation';
import RoundButton from '@/components/RoundButton';

export type NavItem = { label: string; href: string };

export const NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', href: '/' },
  { label: '経歴', href: '/career' },
  { label: '資格', href: '/qualifications' },
  { label: '受賞歴', href: '/awards' },
  { label: '制作物', href: '/products' },
  { label: 'ブログ', href: '/blog' },
  { label: '読書記録', href: '/books' },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'ホーム', href: '/' },
  { label: '経歴', href: '/career' },
  { label: '資格', href: '/qualifications' },
  { label: '受賞歴', href: '/awards' },
  { label: '制作物', href: '/admin/products' },
  { label: 'ブログ', href: '/admin/blog' },
  { label: '読書記録', href: '/admin/books' },
];

type SelectBarProps = {
  items?: NavItem[];
  className?: string;
};

export default function SelectBar({ items = NAV_ITEMS, className }: SelectBarProps) {
  const pathname = usePathname();

  return (
    <nav className={className ?? 'flex items-center gap-2'}>
      {items.map(({ label, href }) => (
        <RoundButton key={label} href={href} state={pathname === href ? 'Enabled' : 'Disabled'}>
          {label}
        </RoundButton>
      ))}
    </nav>
  );
}
