'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TagLabel from '@/components/TagLabel';
import TagSelectOverlay, { type TagItem } from '@/components/TagSelectOverlay';

type SearchBarProps = {
  availableTags?: TagItem[];
  className?: string;
};

export default function SearchBar({ availableTags = [], className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // URL の ?tags= から初期選択タグ名を復元する
  const initialNames = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const [selectedNames, setSelectedNames] = useState<string[]>(initialNames);

  const applySelection = (names: string[]) => {
    setSelectedNames(names);
    setIsOverlayOpen(false);
    // URL を更新することで Next.js がサーバー側でタグ絞り込みを再実行する
    const params = new URLSearchParams(searchParams.toString());
    if (names.length > 0) {
      params.set('tags', names.join(','));
    } else {
      params.delete('tags');
    }
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const removeTag = (name: string) => applySelection(selectedNames.filter((n) => n !== name));

  // 選択中タグの name → TagItem を引く（画像表示のため）
  const selectedItems = selectedNames
    .map((name) => availableTags.find((t) => t.name === name))
    .filter((t): t is TagItem => t !== undefined);

  return (
    <>
      <div
        className={`bg-[var(--inputcontainer)] h-8 flex items-center justify-between px-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] ${className ?? ''}`}
      >
        {/* 選択中タグ一覧（または未選択時のプレースホルダ） */}
        <div className="flex items-center gap-0.5 overflow-hidden flex-1 pr-1">
          {selectedItems.length > 0 ? (
            selectedItems.map((tag) => (
              <TagLabel
                key={tag.id}
                label={tag.name}
                imageUrl={tag.imageUrl}
                onRemove={() => removeTag(tag.name)}
              />
            ))
          ) : (
            <span className="text-xs text-[var(--lighttext)] pl-1">タグで絞り込む</span>
          )}
        </div>

        {/* 虫眼鏡ボタン → オーバーレイを開く */}
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          className="bg-white rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] p-0.5 flex items-center justify-center shrink-0 cursor-pointer"
          aria-label="タグを選択"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-5 fill-none stroke-current text-[var(--lighttext)]"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 5 5" />
          </svg>
        </button>
      </div>

      {isOverlayOpen && (
        <TagSelectOverlay
          tags={availableTags}
          selectedNames={selectedNames}
          onConfirm={applySelection}
          onClose={() => setIsOverlayOpen(false)}
        />
      )}
    </>
  );
}
