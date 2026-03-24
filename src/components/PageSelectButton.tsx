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
  const bgClass = isDisabled ? 'bg-[var(--unclickable)]' : isActive ? 'bg-[var(--enableorange)]' : 'bg-white';

  const textClass = isActive ? 'text-[var(--ogangetext)]' : 'text-[var(--lighttext)]';

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={
        className ??
        `size-5 shrink-0 flex items-center justify-center overflow-hidden border-[0.2px] border-[var(--border)] rounded-md p-1.5 transition-colors ${bgClass} ${textClass} ${
          isDisabled
            ? 'cursor-default'
            : 'cursor-pointer hover:bg-[var(--onmouseorange)] active:bg-[var(--clickingorange)] active:text-[var(--ogangetext)]'
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
