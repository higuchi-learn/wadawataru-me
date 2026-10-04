import type { Metadata } from 'next';
import PostListPage from '@/components/PostListPage';
import { GENRE_INFO } from '@/components/GenreAbout';
import { pageMetadata } from '@/lib/siteMetadata';

// 題名と説明は、見出し帯（PageHero）と同じ GENRE_INFO から作る
export const metadata: Metadata = pageMetadata(GENRE_INFO.products.title, GENRE_INFO.products.description);

// 一覧はページごと作り置きにする。絞り込み（?tags=）とページ送り（?page=）は、PostListPage の中でブラウザ側で行う
export default function ProductsPage() {
  return <PostListPage genre="products" />;
}
