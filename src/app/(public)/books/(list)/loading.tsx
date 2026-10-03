import PostListSkeleton from '@/components/PostListSkeleton';

// 一覧ページ（同じフォルダの page.tsx）のデータを待つ間に表示する骨組み
// (list) は URL に影響しない route group。loading.tsx を books/ の直下に置くと、
// 記事の詳細ページ（books/[slug]）へ移るときにも一覧用の骨組みが出てしまうため、一覧ページだけをこのフォルダに入れている
export default function Loading() {
  return <PostListSkeleton genre="books" />;
}
