import type { Metadata } from 'next';
import { Inter, Noto_Sans_JP, Geist_Mono } from 'next/font/google';
import './globals.css';

// next/font/google でフォントを読み込むと、ビルド時に Google Fonts からフォントファイルを取得して
// 自己ホスティングするため、実行時に外部リクエストが発生しない（プライバシーと速度の改善）
// variable で CSS 変数名を指定し、className に追加することで Tailwind の font-sans などから参照できる
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const notoSansJP = Noto_Sans_JP({
  variable: '--font-noto-sans-jp',
  subsets: ['latin'],
  // 日本語フォントはファイルサイズが大きいため、使用するウェイトだけを指定して最適化する
  weight: ['400', '600'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// metadata をエクスポートすると Next.js が自動で <head> の <title> / <meta> タグに変換する
export const metadata: Metadata = {
  title: 'わだわたるKIN TV',
  description: 'わだわたるのポートフォリオサイト',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      {/*
        inter.variable などは '--font-inter' という文字列で、これを className に渡すと
        body タグに class="--font-inter ..." が付き、CSS 変数 var(--font-inter) が
        body の中のどこからでも使えるようになる（globals.css で font-family に指定している）

        antialiased はフォントの輪郭を滑らかにする Tailwind クラス
        指定しないとギザギザして見えることがある
      */}
      <body className={`${inter.variable} ${notoSansJP.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
