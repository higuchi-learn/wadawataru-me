export type PageButtonCategory = 'Number' | 'First' | 'Before' | 'Next' | 'Last';

type PageSelectButtonProps = {
  category?: PageButtonCategory;
  page?: number;
  isActive?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  className?: string;
};

const ChevronFirstIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
    <path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z" />
  </svg>
);
const ChevronBeforeIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
  </svg>
);
const ChevronNextIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
  </svg>
);
const ChevronLastIcon = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0 fill-current">
    <path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z" />
  </svg>
);

export default function PageSelectButton({
  category = 'Number',
  page = 1,
  isActive = false,
  isDisabled = false,
  onClick,
  className,
}: PageSelectButtonProps) {
  // トップページのボタンにそろえたピル型（円形）。今のページは塗りつぶしのオレンジで目立たせ、
  // 押せないボタン（先頭ページでの「前へ」など）は灰色で塗らずに薄く表示する
  const bgClass = isActive ? 'bg-[var(--ogangetext)]' : 'bg-white';

  const textClass = isActive ? 'text-white' : 'text-[var(--lighttext)]';

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={
        className ??
        `size-7 shrink-0 flex items-center justify-center overflow-hidden rounded-full p-1 transition-colors ${bgClass} ${textClass} ${
          isActive ? '' : 'border border-[var(--softborder)]'
        } ${
          isDisabled
            ? 'cursor-default opacity-40'
            : isActive
              ? 'cursor-default'
              : 'cursor-pointer hover:bg-[var(--enableorange)] hover:text-[var(--ogangetext)] active:bg-[var(--onmouseorange)]'
        }`
      }
    >
      {category === 'Number' && <span className="text-sm leading-5 font-normal">{page}</span>}
      {category === 'First' && <ChevronFirstIcon />}
      {category === 'Before' && <ChevronBeforeIcon />}
      {category === 'Next' && <ChevronNextIcon />}
      {category === 'Last' && <ChevronLastIcon />}
    </button>
  );
}
