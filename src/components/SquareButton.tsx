type SquareButtonState = 'Enabled' | 'Disabled' | 'mouseOver' | 'clicking';

type SquareButtonProps = {
  children: React.ReactNode;
  // 見た目の状態（色）。'Disabled' は「強調しない灰色の見た目」という意味で、押せなくするわけではない
  // （キャンセルボタンや、選ばれていないタブにも使っている）
  state?: SquareButtonState;
  // 本当に押せなくする（保存中・入力が空のときなど）。見た目も薄くなり、連打や空の送信を防ぐ
  disabled?: boolean;
  // タブや切り替えボタンとして使うとき、選択中かどうか。読み上げソフトに「押されている」と伝わる（aria-pressed）
  pressed?: boolean;
  onClick?: () => void;
  className?: string;
};

export default function SquareButton({
  children,
  state = 'Disabled',
  disabled,
  pressed,
  onClick,
  className,
}: SquareButtonProps) {
  const isEnabled = state === 'Enabled';
  const isMouseOver = state === 'mouseOver';
  const isClicking = state === 'clicking';

  const bgClass = isEnabled
    ? 'bg-[var(--enableorange)]'
    : isMouseOver
      ? 'bg-[var(--onmouseorange)]'
      : isClicking
        ? 'bg-[var(--clickingorange)]'
        : 'bg-white';

  const textClass = isEnabled || isClicking ? 'text-[var(--ogangetext)]' : 'text-[var(--lighttext)]';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={pressed}
      className={
        className ??
        `flex items-center justify-center px-1 rounded-md text-sm leading-5 whitespace-nowrap cursor-pointer transition-colors ${bgClass} ${textClass} hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] active:bg-[var(--clickingorange)] active:text-[var(--ogangetext)] disabled:opacity-40 disabled:pointer-events-none`
      }
    >
      {children}
    </button>
  );
}
