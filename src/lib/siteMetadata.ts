import type { Metadata } from 'next';

export const SITE_NAME = 'わだわたるのログマガ';

// サイトの URL。サイトマップ・robots.txt・構造化データ（JSON-LD）のように、相対パスを使えない場所で使う
export const SITE_URL = 'https://wadawataru.me';

// トップページの題名と説明。検索結果でトップページが「本人のページ」として出るよう、
// 名前（わだわたる・本名）と、何のサイトか（ポートフォリオ）と、中身（制作物・経歴・受賞歴・資格・ブログ）を入れる。
// 以前はサイト名だけ・「わだわたるのポートフォリオサイト」だけで、説明の詳しい経歴ページの方が名前の検索で上に出ていた
export const HOME_TITLE = `わだわたる（樋口 陽輝）のポートフォリオ | ${SITE_NAME}`;
export const HOME_DESCRIPTION =
  '愛知工業大学 電子情報工学専攻3年、わだわたる（樋口 陽輝）のポートフォリオ兼ブログです。ハッカソンで最優秀賞を取った Gesture Audio などの制作物、経歴・受賞歴・資格、日々のブログをまとめています。';

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
// path はそのページの正式な URL（canonical）。理由は canonical() のコメントを参照
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return { title, description, openGraph: siteOpenGraph(title, description), alternates: canonical(path) };
}

// ページの正式な URL（<link rel="canonical">）。layout.tsx の metadataBase で https://wadawataru.me/... に直される。
// 同じページに ?tags= や ?page= の付いた URL・末尾のスラッシュ違い・SNS が付ける ?utm_... などで
// 別の URL から来ても、検索エンジンに「正式な URL はこれ」と伝え、評価を1つの URL にまとめてもらう。
// layout.tsx に書くと全ページに引き継がれて全部がトップページを指してしまうので、ページごとに書く
export function canonical(path: string): NonNullable<Metadata['alternates']> {
  return { canonical: path };
}

// 正方形の画像なので、横長の大きな画像（summary_large_image）ではなく小さな四角で出す
export const SITE_TWITTER: NonNullable<Metadata['twitter']> = {
  card: 'summary',
  images: [SITE_OG_IMAGE.url],
};
