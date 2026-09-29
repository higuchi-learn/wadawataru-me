'use client';

type Props = {
  className?: string;
};

export default function PrintButton({ className }: Props) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      印刷する
    </button>
  );
}
