import BlogEditor from '@/components/BlogEditor';
import type { ArticleInitialData } from '@/components/BlogEditor';
import { getPostByIdForAdmin, getTagsByPostId, getTagsForGenre } from '@/db/queries/select';
import { formatSavedAt } from '@/lib/formatDate';
import type { Genre } from '@/components/GenreAbout';
import { notFound } from 'next/navigation';

const ALL_GENRES = ['products', 'blogs', 'books'] as const;

export default async function PostEditPage({ id, genre }: { id: string; genre: Genre }) {
  const post = await getPostByIdForAdmin(id);
  if (!post) notFound();

  // 記事タグ・全ジャンルのタグを並列取得する
  // 全ジャンルを取得する理由は PostCreatePage と同じ（他ジャンルからのタグ追加に使う）
  // 記事タグ取得も同じ Promise.all に含めることで DB 往復を1回にまとめる
  const [tags, products, blogs, books] = await Promise.all([
    getTagsByPostId(post.id),
    getTagsForGenre('products'),
    getTagsForGenre('blogs'),
    getTagsForGenre('books'),
  ]);
  const byGenre = { products, blogs, books };
  const currentTags = byGenre[genre];

  // 他ジャンルに存在しつつこのジャンルに未登録のタグを導出する（PostCreatePage と同じロジック）
  // ① 他ジャンルを展開 → ② 重複除去 → ③ 現ジャンル登録済みを除外
  const otherGenreTags = ALL_GENRES
    .filter((g) => g !== genre)
    .flatMap((g) => byGenre[g])
    .filter((tag, idx, arr) => arr.findIndex((t) => t.id === tag.id) === idx)
    .filter((tag) => !currentTags.some((t) => t.id === tag.id));

  const initialData: ArticleInitialData = {
    id: post.id,
    slug: post.slug,
    title: post.title,
    description: post.description,
    content: post.content,
    thumbnail: post.thumbnail,
    tags: tags.map((t) => t.name),
    publishStatus: post.status,
    savedAt: formatSavedAt(post.updatedAt),
  };

  return (
    <BlogEditor
      genre={genre}
      mode="edit"
      initialData={initialData}
      availableTags={currentTags}
      otherGenreTags={otherGenreTags}
    />
  );
}
