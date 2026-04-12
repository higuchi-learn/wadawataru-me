import Link from 'next/link';
import StatusBar from '@/components/StatusBar';
import SearchBar from '@/components/SearchBar';
import type { Genre } from '@/components/GenreAbout';
import type { TagItem } from '@/components/TagSelectOverlay';

type AdminSelectBarProps = {
  genre: Genre;
  availableTags?: TagItem[];
  className?: string;
};

export default function AdminSelectBar({ genre, availableTags, className }: AdminSelectBarProps) {
  return (
    <div className={`flex flex-wrap items-center justify-center gap-1 px-1 py-2 ${className ?? ''}`}>
      <StatusBar />
      <SearchBar availableTags={availableTags} className="w-[365px]" />
      <Link
        href={`/admin/${genre}/create`}
        className="bg-[var(--error-bg)] text-[var(--error)] text-sm leading-5 px-1.5 py-1.5 rounded-full whitespace-nowrap hover:opacity-80 transition-opacity"
      >
        新規作成
      </Link>
    </div>
  );
}
