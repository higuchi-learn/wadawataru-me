import type { Metadata } from 'next';
import Link from 'next/link';
import ImageSlot from '@/components/ImageSlot';
import { PX, CARD_SHADOW, CARD_FOOTER, PageHero, ReadMore } from '@/components/PageSection';
import { pageMetadata } from '@/lib/siteMetadata';

// ページ上部の見出しと紹介文。ブラウザのタブや SNS のプレビューに出す題名・説明にも使う
const PAGE_TITLE = '受賞歴';
const PAGE_LEAD = 'ハッカソンや顕彰制度でいただいた賞です。カードを押すと、作ったものや学んだことをくわしく読めます。';

export const metadata: Metadata = pageMetadata(PAGE_TITLE, PAGE_LEAD);

// 同じプロダクトで複数のイベントから受賞した場合に1枚のカードにまとめられるよう、
// 賞・イベント・日付の組を配列で持つ
type Honor = {
  rank: string;
  event: string;
  date: string;
};

type Award = {
  title: string;
  // カードに見せる一言。長い説明は行き先のページ（href）にまとめる
  catchcopy: string;
  honors: Honor[];
  // 画像を用意したら public/ 以下のパスを書く（例: "/images/awards/gesture-audio.webp"）
  image?: string;
  // image が未指定の間、ImageSlot に表示する「何の画像を入れるか」。
  // 用意できない場合は省略し、画像の枠ごと出さない（受賞バッジは本文の上に移る）
  imageHint?: string;
  tech?: string[];
  // カードを押したときの行き先。制作物は記事（/products/slug）、それ以外は関連するページ
  // 詳しい説明・学び・GitHub などのリンクは行き先のページにまとめ、カードには要点だけを置く
  href: string;
};

const awards: Award[] = [
  {
    title: 'Gesture Audio',
    href: '/products/gesture-audio',
    catchcopy: '腕を振るだけで音楽を操作できる、腕に着けるコントローラー。',
    image: '/images/gesture-audio-demo.webp',
    imageHint: '腕に着けたコントローラーの写真、またはデモの様子（16:9）',
    honors: [{ rank: '最優秀賞', event: '技育CAMP2025 ハッカソン Vol.10', date: '2025年8月' }],
    tech: ['C++', 'XIAO BLE Sense', 'BLE', '6軸加速度センサー'],
  },
  {
    title: 'ジュニアマイスター顕彰',
    href: '/qualifications',
    catchcopy: '全国の工業高校生の中で、歴代最高の 270pt を取得。',
    image: '/images/meti-award.webp',
    imageHint: '表彰式や賞状の写真（16:9）',
    honors: [{ rank: '経済産業大臣賞', event: '公益社団法人全国工業高等学校長協会', date: '2024年3月' }],
  },
  {
    title: 'Bingo!2',
    href: '/products/bingo2',
    catchcopy: 'PC 1台と参加者のスマホだけで、大人数のビンゴ大会ができるアプリ。',
    image: '/images/bingo2-1.webp',
    imageHint: 'ビンゴカードやランキング画面のスクリーンショット（16:9）',
    honors: [
      { rank: 'STECH 協賛賞', event: 'システム工学研究会 SysHack（サークル主催ハッカソン）', date: '2025年3月' },
    ],
    tech: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Firebase', 'Shadcn'],
  },
  {
    title: 'ステキなステッキ',
    href: '/products/lovely-stick',
    catchcopy: '魔法の杖を振って MP を溜め、攻撃・防御する体感型の対戦ゲーム。',
    image: '/images/lovely-stick-2.webp',
    imageHint: '杖を振って遊んでいる様子、または杖の実物（16:9）',
    honors: [
      { rank: '優秀賞（2位）', event: '技育CAMP2024 ハッカソン Vol.19', date: '2024年12月' },
      { rank: '株式会社ゆめみ 企業賞', event: '技育博 2024 vol.6', date: '2025年2月' },
    ],
    tech: ['MicroPython', 'Raspberry Pi Pico W', '電子回路設計・実装'],
  },
  {
    title: 'SysPay',
    href: '/products/syspay',
    catchcopy: '大学祭の模擬店で使う、スマホから注文できるオンライン注文システム。',
    honors: [{ rank: '優秀賞', event: '愛知工業大学 工科展2024', date: '2024年10月' }],
    tech: ['TypeScript', 'React', 'Vite', 'MUI', 'Firebase'],
  },
];

// 受賞バッジ。画像があれば画像の上に重ね、なければ本文の上に置く
function HonorBadges({ award }: { award: Award }) {
  return (
    <div className="flex flex-wrap gap-2">
      {award.honors.map((honor, i) => (
        <span
          key={honor.rank}
          // 1つ目（いちばん大きな賞）はオレンジ地で目立たせ、2つ目以降は白地にして主従をつける
          className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-full pl-1.5 pr-3 py-1 shadow-md ${
            i === 0 ? 'bg-[var(--ogangetext)] text-white' : 'bg-white/95 text-[var(--ogangetext)]'
          }`}
        >
          {/* 小さなメダル。円の中に星を描いた SVG */}
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <circle cx="12" cy="12" r="11" className={i === 0 ? 'fill-white/25' : 'fill-[var(--enableorange)]'} />
            <path
              d="m12 6.5 1.7 3.5 3.8.5-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.5z"
              className="fill-current"
            />
          </svg>
          {honor.rank}
        </span>
      ))}
    </div>
  );
}

// 画像＋受賞バッジ
function AwardMedia({ award }: { award: Award }) {
  if (!award.imageHint) return null;
  return (
    <div className="relative">
      <ImageSlot src={award.image} alt={award.title} hint={award.imageHint} className="w-full aspect-video" />
      {/* 画像の上側を少しだけ暗くして、明るい写真でもバッジが埋もれないようにする */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/20 to-transparent"
      />
      <div className="absolute top-4 left-4 right-4">
        <HonorBadges award={award} />
      </div>
    </div>
  );
}

// 一言説明・受賞イベント・技術
function AwardSummary({ award }: { award: Award }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[var(--lighttext)] leading-6">{award.catchcopy}</p>

      {/* 受賞イベントを小さな縦の年表として並べる。複数受賞したプロダクトでは線でつながる */}
      <ol className="relative border-l-2 border-[var(--enableorange)] ml-1 space-y-3">
        {award.honors.map((honor) => (
          <li key={honor.event} className="relative pl-4">
            {/* 線の上に乗る丸。-left で線の中心に合わせている */}
            <span className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-white border-2 border-[var(--ogangetext)]" />
            <p className="text-xs font-bold text-[var(--ogangetext)]">{honor.date}</p>
            <p className="text-sm text-black leading-6">{honor.event}</p>
          </li>
        ))}
      </ol>

      {award.tech && (
        <div className="flex flex-wrap gap-1.5">
          {award.tech.map((t) => (
            <span
              key={t}
              className="text-xs text-black bg-[var(--cream)] border border-[var(--softborder)] rounded-full px-3 py-1"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AwardsPage() {
  return (
    <div className="flex-1 flex flex-col">
      <PageHero en="Awards" ja={PAGE_TITLE} lead={PAGE_LEAD} />

      <div className={`bg-[var(--cream)] ${PX} py-3.5 sm:py-5`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {awards.map((award) => (
            // カード全体を1つのリンクにする。どこを押しても同じ行き先に行くので迷わない
            <Link
              key={award.title}
              href={award.href}
              className={`group bg-white rounded-3xl overflow-hidden flex flex-col ${CARD_SHADOW}`}
            >
              <AwardMedia award={award} />

              <div className="p-6 sm:p-7 flex flex-col gap-4 flex-1">
                {!award.imageHint && <HonorBadges award={award} />}
                <h2 className="text-xl sm:text-2xl font-bold text-black leading-tight group-hover:text-[var(--ogangetext)] transition-colors">
                  {award.title}
                </h2>
                <AwardSummary award={award} />
                <div className={CARD_FOOTER}>
                  <ReadMore label={award.href.startsWith('/products/') ? '制作物の記事を読む' : '資格のページで見る'} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
