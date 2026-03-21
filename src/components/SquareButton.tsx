type SquareButtonState = "Enabled" | "Disabled" | "mouseOver" | "clicking";

type SquareButtonProps = {
  children: React.ReactNode;
  state?: SquareButtonState;
  onClick?: () => void;
  className?: string;
};

export default function SquareButton({
  children,
  state = "Disabled",
  onClick,
  className,
}: SquareButtonProps) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={
        className ??
        `flex items-center justify-center px-1 rounded-md text-sm leading-5 whitespace-nowrap cursor-pointer transition-colors ${bgClass} ${textClass} hover:bg-[var(--onmouseorange)] hover:text-[var(--ogangetext)] active:bg-[var(--clickingorange)] active:text-[var(--ogangetext)]`
      }
    >
      {children}
    </button>
  );
}
