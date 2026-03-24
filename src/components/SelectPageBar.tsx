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
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const half = 2;
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + 4);
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
