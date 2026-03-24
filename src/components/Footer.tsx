type FooterProps = {
  className?: string;
};

export default function Footer({ className }: FooterProps) {
  return (
    <footer className={className ?? 'bg-white flex flex-col items-center justify-center w-full pt-5 px-10'}>
      <div className="border-t border-[var(--border)] w-full h-[31px] relative shrink-0">
        <p className="absolute top-[7px] left-1/2 -translate-x-1/2 text-xs font-semibold leading-4 text-black whitespace-nowrap">
          Wada Wataru © 2026 Copyright.
        </p>
      </div>
    </footer>
  );
}
