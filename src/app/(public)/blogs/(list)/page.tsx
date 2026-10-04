import PostListPage from '@/components/PostListPage';

// 一覧はページごと作り置きにする。絞り込み（?tags=）とページ送り（?page=）は、PostListPage の中でブラウザ側で行う
export default function BlogPage() {
  return <PostListPage genre="blogs" />;
}
