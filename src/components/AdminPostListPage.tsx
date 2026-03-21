import { Suspense } from "react";
import { GenreAbout, SelectPageBar, CardList } from "@/components";
import AdminSelectBar from "@/components/AdminSelectBar";
import type { Genre } from "@/components";
import type { CardData } from "@/components";
import { getPostsList, getPostsCount, getTagsList, PAGE_SIZE } from "@/db/queries/select";
import { formatDate } from "@/lib/formatDate";
import type { SelectPost } from "@/db/schema";

function toDbGenre(genre: Genre): SelectPost["genre"] {
  return genre === "blog" ? "blogs" : genre;
}

const VALID_STATUSES = ["draft", "published", "archived"] as const;
type Status = typeof VALID_STATUSES[number];

function toStatus(value: string | undefined): SelectPost["status"] {
  return VALID_STATUSES.includes(value as Status) ? (value as Status) : "draft";
}

type Props = {
  genre: Genre;
  searchParams: { page?: string; tags?: string; status?: string };
};

export default async function AdminPostListPage({ genre, searchParams }: Props) {
  const page = Math.max(1, Number(searchParams.page ?? "1"));
  const tagNames = searchParams.tags?.split(",").filter(Boolean) ?? [];
  const status = toStatus(searchParams.status);

  const allTags = await getTagsList();
  const tagIds = allTags.filter((t) => tagNames.includes(t.name)).map((t) => t.id);

  const [posts, totalCount] = await Promise.all([
    getPostsList(toDbGenre(genre), status, tagIds, page),
    getPostsCount(toDbGenre(genre), status, tagIds),
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
    href: `/admin/${genre}/${post.slug}`,
  }));

  return (
    <>
      <div className="flex flex-col items-center py-1 w-full shrink-0">
        <GenreAbout genre={genre} className="w-full" />
        <AdminSelectBar
          genre={genre}
          availableTags={allTags.map((t) => t.name)}
          className="w-full"
        />
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
