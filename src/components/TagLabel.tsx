type TagLabelProps = {
  label: string;
  // imageUrl が渡された場合（null 含む）は左端に画像スペースを表示する
  // undefined のとき（旧来の呼び出し）は画像スペース自体を表示しない
  imageUrl?: string | null;
  isSelected?: boolean;
  // 渡された場合のみ右端に × ボタンを表示する
  onRemove?: () => void;
};

export default function TagLabel({ label, imageUrl, isSelected, onRemove }: TagLabelProps) {
  return (
    <div
      className={`flex items-center gap-1 px-1 py-px rounded-md bg-[var(--tag)] ${isSelected ? 'ring-1 ring-[var(--ogangetext)]' : ''}`}
    >
      {/* imageUrl が明示的に渡されたときだけ画像スペースを表示する */}
      {imageUrl !== undefined && (
        <div className="w-4 h-4 rounded-sm overflow-hidden shrink-0 bg-neutral-300">
          {imageUrl && <img src={imageUrl} alt="" className="w-full h-full object-cover" />}
        </div>
      )}
      <span className="text-xs leading-4 font-normal text-black whitespace-nowrap">{label}</span>
      {/* onRemove が渡されたときだけ × ボタンを表示する */}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            // 親要素のクリックイベント（タグ選択など）に伝播しないようにする
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 leading-none text-[var(--lighttext)] hover:text-black transition-colors"
          aria-label={`${label}を削除`}
        >
          ×
        </button>
      )}
    </div>
  );
}
