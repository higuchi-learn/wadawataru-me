import ArticlePage from '@/components/ArticlePage';
import type { Genre } from '@/components/GenreAbout';
import { getPostById, getTagsByPostId } from '@/db/queries/select';
import { isPublishedPostSlug } from '@/db/queries/cached';
import { formatDate } from '@/lib/formatDate';
import { notFound } from 'next/navigation';

// genre は各ジャンルのルート（/products/[slug] など）から渡す。記事ページの見出し帯の英字ラベルと一覧へ戻るリンクに使う
export default async function PostDetailPage({ genre, slug }: { genre: Genre; slug: string }) {
  // getPostById は SQL の WHERE status = 'published' で絞っているため
  // 公開中の記事なら post オブジェクトが返り、下書き・アーカイブ・存在しない slug なら null が返る
  // Next.js は layout.tsx の確認（記事がなければ 404）と並行してページ本体も動かし始めるので、記事がない URL では
  // ここでも Neon を読む前に、作り置きの slug 一覧で確かめて止める（でたらめな URL のたびに Neon を起こさない）
  if (!(await isPublishedPostSlug(genre, slug))) notFound();
  const post = await getPostById(genre, slug);
  // post が null のとき notFound() を呼ぶ
  // notFound() はその場で処理を止め、ブラウザに 404 ページを返す Next.js の関数
  // これを呼ばないと null のまま次行の post.id にアクセスしてエラーになる
  if (!post) notFound();
  const tags = await getTagsByPostId(post.id);
  return (
    <ArticlePage
      genre={genre}
      title={post.title}
      description={post.description}
      tags={tags}
      // formatDate で Date 型を表示用文字列に変換する（null の場合はプレースホルダーを返す）
      publishedAt={formatDate(post.publishedAt)}
      updatedAt={formatDate(post.updatedAt)}
      content={post.content}
    />
  );
}
