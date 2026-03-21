import Link from "next/link";
import CardTitle from "@/components/CardTitle";
import TagsList from "@/components/TagsList";

type CardProps = {
  title: string;
  description: string;
  tags: string[];
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
 *   カード: px-2 py-1 rounded-xl shadow
 *   [タイトル(text-lg/semibold, 上部全幅, truncate)]
 *   [テキスト列(shrink-0, w-341px@500px / w-410px@600px) | サムネイル(flex-1, aspect-video, rounded-lg)]
 *
 * 2xl:
 *   カード: flex-row gap-2 items-center px-2 py-1 rounded-xl shadow
 *   [テキスト列(shrink-0, w-424px): タイトル + 説明 + タグ + 日付]
 *   [サムネイル(flex-1, aspect-video, rounded-lg)]
 */
export default function Card({
  title,
  description,
  tags,
  publishedAt,
  updatedAt,
  href = "#",
  className,
}: CardProps) {
  return (
    <Link
      href={href}
      className={`bg-white flex flex-col
        sm:px-2 sm:py-1 sm:rounded-xl sm:overflow-hidden
        sm:shadow-[0_0_5px_rgba(0,0,0,0.25)] sm:hover:shadow-[0_0_8px_rgba(0,0,0,0.2)] sm:transition-shadow
        2xl:flex-row 2xl:gap-2 2xl:items-center
        ${className ?? ""}`}
    >
      {/* mobile: 上部サムネイル (全幅, 角なし) */}
      <div className="aspect-video w-full bg-neutral-100 sm:hidden" />

      {/* sm-xl: 上部タイトル */}
      <CardTitle title={title} size="Default" className="hidden sm:flex 2xl:hidden flex-col items-start" />

      {/* sm-xl: テキスト + サムネイルの行  /  2xl: テキスト列 */}
      <div className="flex flex-col px-1 sm:flex-row sm:items-start sm:px-0 2xl:flex-col 2xl:items-start 2xl:flex-none 2xl:w-[486px] 2xl:overflow-hidden">
        {/* テキストエリア */}
        <div className="flex flex-col min-w-0 sm:flex-none sm:w-[341px] md:w-[442px] lg:w-[341px] xl:w-[442px]">
          {/* mobile: タイトル */}
          <CardTitle title={title} size="Short" className="sm:hidden flex flex-col items-start" />
          {/* 2xl: タイトル (テキスト列内) */}
          <CardTitle title={title} size="Default" className="hidden 2xl:flex flex-col items-start" />

          <p className="text-xs sm:text-sm leading-4 sm:leading-5 text-black sm:h-[60px] md:h-10 lg:h-[60px] xl:h-10">
            {description}
          </p>

          <TagsList tags={tags} className="flex gap-0.5 overflow-hidden" />

          <div className="flex gap-2 items-center text-xs leading-4 text-[var(--lighttext)] whitespace-nowrap">
            <span>公開日 : {publishedAt}</span>
            <span>最終更新日 : {updatedAt}</span>
          </div>
        </div>

        {/* sm-xl: 右サムネイル */}
        <div className="hidden sm:block 2xl:hidden aspect-video flex-1 min-w-px min-h-px bg-neutral-100 rounded-lg shrink-0" />
      </div>

      {/* 2xl: 右サムネイル (card の直接 flex 子) */}
      <div className="hidden 2xl:block aspect-video flex-1 min-w-px min-h-px bg-neutral-100 rounded-lg shrink-0" />
    </Link>
  );
}
