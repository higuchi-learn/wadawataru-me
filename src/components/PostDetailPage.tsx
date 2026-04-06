import ArticlePage from '@/components/ArticlePage';
import { getPostById, getTagsByPostId } from '@/db/queries/select';
import { formatDate } from '@/lib/formatDate';
import { notFound } from 'next/navigation';

export default async function PostDetailPage({ slug }: { slug: string }) {
  // getPostById は SQL の WHERE status = 'published' で絞っているため
  // 公開中の記事なら post オブジェクトが返り、下書き・アーカイブ・存在しない slug なら null が返る
  const post = await getPostById(slug);
  // post が null のとき notFound() を呼ぶ
  // notFound() はその場で処理を止め、ブラウザに 404 ページを返す Next.js の関数
  // これを呼ばないと null のまま次行の post.id にアクセスしてエラーになる
  if (!post) notFound();
  const tags = await getTagsByPostId(post.id);
  return (
    <ArticlePage
      title={post.title}
      description={post.description}
      tags={tags.map((t) => t.name)}
      // formatDate で Date 型を表示用文字列に変換する（null の場合はプレースホルダーを返す）
      publishedAt={formatDate(post.publishedAt)}
      updatedAt={formatDate(post.updatedAt)}
      content={post.content}
    />
  );
}
