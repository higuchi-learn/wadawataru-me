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
    // 元のデザインの「枠線の箱」のまま、枠線の色と角丸・影を記事一覧のカードと同じ控えめなものにそろえる
    // （濃い灰色の枠線だと、ほかの暖色の部品の中で浮いて見えるため）
    <nav className="border border-[var(--softborder)] rounded-2xl p-3 shadow-[0_1px_2px_0_rgba(255,105,0,0.1)]">
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
