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
      {/* バー全体を押すとタグの選択画面を開く
          以前は右端の虫眼鏡だけがボタンで、「タグで絞り込む」の文字を押しても何も起きず、どこを押せばよいか分かりにくかった
          中に選択中タグの「×」ボタンがあり、<button> の中に <button> は入れられないため、
          外側は role="button" の div にして、キーボード（Enter・Space）でも開けるようにしている
          「×」は TagLabel 側で stopPropagation しているので、押しても選択画面は開かずタグを外すだけになる */}
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="dialog"
        aria-label={
          selectedItems.length > 0
            ? `タグで絞り込む（選択中: ${selectedItems.map((t) => t.name).join('、')}）`
            : 'タグで絞り込む'
        }
        onClick={() => setIsOverlayOpen(true)}
        onKeyDown={(e) => {
          // Space はそのままだとページがスクロールしてしまうので preventDefault する
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOverlayOpen(true);
          }
        }}
        // トップページのボタンと同じピル型。ホバー・フォーカスで枠をオレンジにして、押せる場所だと分かるようにする
        className={`group bg-white h-9 flex items-center justify-between pl-2 pr-1 rounded-full border border-[var(--softborder)] shadow-sm cursor-pointer transition-colors hover:border-[var(--onmouseorange)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ogangetext)] ${className ?? ''}`}
      >
        {/* 選択中タグ一覧（または未選択時のプレースホルダ） */}
        <div className="flex items-center gap-1 overflow-hidden flex-1 pr-1">
          {selectedItems.length > 0 ? (
            selectedItems.map((tag) => (
              <TagLabel key={tag.id} label={tag.name} imageUrl={tag.imageUrl} onRemove={() => removeTag(tag.name)} />
            ))
          ) : (
            <span className="text-xs text-[var(--lighttext)] pl-1">タグで絞り込む</span>
          )}
        </div>

        {/* 虫眼鏡は「押すと検索できる」ことを示すアイコン（押した処理はバー全体の onClick が受ける） */}
        <span
          aria-hidden="true"
          className="size-7 rounded-full bg-[var(--enableorange)] text-[var(--ogangetext)] group-hover:bg-[var(--onmouseorange)] transition-colors flex items-center justify-center shrink-0"
        >
          <svg
            viewBox="0 0 24 24"
            className="size-4 fill-none stroke-current"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 5 5" />
          </svg>
        </span>
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
