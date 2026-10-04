import { GENRE_INFO, GENRE_LABEL_EN, type Genre } from '@/components/GenreAbout';
import { PageHero } from '@/components/PageSection';
import {
  CARD_CLASS,
  CARD_BODY_CLASS,
  CARD_TEXT_CLASS,
  CARD_DESCRIPTION_CLASS,
  CARD_FOOTER_CLASS,
  CARD_SIDE_CLASS,
  CARD_THUMBNAIL_CLASS,
} from '@/components/Card';
import { CARD_LIST_CLASS, CARD_WIDTH_CLASS } from '@/components/CardList';

// 一覧ページ（PostListPage）のデータを読み込んでいる間に表示する骨組み
// 各ジャンルの loading.tsx から使う
//
// なぜ必要か:
//   ヘッダーの「制作物」などは next/link なので、押すと今の画面を表示したまま裏で次のページのデータを取りに行く
//   一覧ページは毎回 DB を引いて描画するため、DB やサーバーが休止明けだと 2 秒以上かかることがある
//   loading.tsx が無いと、データが届くまで画面が一切変わらず「ボタンを押しても固まった」ように見える
//   loading.tsx があると、Next.js はそれを Suspense の fallback として即座に表示し、データが届いたら差し替える
//   さらに <Link> の先読み（prefetch）でこの骨組みが事前に取得されるので、押した瞬間に切り替わる
//
// 見出し帯（PageHero）は DB を使わず決まる内容なので本物をそのまま出し、DB 次第の部分だけを灰色の箱にする
// こうすると読み込みが終わったときに見出しが動かず、カード部分だけが差し替わるので画面のガタつきが少ない
export default function PostListSkeleton({ genre }: { genre: Genre }) {
  return (
    <>
      <PageHero en={GENRE_LABEL_EN[genre]} ja={GENRE_INFO[genre].title} lead={GENRE_INFO[genre].description} />
      {/* aria-busy で「この領域は読み込み中」と支援技術に伝え、role="status" の文言を読み上げさせる
          items-center は付けない。付けると中の main が中身の幅まで縮み、mobile でカードが本物より狭くなる
          （本物のページでは main が幅いっぱいに広がり、カードはその幅を基準に w-full で広がる） */}
      <div aria-busy="true" className="flex flex-col w-full">
        <p role="status" className="sr-only">
          読み込み中です。
        </p>
        {/* 検索バー（本物の SearchBar は w-[365px] max-w-full h-9 のピル型） */}
        <div className="flex flex-col items-center pt-8 pb-2 px-4 w-full shrink-0">
          <SkeletonBox className="w-[365px] max-w-full h-9 rounded-full" />
        </div>
        {/* ここから下は PostListPage の main と同じ構造・クラス */}
        <main className="flex-1 flex flex-col items-center gap-2.5 pb-16">
          <div className="flex flex-col gap-1.5 items-center py-1 w-full">
            <PageBarSkeleton />
            <div className={CARD_LIST_CLASS}>
              {Array.from({ length: 4 }, (_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
            <PageBarSkeleton />
          </div>
        </main>
      </div>
    </>
  );
}

// ページ送り（SelectPageBar）。本物は 28px の円形ボタン（先頭・前・ページ番号・次・末尾）が 4px 間隔で並ぶ
// ページ数は読み込むまで分からないので、1 ページのとき（ボタン 5 個 = 28px * 5 + 4px * 4 = 156px）の幅にしている
function PageBarSkeleton() {
  return <SkeletonBox className="w-[156px] h-7 rounded-full" />;
}

// 本物の Card と同じ構造・同じクラス（Card.tsx の定数）で組み、中身だけを灰色の箱にしたもの
// 文字の行は「本物の行の高さの枠」の中に、それより少し低い箱を置く。こうすると枠の高さが本物と一致する
function CardSkeleton() {
  return (
    <div className={`${CARD_CLASS} ${CARD_WIDTH_CLASS}`}>
      {/* mobile: 上部サムネイル */}
      <SkeletonBox className={CARD_THUMBNAIL_CLASS.top} />

      {/* sm-xl: 上部タイトル（本物は text-lg leading-7 = 高さ 28px） */}
      <div className="hidden sm:flex 2xl:hidden h-7 items-center">
        <SkeletonBox className="h-5 w-2/3 rounded" />
      </div>

      <div className={CARD_BODY_CLASS}>
        <div className={CARD_TEXT_CLASS}>
          {/* mobile: タイトル（text-sm leading-5 = 20px） */}
          <div className="sm:hidden h-5 flex items-center">
            <SkeletonBox className="h-3.5 w-2/3 rounded" />
          </div>
          {/* 2xl: タイトル（text-lg leading-7 = 28px） */}
          <div className="hidden 2xl:flex h-7 items-center">
            <SkeletonBox className="h-5 w-2/3 rounded" />
          </div>

          {/* 説明文。sm 以上は本物と同じ固定の高さ（CARD_DESCRIPTION_CLASS）
              mobile は本物が文の長さで決まるため、よくある 2 行（leading-4 * 2 = 32px）の高さにしている */}
          <div className={`${CARD_DESCRIPTION_CLASS} h-8 flex flex-col gap-1.5 pt-0.5 sm:gap-2 sm:pt-1`}>
            <SkeletonBox className="h-3 sm:h-3.5 w-full rounded" />
            <SkeletonBox className="h-3 sm:h-3.5 w-4/5 rounded" />
          </div>

          {/* タグ（TagsList は h-[26px]、ピル型の TagLabel 1 個は高さ 22px） */}
          <div className="h-[26px] flex items-center">
            <SkeletonBox className="h-[22px] w-24 rounded-full" />
          </div>

          {/* 公開日・最終更新日（text-xs leading-4 = 16px）。sm 以上は本物と同じ区切り線つきの行（CARD_FOOTER_CLASS） */}
          <div className={CARD_FOOTER_CLASS}>
            <div className="h-4 flex items-center flex-1">
              <SkeletonBox className="h-3 w-56 max-w-full rounded" />
            </div>
            {/* 2xl: 「記事を読む ›」（ReadMore は高さ 24px のピル） */}
            <SkeletonBox className="hidden 2xl:block h-6 w-20 rounded-full" />
          </div>
        </div>

        {/* sm-xl: 右列（サムネイル + 「記事を読む ›」） */}
        <div className={CARD_SIDE_CLASS}>
          <SkeletonBox className={CARD_THUMBNAIL_CLASS.side} />
          <SkeletonBox className="mt-auto self-end h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* 2xl: 右サムネイル */}
      <SkeletonBox className={CARD_THUMBNAIL_CLASS.end} />
    </div>
  );
}

// 読み込み中を表す灰色の箱
// motion-safe: を付けて、OS で「視差効果を減らす」を設定している人には点滅アニメーションを出さない
function SkeletonBox({ className }: { className: string }) {
  return <div aria-hidden="true" className={`bg-neutral-200 motion-safe:animate-pulse ${className}`} />;
}
