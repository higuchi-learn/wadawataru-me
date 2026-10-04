'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import TagLabel from '@/components/TagLabel';
import TagSelectOverlay, { type TagItem } from '@/components/TagSelectOverlay';

// バーに並べる選択中タグの最大数。これを超えた分は「+N」とまとめて表示する
// （バーの幅は 365px なので、タグ名の長さによっては 3 つ目以降が見えないまま隠れてしまうため）
const MAX_VISIBLE_TAGS = 2;

type SearchBarProps = {
  availableTags?: TagItem[];
  className?: string;
};

// 管理画面の一覧で使う検索バー。タグを選ぶと URL の ?tags= を変え、サーバー側で絞り込み直した一覧を受け取る
// 公開ページの一覧は、全記事を持ったままブラウザ側で絞り込むので、こちらではなく SearchBarView を直接使う（PublicPostList）
export default function SearchBar({ availableTags = [], className }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 絞り込みの読み込み中かどうか
  // router.push を startTransition で包むと、サーバーから新しい一覧が届くまでの間 isPending が true になる
  // 絞り込み（URL の ?tags= だけが変わる移動）では loading.tsx の骨組みが出ないため、これを使って
  // 「読み込み中」を自分で表示しないと、決定を押した後に画面が固まって見える
  const [isPending, startTransition] = useTransition();

  // URL の ?tags= から初期選択タグ名を復元する
  const initialNames = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];
  const [selectedNames, setSelectedNames] = useState<string[]>(initialNames);

  const applySelection = (names: string[]) => {
    setSelectedNames(names);
    // URL を更新することで Next.js がサーバー側でタグ絞り込みを再実行する
    const params = new URLSearchParams(searchParams.toString());
    if (names.length > 0) {
      params.set('tags', names.join(','));
    } else {
      params.delete('tags');
    }
    params.set('page', '1');
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  return (
    <SearchBarView
      availableTags={availableTags}
      className={className}
      selectedNames={selectedNames}
      onChange={applySelection}
      isPending={isPending}
    />
  );
}

type SearchBarViewProps = SearchBarProps & {
  // 選択中のタグ名
  selectedNames: string[];
  // タグの選択を変えたとき（選択画面で決定したとき・選択中タグの「×」を押したとき）に呼ばれる
  onChange: (names: string[]) => void;
  // サーバーから絞り込み結果を待っている間 true にすると、虫眼鏡を回転する輪に変え、カード一覧を薄くする
  isPending?: boolean;
};

// 検索バーの見た目と操作。URL の読み書きはしない（呼び出し側が selectedNames と onChange で行う）
// URL を読む部品（useSearchParams）を含まないので、作り置きのページでもサーバー側で HTML にできる
export function SearchBarView({
  availableTags = [],
  className,
  selectedNames,
  onChange,
  isPending = false,
}: SearchBarViewProps) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  const applySelection = (names: string[]) => {
    setIsOverlayOpen(false);
    onChange(names);
  };

  const removeTag = (name: string) => applySelection(selectedNames.filter((n) => n !== name));

  // 選択中タグの name → TagItem を引く（画像表示のため）
  const selectedItems = selectedNames
    .map((name) => availableTags.find((t) => t.name === name))
    .filter((t): t is TagItem => t !== undefined);
  const visibleItems = selectedItems.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = selectedItems.length - visibleItems.length;
  const label =
    selectedItems.length > 0
      ? `タグで絞り込む（選択中: ${selectedItems.map((t) => t.name).join('、')}）`
      : 'タグで絞り込む';

  return (
    <>
      {/* バーのどこを押してもタグの選択画面を開く（以前は右端の虫眼鏡だけが反応し、文字の部分を押しても何も起きなかった）
          ただし外側の div 自体はボタンにしない。中に選択中タグの「×」ボタンがあり、ボタンの中にボタンを入れると
          読み上げソフトが中の「×」にたどり着けないことがあるため。マウス・タッチ用に onClick だけを付け、
          キーボード・読み上げソフトには右端の虫眼鏡を本物のボタンとして使ってもらう
          「×」は TagLabel 側で stopPropagation しているので、押してもタグを外すだけで選択画面は開かない
          data-list-pending: 読み込み中に globals.css の :has() でカード一覧を薄くするための目印 */}
      <div
        onClick={() => setIsOverlayOpen(true)}
        data-list-pending={isPending}
        // focus-within: 中の虫眼鏡ボタンにキーボードでフォーカスしたとき、バー全体を囲む枠で分かるようにする
        className={`group bg-white h-9 flex items-center justify-between pl-2 pr-1 rounded-full border border-[var(--softborder)] shadow-sm cursor-pointer transition-colors hover:border-[var(--onmouseorange)] focus-within:ring-2 focus-within:ring-[var(--ogangetext)] ${className ?? ''}`}
      >
        {/* 選択中タグ一覧（または未選択時のプレースホルダ） */}
        <div className="flex items-center gap-1 overflow-hidden flex-1 pr-1">
          {selectedItems.length > 0 ? (
            <>
              {visibleItems.map((tag) => (
                <TagLabel key={tag.id} label={tag.name} imageUrl={tag.imageUrl} onRemove={() => removeTag(tag.name)} />
              ))}
              {/* 並べきれない分は件数でまとめて示す（隠れたタグがあることに気づけるように） */}
              {hiddenCount > 0 && (
                <span className="shrink-0 text-xs font-bold text-[var(--ogangetext)] whitespace-nowrap">
                  +{hiddenCount}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-[var(--lighttext)] pl-1">タグで絞り込む</span>
          )}
        </div>

        {/* 虫眼鏡ボタン。キーボード（Tab で移動して Enter・Space）と読み上げソフトからはここで選択画面を開く
            マウスで押したときは、外側の div の onClick と同じく選択画面を開く（二重に開いても同じ state なので問題ない）
            読み込み中は虫眼鏡の代わりに回転する輪を表示する */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={label}
          onClick={() => setIsOverlayOpen(true)}
          className="size-7 rounded-full bg-[var(--enableorange)] text-[var(--ogangetext)] group-hover:bg-[var(--onmouseorange)] transition-colors flex items-center justify-center shrink-0 cursor-pointer focus:outline-none"
        >
          {isPending ? (
            // motion-safe: OS で「視差効果を減らす」を設定している人には回転させない（輪は表示したまま）
            <span className="size-4 rounded-full border-2 border-current border-t-transparent motion-safe:animate-spin" />
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="size-4 fill-none stroke-current"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16.5 16.5 5 5" />
            </svg>
          )}
        </button>
      </div>
      {/* 読み込み中であることを読み上げソフトにも伝える（画面には表示しない） */}
      <p role="status" className="sr-only">
        {isPending ? '絞り込み中です。' : ''}
      </p>

      {isOverlayOpen && (
        <TagSelectOverlay
          tags={availableTags}
          selectedNames={selectedNames}
          onConfirm={applySelection}
          onClose={() => setIsOverlayOpen(false)}
          title="タグで絞り込む"
        />
      )}
    </>
  );
}
