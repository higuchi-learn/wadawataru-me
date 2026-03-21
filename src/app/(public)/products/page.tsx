import { GenreAbout, SearchBar, SelectPageBar, CardList } from "@/components";
import type { CardData } from "@/components";

const MOCK_CARDS: CardData[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `サンプルプロジェクト ${i + 1}`,
  description: "個人開発やハッカソンで制作したプロダクトのサンプルです。",
  tags: ["Next.js", "TypeScript", "Tailwind"],
  publishedAt: "2026年03月06日",
  updatedAt: "2026年03月06日",
  href: "#",
}));

export default function ProductsPage() {
  return (
    <>
      {/* PostsHeader */}
      <div className="flex flex-col items-center py-1 w-full shrink-0">
        <GenreAbout genre="products" className="w-full" />
        <SearchBar className="w-[365px]" />
      </div>

      {/* メインコンテンツ */}
      <main className="flex-1 flex flex-col items-center gap-2.5">
        <div className="flex flex-col gap-1.5 items-center py-1 w-full">
          <SelectPageBar totalPages={5} />
          <CardList cards={MOCK_CARDS} />
          <SelectPageBar totalPages={5} />
        </div>
      </main>
    </>
  );
}
