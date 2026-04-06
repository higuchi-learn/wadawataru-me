'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import PageSelectButton from '@/components/PageSelectButton';

type SelectPageBarProps = {
  totalPages: number;
  className?: string;
};

export default function SelectPageBar({ totalPages, className }: SelectPageBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
  };

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  const getPageNumbers = (): number[] => {
    // 総ページ数が5以下ならすべてのページ番号を表示する
    // Array.from({ length: N }, (_, i) => i + 1) で [1, 2, ..., N] を生成する
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // 現在ページを中心に前後2ページ（計5ページ）を表示する
    // 端に近い場合は start/end をクランプして常に5件表示を維持する
    const half = 2;
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + 4);
    // end が totalPages にクランプされた場合、start を後ろから5件になるよう調整する
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className={className ?? 'flex items-center gap-0.5'}>
      <PageSelectButton category="First" isDisabled={isFirst} onClick={() => setPage(1)} />
      <PageSelectButton category="Before" isDisabled={isFirst} onClick={() => setPage(currentPage - 1)} />
      {getPageNumbers().map((page) => (
        <PageSelectButton
          key={page}
          category="Number"
          page={page}
          isActive={page === currentPage}
          onClick={() => setPage(page)}
        />
      ))}
      <PageSelectButton category="Next" isDisabled={isLast} onClick={() => setPage(currentPage + 1)} />
      <PageSelectButton category="Last" isDisabled={isLast} onClick={() => setPage(totalPages)} />
    </div>
  );
}
