import BlogEditor from '@/components/BlogEditor';
import { getTagsForGenre } from '@/db/queries/select';
import type { Genre } from '@/components/GenreAbout';

const ALL_GENRES = ['products', 'blogs', 'books'] as const;

export default async function PostCreatePage({ genre }: { genre: Genre }) {
  // 全ジャンルのタグを並列取得して、このジャンル用と他ジャンル用に分ける
  // このジャンル分だけ取得すると TagSelectOverlay の「他ジャンルのタグを追加」機能に必要な
  // データが揃わない。Promise.all で3件同時に fetch することで実質1往復で済む
  const [products, blogs, books] = await Promise.all([
    getTagsForGenre('products'),
    getTagsForGenre('blogs'),
    getTagsForGenre('books'),
  ]);
  const byGenre = { products, blogs, books };
  const currentTags = byGenre[genre];

  // 他ジャンルに存在しつつこのジャンルに未登録のタグを導出する
  // ① このジャンル以外のタグを1次元配列に展開
  // ② 同じタグが複数ジャンルにあっても重複して渡さないよう id で一意に絞る
  // ③ このジャンルにすでに登録済みのタグはオーバーレイに不要なので除外する
  const otherGenreTags = ALL_GENRES
    .filter((g) => g !== genre)
    .flatMap((g) => byGenre[g])
    .filter((tag, idx, arr) => arr.findIndex((t) => t.id === tag.id) === idx)
    .filter((tag) => !currentTags.some((t) => t.id === tag.id));

  return <BlogEditor genre={genre} mode="create" availableTags={currentTags} otherGenreTags={otherGenreTags} />;
}
