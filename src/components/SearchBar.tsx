import TagsList from "@/components/TagsList";

type SearchBarProps = {
  tags?: string[];
  onSearch?: () => void;
  className?: string;
};

export default function SearchBar({ tags = [], onSearch, className }: SearchBarProps) {
  return (
    <div
      className={`bg-[var(--inputcontainer)] h-8 flex items-center justify-between px-1 rounded-sm shadow-[0_0_4px_rgba(0,0,0,0.25)] ${className ?? ""}`}
    >
      {/* タグ一覧 */}
      <TagsList tags={tags} className="flex items-center gap-0.5 overflow-hidden flex-1 pr-1" />

      {/* 検索ボタン */}
      <button
        type="button"
        onClick={onSearch}
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
