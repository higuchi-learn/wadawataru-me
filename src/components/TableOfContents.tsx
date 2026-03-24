import type { Heading } from '@/lib/parseHeadings';

type Props = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: Props) {
  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="border border-[var(--border)] rounded-md p-3">
      <p className="text-sm font-bold text-black mb-2">あらすじ</p>
      <ul className="space-y-1">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - minLevel) * 0.75}rem` }}>
            <a
              href={`#${h.id}`}
              className="text-xs leading-5 text-[var(--lighttext)] hover:text-[var(--ogangetext)] transition-colors"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
