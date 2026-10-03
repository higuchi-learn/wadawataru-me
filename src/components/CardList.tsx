import Card from '@/components/Card';
import type { TagListItem } from '@/components/TagsList';

export type CardData = {
  id: string | number;
  title: string;
  description: string;
  tags: TagListItem[];
  publishedAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
  href?: string;
};

type CardListProps = {
  cards: CardData[];
  className?: string;
};

// 一覧の並べ方と、ブレークポイントごとのカード幅
// 読み込み中の骨組み（PostListSkeleton）も同じクラスを使い、骨組みと本物の並び・幅を一致させる
//
// lg:px-0: lg（1024px）以上ではカード（500px）を 2 列に並べる。ブレークポイントはスクロールバーを含めた画面幅で
// 判定されるが、実際に並べられる幅はスクロールバーの分（Windows で 15〜17px）狭く、1024px のときは 1007〜1009px しかない。
// 左右の余白 4px ずつ（sm:p-1）を残すと 2 列に 500*2 + 間隔 6 + 余白 8 = 1014px 必要になり、1024〜1028px で
// 2 枚目が次の行に落ちて 1 列になってしまう。lg 以上は左右の余白をなくし、必要な幅を 1006px に収める
export const CARD_LIST_CLASS =
  'w-full flex flex-col items-center gap-0 sm:gap-1.5 sm:p-1 lg:flex-row lg:flex-wrap lg:justify-center lg:gap-1.5 lg:px-0 lg:py-1';
export const CARD_WIDTH_CLASS = 'w-full sm:w-[500px] md:w-[600px] lg:w-[500px] xl:w-[600px] 2xl:w-[700px]';

/**
 * カード一覧グリッド
 *
 * カード幅:
 *   mobile : 全幅
 *   sm     : 500px  (1列)
 *   md     : 600px  (1列)
 *   lg     : 500px  (2列, flex-wrap in 1024px)
 *   xl     : 600px  (2列, flex-wrap in 1280px)
 *   2xl    : 700px  (2列, flex-wrap in 1536px)
 */
export default function CardList({ cards, className }: CardListProps) {
  return (
    <div className={className ?? CARD_LIST_CLASS}>
      {cards.map((card) => (
        <Card
          key={card.id}
          title={card.title}
          description={card.description}
          tags={card.tags}
          publishedAt={card.publishedAt}
          updatedAt={card.updatedAt}
          thumbnailUrl={card.thumbnailUrl}
          href={card.href}
          // ブレークポイントごとのカード幅
          className={CARD_WIDTH_CLASS}
        />
      ))}
    </div>
  );
}
