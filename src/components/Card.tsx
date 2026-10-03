import Link from 'next/link';
import CardTitle from '@/components/CardTitle';
import TagsList, { type TagListItem } from '@/components/TagsList';
import { ReadMore } from '@/components/PageSection';

type CardProps = {
  title: string;
  description: string;
  tags: TagListItem[];
  publishedAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  href?: string;
  className?: string;
};

/**
 * レスポンシブカード（sm 以上はトップページのカードと同じ見た目: 枠線なし・角丸・オレンジがかった柔らかい影）
 *
 * mobile (< sm):
 *   カードスタイルなし (shadow / rounded / padding なし)。カードの下に 40px の余白を置いて区切る
 *   [サムネイル(全幅, aspect-video, 角なし)]
 *   [テキスト px-1]
 *     タイトル(text-sm/bold) / 説明(text-xs) / タグ / 日付
 *
 * sm〜xl:
 *   カード: p-4 rounded-3xl + 薄い枠線 + オレンジがかった薄い影
 *   [タイトル(text-lg/bold, 上部全幅, truncate)]
 *   [テキスト列(shrink-0, w-341px@500px / w-442px@600px): 説明 + タグ + 日付 | 右列: サムネイル + 「記事を読む ›」]
 *
 * 2xl:
 *   カード: flex-row gap-2 items-center p-4 rounded-3xl + 薄い枠線 + オレンジがかった薄い影
 *   [テキスト列(w-486px): タイトル + 説明 + タグ + 日付・「記事を読む ›」]
 *   [サムネイル(flex-1, aspect-video, rounded-lg)]
 */
// カードの外枠・各部分のクラス
// 読み込み中の骨組み（PostListSkeleton）も同じクラスを使うことで、骨組みと本物のカードの大きさを常に一致させる
// （骨組み側で値を書き写すと、カードの見た目を変えたときに骨組みだけ古い寸法のまま残ってしまう）
// pb-10（40px）: mobile ではカードに枠線も影も無く、縦に並んだカードがすき間なくつながって区切りが分かりにくいため、
// カードの下に余白を入れて次のカードのサムネイルと離す。sm 以上は sm:p-4 が上下左右の余白を 16px に上書きする
// group: カードのどこにホバーしても、タイトルの色と「記事を読む ›」を変化させるため（group-hover で受ける）
// 影: 元のデザイン（薄い枠線 + shadow-sm = 0 1px 2px 黒 5%）と同じ形・同じくらい控えめな強さのまま、色だけをオレンジにする
// トップページのカードの大きく広がる影（CARD_SHADOW）は、一覧で何枚も並ぶと主張が強すぎるため使わない
export const CARD_CLASS = `group bg-white flex flex-col pb-10
  sm:p-4 sm:rounded-3xl sm:overflow-hidden
  sm:border sm:border-[var(--softborder)] sm:shadow-[0_1px_2px_0_rgba(255,105,0,0.1)]
  2xl:flex-row 2xl:gap-2 2xl:items-center`;
// sm-xl: テキスト + サムネイルの行 / 2xl: テキスト列
export const CARD_BODY_CLASS =
  'flex flex-col px-1 sm:flex-row sm:items-start sm:px-0 2xl:flex-col 2xl:items-start 2xl:flex-none 2xl:w-[486px] 2xl:overflow-hidden';
// テキストエリア（タイトル・説明・タグ・日付）
export const CARD_TEXT_CLASS = 'flex flex-col min-w-0 sm:flex-none sm:w-[341px] md:w-[442px] lg:w-[341px] xl:w-[442px]';
// 説明文。sm 以上は高さを固定しているので、文の長さに関係なくカードの高さがそろう（mobile は文の長さ次第）
// 色はトップページのカードの説明文と同じ薄い灰色にして、黒いタイトルとの強弱をつける
export const CARD_DESCRIPTION_CLASS =
  'text-xs sm:text-sm leading-4 sm:leading-5 text-[var(--lighttext)] sm:h-[60px] md:h-10 lg:h-[60px] xl:h-10';
// 日付の行。sm 以上はトップページのカード下端（CARD_FOOTER）と同じく、上に薄い区切り線を引く
export const CARD_FOOTER_CLASS =
  'flex items-center justify-between gap-2 sm:mt-1 sm:pt-1.5 sm:border-t sm:border-[var(--softborder)]';
// sm-xl の右列（サムネイルと、その下の「記事を読む ›」）。self-stretch でテキスト列と同じ高さまで伸ばし、
// 「記事を読む ›」を mt-auto で右列の下端にそろえる
export const CARD_SIDE_CLASS = 'hidden sm:flex 2xl:hidden flex-col gap-2 flex-1 min-w-px self-stretch';
// サムネイル。画面幅によって表示位置が変わるので 3 か所に置き、それぞれ表示する幅だけで見せる
export const CARD_THUMBNAIL_CLASS = {
  // mobile: 上部 (全幅, 角なし)
  top: 'aspect-video w-full sm:hidden',
  // sm-xl: 右列の上 (CARD_SIDE_CLASS の中)
  side: 'aspect-video w-full min-h-px rounded-lg',
  // 2xl: カードの右端
  end: 'hidden 2xl:block aspect-video flex-1 min-w-px min-h-px rounded-lg shrink-0',
};

function Thumbnail({ url, title, className }: { url?: string; title: string; className: string }) {
  // サムネイル未設定の記事は、タイトルから自動生成した画像（/api/og）を表示する
  const src = url ?? `/api/og?title=${encodeURIComponent(title)}`;
  return <img src={src} alt={title} className={`${className} object-cover`} />;
}

export default function Card({
  title,
  description,
  tags,
  publishedAt,
  updatedAt,
  thumbnailUrl,
  href = '#',
  className,
}: CardProps) {
  return (
    <Link href={href} className={`${CARD_CLASS} ${className ?? ''}`}>
      {/* mobile: 上部サムネイル (全幅, 角なし) */}
      <Thumbnail url={thumbnailUrl} title={title} className={CARD_THUMBNAIL_CLASS.top} />

      {/* sm-xl: 上部タイトル */}
      <CardTitle title={title} size="Default" className="hidden sm:flex 2xl:hidden flex-col items-start" />

      {/* sm-xl: テキスト + サムネイルの行  /  2xl: テキスト列 */}
      <div className={CARD_BODY_CLASS}>
        {/* テキストエリア */}
        <div className={CARD_TEXT_CLASS}>
          {/* mobile: タイトル */}
          <CardTitle title={title} size="Short" className="sm:hidden flex flex-col items-start" />
          {/* 2xl: タイトル (テキスト列内) */}
          <CardTitle title={title} size="Default" className="hidden 2xl:flex flex-col items-start" />

          <p className={CARD_DESCRIPTION_CLASS}>{description}</p>

          <TagsList tags={tags} className="flex gap-1 overflow-hidden" />

          <div className={CARD_FOOTER_CLASS}>
            <div className="flex gap-2 items-center text-xs leading-4 text-[var(--lighttext)] whitespace-nowrap">
              <span>公開日 : {publishedAt}</span>
              <span>最終更新日 : {updatedAt}</span>
            </div>
            {/* 2xl: テキスト列が 486px あり日付と同じ行に収まるので、行の右端に置く
                -mr-3: ReadMore はピルの内側に左右 12px の余白があるため、文字の右端をカードの内側の線にそろえる */}
            <span className="hidden 2xl:inline-flex -mr-3">
              <ReadMore label="記事を読む" />
            </span>
          </div>
        </div>

        {/* sm-xl: 右列。サムネイルと、その下の「記事を読む ›」（テキスト列 341px には日付と並べて入りきらないため） */}
        <div className={CARD_SIDE_CLASS}>
          <Thumbnail url={thumbnailUrl} title={title} className={CARD_THUMBNAIL_CLASS.side} />
          <span className="mt-auto self-end -mr-3">
            <ReadMore label="記事を読む" />
          </span>
        </div>
      </div>

      {/* 2xl: 右サムネイル (card の直接 flex 子) */}
      <Thumbnail url={thumbnailUrl} title={title} className={CARD_THUMBNAIL_CLASS.end} />
    </Link>
  );
}
