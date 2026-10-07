import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/siteMetadata';

// /robots.txt を返す。検索エンジンのクローラーは、サイトを見に来るとまずこのファイルを読む
// ここに sitemap.xml の場所を書いておくと、Search Console に登録していない検索エンジン（Bing など）も
// 記事の一覧（sitemap.xml）を見つけられ、新しい記事が早く検索に出るようになる
//
// 以前はこのファイルがなく、Cloudflare が自動で出す robots.txt（AI の学習に使ってよいかの説明文だけ）が返っていた。
// Cloudflare のその機能は、元の robots.txt があればその前に説明文を足す動きなので、説明文はこれまでどおり残る
//
// /admin や /api は止めない。管理画面はログインしないと /login に移動するだけで、検索に出る中身がない。
// /api/images・/api/og は記事の画像で、止めると画像検索や SNS のプレビューに使われなくなる
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
