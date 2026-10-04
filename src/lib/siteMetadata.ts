import type { Metadata } from 'next';

export const SITE_NAME = 'わだわたるのログマガ';

// SNS（Slack・X など）で URL を貼ったときのプレビュー画像。WebP を読めない SNS もあるので JPEG（元は picture/自分.jpg）
const SITE_OG_IMAGE = { url: '/og-profile.jpg', width: 800, height: 800, alt: 'わだわたる' };

// layout.tsx がサイト全体に付ける openGraph。
// Next.js は子ページが title だけを書いても og:title を親（サイト名）のままにするため、
// 独自の題名を持つページは siteOpenGraph(題名) で openGraph ごと書き直す（openGraph は丸ごと置き換わるので画像なども入れ直す）
export function siteOpenGraph(title?: string, description?: string): NonNullable<Metadata['openGraph']> {
  return {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ja_JP',
    ...(title ? { title: `${title} | ${SITE_NAME}` } : {}),
    ...(description ? { description } : {}),
    images: [SITE_OG_IMAGE],
  };
}

// 経歴・受賞・資格・一覧のように、独自の題名と説明を持つページの metadata。
// ブラウザのタブ・SNS のプレビュー・検索結果に「題名 | わだわたるのログマガ」と説明が出る。
// 説明には、ページ上部の見出し帯（PageHero）の紹介文をそのまま使う
export function pageMetadata(title: string, description: string): Metadata {
  return { title, description, openGraph: siteOpenGraph(title, description) };
}

// 正方形の画像なので、横長の大きな画像（summary_large_image）ではなく小さな四角で出す
export const SITE_TWITTER: NonNullable<Metadata['twitter']> = {
  card: 'summary',
  images: [SITE_OG_IMAGE.url],
};
