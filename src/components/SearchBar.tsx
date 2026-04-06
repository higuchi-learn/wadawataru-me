'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TagLabel from '@/components/TagLabel';

type SearchBarProps = {
  availableTags?: string[];
  className?: string;
};

export default function SearchBar({ availableTags = [], className }: SearchBarProps) {
  const router = useRouter();
  // useSearchParams() で現在の URL の ? 以降（例: ?tags=React&page=2）を読み取る
  // SSRのときは URL が確定していないため値が取れない
  // そのため PostListPage.tsx で <Suspense> で囲んでいる（囲まないとビルドエラーになる）
  const searchParams = useSearchParams();

  // ページロード時に URL の ?tags= から初期選択タグを復元する
  // これにより URL を直接開いたときも選択状態が維持される
  const initialTags = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

  const toggleTag = (tag: string) => {
    // タグが選択済みなら除去、未選択なら追加する
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSearch = () => {
    // URLSearchParams は URL の ? 以降を操作するためのオブジェクト
    // searchParams.toString() で現在の URL の ? 以降を文字列として取り出し、それをベースに新しく作る
    // こうすると status など他のパラメータはそのままで、tags だけ書き換えられる
    // 例: 現在が ?status=draft&page=2 なら、tags を追加しても ?status=draft&page=1&tags=React になる
    const params = new URLSearchParams(searchParams.toString());
    if (selectedTags.length > 0) {
      params.set('tags', selectedTags.join(','));
    } else {
      // タグが0件のときはパラメータ自体を消す（?tags= という空パラメータを残さない）
      params.delete('tags');
    }
    // タグを変えたらページを1に戻す（2ページ目で絞り込むと0件になる可能性があるため）
    params.set('page', '1');
    // router.push() でブラウザの URL を更新する
    // ?${params.toString()} は「? + クエリ文字列」なので例えば ?tags=React&page=1 という URL になる
    // URL が変わると Next.js がサーバーに新しいリクエストを送り、一覧が再取得される
    router.push(`?${params.toString()}`);
  };

  return (
    <div
      className={`bg-[var(--inputcontainer)] h-8 flex items-center justify-between px-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] ${className ?? ''}`}
    >
      <div className="flex items-center gap-0.5 overflow-hidden flex-1 pr-1">
        {availableTags.map((tag) => (
          <button key={tag} type="button" onClick={() => toggleTag(tag)} className="shrink-0">
            <TagLabel label={tag} isSelected={selectedTags.includes(tag)} />
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleSearch}
        className="bg-white rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] p-0.5 flex items-center justify-center shrink-0 cursor-pointer"
        aria-label="検索"
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
  );
}
