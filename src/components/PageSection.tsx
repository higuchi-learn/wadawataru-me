import type { ReactNode } from 'react';

// 公開ページ共通のレイアウト部品。トップページの雰囲気を各ページで揃えるために切り出している

// 横方向の余白はすべてのセクションで共通なので定数にしておく
export const PX = 'px-6 sm:px-10 lg:px-16 xl:px-20 2xl:px-28';

// 各ページ冒頭の見出し帯。トップのヒーローと同じクリーム色＋ぼかし円で、ページを移っても雰囲気が途切れないようにする
export function PageHero({
  en,
  ja,
  lead,
  children,
}: {
  en: string;
  ja: string;
  // 見出しの下に添える一言（任意）
  lead?: string;
  // 凡例やボタンなど、見出しの下に置きたいもの（任意）
  children?: ReactNode;
}) {
  return (
    // relative + overflow-hidden で、背景のぼかし円がはみ出してもスクロールが出ないようにする
    <div className={`relative overflow-hidden bg-[var(--cream)] ${PX} py-14 sm:py-20`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 size-96 rounded-full bg-[var(--onmouseorange)] opacity-50 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/3 size-80 rounded-full bg-[var(--tag)] opacity-15 blur-3xl"
      />
      <div className="relative">
        <p className="text-sm font-bold text-[var(--ogangetext)] tracking-wider">{en}</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black tracking-tight mt-2">{ja}</h1>
        {lead && <p className="text-sm sm:text-base text-[var(--lighttext)] mt-4 max-w-2xl leading-7">{lead}</p>}
        {children}
      </div>
    </div>
  );
}

export function Section({
  id,
  en,
  ja,
  bg = 'white',
  children,
}: {
  id?: string;
  en: string;
  ja: string;
  bg?: 'white' | 'cream';
  children: ReactNode;
}) {
  return (
    // 濃い区切り線をやめ、白とクリーム色の背景の切り替えだけでセクションを区切る
    <section
      id={id}
      className={`${bg === 'cream' ? 'bg-[var(--cream)]' : 'bg-white'} ${PX} py-16 sm:py-20 lg:py-24 scroll-mt-4`}
    >
      {/* 小さな英字ラベル＋大きな日本語見出し。英字だけより、何のセクションかがすぐ伝わる */}
      <div className="mb-8 sm:mb-12">
        <p className="text-sm font-bold text-[var(--ogangetext)] tracking-wider">{en}</p>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mt-1">{ja}</h2>
      </div>
      {children}
    </section>
  );
}

// カードの影。ほぼ見えない輪郭の影に、下側へ広がるオレンジがかった柔らかい影を重ねて、白いカードを暖かく浮かせる
export const CARD_SHADOW = 'shadow-[0_1px_2px_rgba(0,0,0,0.04),0_14px_32px_-18px_rgba(255,105,0,0.45)]';

// カード下端の帯（「くわしく」やリンクを置く場所）。mt-auto で常にカードの一番下に揃う
export const CARD_FOOTER =
  'mt-auto pt-4 border-t border-[var(--softborder)] flex flex-wrap items-center justify-between gap-3';

// カードの右上に薄く大きく置く通し番号（透かし）。padStart で 1 → "01" のように2桁に揃える
export function Watermark({ index }: { index: number }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none select-none absolute top-3 right-5 text-7xl font-bold leading-none tracking-tighter text-[var(--enableorange)]"
    >
      {String(index + 1).padStart(2, '0')}
    </span>
  );
}

// カード全体がリンクになっているときに、カード下端に置く「〇〇 →」の表示。
// それ自体はリンクではなく、親の Link に付けた group のホバーを受けて背景と矢印が動く
export function ReadMore({ label }: { label: string }) {
  return (
    <span className="-ml-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-[var(--ogangetext)] transition-colors duration-200 group-hover:bg-[var(--enableorange)]">
      {label}
      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">›</span>
    </span>
  );
}
