'use client';

import { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PageSelectButton from '@/components/PageSelectButton';

type SelectPageBarProps = {
  totalPages: number;
  className?: string;
};

// 管理画面の一覧で使うページ送り。ページを選ぶと URL の ?page= を変え、サーバー側で作り直した一覧を受け取る
// 公開ページの一覧は、全記事を持ったままブラウザ側でページを切り替えるので、PageBar を直接使う（PublicPostList）
export default function SelectPageBar({ totalPages, className }: SelectPageBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Math.max(1, Number(searchParams.get('page') ?? '1'));
  // ページ送りも URL の ?page= だけが変わる移動なので loading.tsx の骨組みが出ない。
  // startTransition で包んで読み込み中（isPending）を受け取り、data-list-pending でカード一覧を薄くする（globals.css）
  const [isPending, startTransition] = useTransition();

  const setPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <PageBar
      totalPages={totalPages}
      currentPage={currentPage}
      onChange={setPage}
      isPending={isPending}
      className={className}
    />
  );
}

type PageBarProps = SelectPageBarProps & {
  currentPage: number;
  onChange: (page: number) => void;
  // サーバーから次のページを待っている間 true にすると、data-list-pending でカード一覧を薄くする
  isPending?: boolean;
};

// ページ送りの見た目と操作。URL の読み書きはしない（呼び出し側が currentPage と onChange で行う）
// URL を読む部品（useSearchParams）を含まないので、作り置きのページでもサーバー側で HTML にできる
export function PageBar({ totalPages, currentPage, onChange, isPending = false, className }: PageBarProps) {
  const setPage = onChange;

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
    // ボタンを 28px の円にしたので、間隔も 2px → 4px に広げて詰まって見えないようにする
    <div className={className ?? 'flex items-center gap-1'} data-list-pending={isPending}>
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
