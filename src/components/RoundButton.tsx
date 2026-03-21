type RoundButtonState = "Enabled" | "Disabled" | "mouseOver" | "clicking";

import Link from "next/link";

type RoundButtonProps = {
  children: React.ReactNode;
  state?: RoundButtonState;
  onClick?: () => void;
  href?: string;
  className?: string;
};

export default function RoundButton({
  children,
  state = "Disabled",
  onClick,
  href,
  className,
}: RoundButtonProps) {
  const isEnabled = state === "Enabled";
  const isMouseOver = state === "mouseOver";
  const isClicking = state === "clicking";

  const bgClass = isEnabled
    ? "bg-[var(--enableorange)]"
    : isMouseOver
      ? "bg-[var(--onmouseorange)]"
      : isClicking
        ? "bg-[var(--clickingorange)]"
        : "bg-white";

  const textClass =
    isEnabled || isClicking
      ? "text-[var(--ogangetext)]"
      : "text-[var(--lighttext)]";

  const computedClass =
    className ??
    `flex items-center justify-center px-1.5 py-1.5 rounded-full text-sm leading-5 whitespace-nowrap cursor-pointer transition-colors ${bgClass} ${textClass} hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] active:bg-[var(--clickingorange)] active:text-[var(--ogangetext)]`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={computedClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={computedClass}>
      {children}
    </button>
  );
}
