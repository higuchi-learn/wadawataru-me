import type { Metadata } from 'next';
import type { Genre } from '@/components/GenreAbout';
import { getPostById } from '@/db/queries/select';
import { isPublishedPostSlug } from '@/db/queries/cached';
import { canonical } from '@/lib/siteMetadata';

// blogs/products/books の各 [slug]/page.tsx の generateMetadata から呼ぶ
// ジャンルで絞って記事を探すため、genre を受け取る（違うジャンルの URL では記事を見つけない）
// 記事が見つからない場合は空を返す（記事がない URL は、先に [slug]/layout.tsx で 404 になる）
export async function generatePostMetadata(genre: Genre, slug: string): Promise<Metadata> {
  // Next.js は layout.tsx の確認と並行して generateMetadata も動かすので、記事がない URL では
  // ここで Neon を読む前に、作り置きの slug 一覧で確かめて止める（でたらめな URL のたびに Neon を起こさない）
  if (!(await isPublishedPostSlug(genre, slug))) return {};
  const post = await getPostById(genre, slug);
  if (!post) return {};

  // 手動サムネイルが設定されていればそれを、無ければタイトルから自動生成した画像をOGP画像として使う
  // /api/og は常に1200x630のPNGを返す（Card.tsx等でのサムネイル表示にも使うので aspect-video 相当）
  // 手動サムネイルは実際のサイズが分からないため width/height は付けない
  const ogImage = post.thumbnail
    ? { url: post.thumbnail }
    : { url: `/api/og?title=${encodeURIComponent(post.title)}`, width: 1200, height: 630 };

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
    alternates: canonical(`/${genre}/${slug}`),
    // 書かないと layout.tsx の twitter（本人の写真・小さな四角）が引き継がれるので、記事の画像で上書きする
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage.url],
    },
  };
}

// 記事ページをページごと作り置きにするための指定（blogs/products/books の各 [slug]/page.tsx から re-export する）
//
// 空の配列を返すと、ビルド時には1ページも作らず、「最初にアクセスされたときに作って保存し、以降は保存したページを返す」動きになる。
// これがないと、[slug] のページは毎回作られ、そのたびに Neon へ問い合わせる。
// 保存したページは、管理画面で記事を保存・公開・アーカイブしたときに revalidatePath で捨てる（src/lib/revalidatePublic.ts）。
// ビルド時に全記事を作らないのは、ビルドが DB に依存しないようにするため（公開後の最初のアクセスで作られれば十分）
export function generateStaticParams(): { slug: string }[] {
  return [];
}
