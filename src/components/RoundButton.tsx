type RoundButtonState = 'Enabled' | 'Disabled' | 'mouseOver' | 'clicking';

import Link from 'next/link';

type RoundButtonProps = {
  children: React.ReactNode;
  // 見た目の状態（色）。'Disabled' は「強調しない白い見た目」という意味で、押せなくするわけではない
  state?: RoundButtonState;
  // 本当に押せなくする（作成中・入力が空のときなど）。見た目も薄くなる
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
};

export default function RoundButton({
  children,
  state = 'Disabled',
  disabled,
  onClick,
  href,
  className,
}: RoundButtonProps) {
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

  const computedClass =
    className ??
    `flex items-center justify-center px-1.5 py-1.5 rounded-full text-sm leading-5 whitespace-nowrap cursor-pointer transition-colors ${bgClass} ${textClass} hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] active:bg-[var(--clickingorange)] active:text-[var(--ogangetext)] disabled:opacity-40 disabled:pointer-events-none`;

  if (href) {
    return (
      // ナビのリンクで 'Enabled'（今いる場所）のときは aria-current="page" を付け、色だけでなく読み上げソフトにも伝える
      <Link href={href} onClick={onClick} className={computedClass} aria-current={isEnabled ? 'page' : undefined}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={computedClass}>
      {children}
    </button>
  );
}
