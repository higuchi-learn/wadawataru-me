import { Suspense } from "react";
import { GenreAbout, SearchBar, SelectPageBar, CardList } from "@/components";
import type { Genre } from "@/components";
import type { CardData } from "@/components";
import { getPostsList, getPostsCount, getTagsList, PAGE_SIZE } from "@/db/queries/select";
import { formatDate } from "@/lib/formatDate";
import type { SelectPost } from "@/db/schema";

function toDbGenre(genre: Genre): SelectPost["genre"] {
  return genre === "blog" ? "blogs" : genre;
}

type Props = {
  genre: Genre;
  searchParams: { page?: string; tags?: string };
};

export default async function PostListPage({ genre, searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const tagNames = searchParams.tags?.split(",").filter(Boolean) ?? [];

  const allTags = await getTagsList();
  const tagIds = allTags.filter((t) => tagNames.includes(t.name)).map((t) => t.id);

  const [posts, totalCount] = await Promise.all([
    getPostsList(toDbGenre(genre), "published", tagIds, page),
    getPostsCount(toDbGenre(genre), "published", tagIds),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const cards: CardData[] = posts.map((post) => ({
    id: post.id,
    title: post.title,
    description: post.description,
    tags: post.tags,
    publishedAt: formatDate(post.publishedAt),
    updatedAt: formatDate(post.updatedAt),
    thumbnailUrl: post.thumbnail ?? undefined,
    href: `/${genre}/${post.slug}`,
  }));

  return (
    <>
      <div className="flex flex-col items-center py-1 w-full shrink-0">
        <GenreAbout genre={genre} className="w-full" />
        <Suspense>
          <SearchBar availableTags={allTags.map((t) => t.name)} className="w-[365px]" />
        </Suspense>
      </div>
      <main className="flex-1 flex flex-col items-center gap-2.5">
        <div className="flex flex-col gap-1.5 items-center py-1 w-full">
          <Suspense>
            <SelectPageBar totalPages={totalPages} />
          </Suspense>
          <CardList cards={cards} />
          <Suspense>
            <SelectPageBar totalPages={totalPages} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
