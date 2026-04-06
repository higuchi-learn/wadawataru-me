import type { Heading } from '@/lib/parseHeadings';

type Props = {
  headings: Heading[];
};

export default function TableOfContents({ headings }: Props) {
  // 見出しがない記事では目次コンポーネント自体を非表示にする
  if (headings.length === 0) return null;

  // 記事内で最も浅い見出しレベルを基準（インデント0）にする
  // 例: h2 始まりの記事なら h2 がインデント0、h3 がインデント1 になる
  // h1 始まりを決め打ちにしないことで、どのレベルから始まっても正しくインデントされる
  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="border border-[var(--border)] rounded-md p-3">
      <p className="text-sm font-bold text-black mb-2">あらすじ</p>
      <ul className="space-y-1">
        {headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - minLevel) * 0.75}rem` }}>
            {/*
              href="#id" でページ内リンクになる
              クリックすると該当見出しの位置にスクロールする
              見出し側に id を付けているのは ArticlePage の headingComponents（makeHeading）
            */}
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
