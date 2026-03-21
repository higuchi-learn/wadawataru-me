"use client";

import { useState } from "react";
import PageSelectButton from "@/components/PageSelectButton";

type SelectPageBarProps = {
  totalPages: number;
  className?: string;
};

export default function SelectPageBar({ totalPages, className }: SelectPageBarProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  // 表示するページ番号を計算 (最大5件)
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
    <div className={className ?? "flex items-center gap-0.5"}>
      <PageSelectButton
        category="First"
        isDisabled={isFirst}
        onClick={() => setCurrentPage(1)}
      />
      <PageSelectButton
        category="Before"
        isDisabled={isFirst}
        onClick={() => setCurrentPage((p) => p - 1)}
      />
      {getPageNumbers().map((page) => (
        <PageSelectButton
          key={page}
          category="Number"
          page={page}
          isActive={page === currentPage}
          onClick={() => setCurrentPage(page)}
        />
      ))}
      <PageSelectButton
        category="Next"
        isDisabled={isLast}
        onClick={() => setCurrentPage((p) => p + 1)}
      />
      <PageSelectButton
        category="Last"
        isDisabled={isLast}
        onClick={() => setCurrentPage(totalPages)}
      />
    </div>
  );
}
