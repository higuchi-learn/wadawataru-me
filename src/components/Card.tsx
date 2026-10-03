import Link from 'next/link';
import CardTitle from '@/components/CardTitle';
import TagsList, { type TagListItem } from '@/components/TagsList';

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
 * レスポンシブカード
 *
 * mobile (< sm):
 *   カードスタイルなし (shadow / rounded / padding なし)
 *   [サムネイル(全幅, aspect-video, 角なし)]
 *   [テキスト px-1]
 *     タイトル(text-sm/semibold) / 説明(text-xs) / タグ / 日付
 *
 * sm〜xl:
 *   カード: px-3 py-2 rounded-2xl 薄い枠線 + shadow-sm
 *   [タイトル(text-lg/semibold, 上部全幅, truncate)]
 *   [テキスト列(shrink-0, w-341px@500px / w-410px@600px) | サムネイル(flex-1, aspect-video, rounded-lg)]
 *
 * 2xl:
 *   カード: flex-row gap-2 items-center px-3 py-2 rounded-2xl 薄い枠線 + shadow-sm
 *   [テキスト列(shrink-0, w-424px): タイトル + 説明 + タグ + 日付]
 *   [サムネイル(flex-1, aspect-video, rounded-lg)]
 */
// カードの外枠・各部分のクラス
// 読み込み中の骨組み（PostListSkeleton）も同じクラスを使うことで、骨組みと本物のカードの大きさを常に一致させる
// （骨組み側で値を書き写すと、カードの見た目を変えたときに骨組みだけ古い寸法のまま残ってしまう）
// pb-10（40px）: mobile ではカードに枠線も影も無く、縦に並んだカードがすき間なくつながって区切りが分かりにくいため、
// カードの下に余白を入れて次のカードのサムネイルと離す。sm 以上は枠線と sm:py-2 があるので sm:pb-2 に戻す
export const CARD_CLASS = `bg-white flex flex-col pb-10
  sm:px-3 sm:py-2 sm:pb-2 sm:rounded-2xl sm:overflow-hidden
  sm:border sm:border-[var(--softborder)] sm:shadow-sm
  2xl:flex-row 2xl:gap-2 2xl:items-center`;
// sm-xl: テキスト + サムネイルの行 / 2xl: テキスト列
export const CARD_BODY_CLASS =
  'flex flex-col px-1 sm:flex-row sm:items-start sm:px-0 2xl:flex-col 2xl:items-start 2xl:flex-none 2xl:w-[486px] 2xl:overflow-hidden';
// テキストエリア（タイトル・説明・タグ・日付）
export const CARD_TEXT_CLASS = 'flex flex-col min-w-0 sm:flex-none sm:w-[341px] md:w-[442px] lg:w-[341px] xl:w-[442px]';
// 説明文。sm 以上は高さを固定しているので、文の長さに関係なくカードの高さがそろう（mobile は文の長さ次第）
export const CARD_DESCRIPTION_CLASS =
  'text-xs sm:text-sm leading-4 sm:leading-5 text-black sm:h-[60px] md:h-10 lg:h-[60px] xl:h-10';
// サムネイル。画面幅によって表示位置が変わるので 3 か所に置き、それぞれ表示する幅だけで見せる
export const CARD_THUMBNAIL_CLASS = {
  // mobile: 上部 (全幅, 角なし)
  top: 'aspect-video w-full sm:hidden',
  // sm-xl: テキストの右
  side: 'hidden sm:block 2xl:hidden aspect-video flex-1 min-w-px min-h-px rounded-lg shrink-0',
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

          <TagsList tags={tags} className="flex gap-0.5 overflow-hidden" />

          <div className="flex gap-2 items-center text-xs leading-4 text-[var(--lighttext)] whitespace-nowrap">
            <span>公開日 : {publishedAt}</span>
            <span>最終更新日 : {updatedAt}</span>
          </div>
        </div>

        {/* sm-xl: 右サムネイル */}
        <Thumbnail url={thumbnailUrl} title={title} className={CARD_THUMBNAIL_CLASS.side} />
      </div>

      {/* 2xl: 右サムネイル (card の直接 flex 子) */}
      <Thumbnail url={thumbnailUrl} title={title} className={CARD_THUMBNAIL_CLASS.end} />
    </Link>
  );
}
