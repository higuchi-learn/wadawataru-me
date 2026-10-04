import { revalidatePath, updateTag } from 'next/cache';
import { CACHE_TAGS } from '@/db/queries/cached';
import type { Genre } from '@/components/GenreAbout';

// 管理画面で保存・公開したときに、公開ページの「作り置き」を捨てる関数
//
// 公開ページは、ページ（記事ページ・サイトマップ）や DB の結果（一覧・年表）を R2 に作り置きしている。
// 捨てると D1 に「〇時〇分に古くなった」と記録され、次のアクセスで Neon を読んで作り直す。
// 捨て忘れると古い内容が出続ける（非公開にした記事が見え続けるなど）ので、
// 公開ページの見た目が変わる Server Action では、必ずどれかを呼ぶ。
//
// updateTag / revalidatePath はどちらも「すぐ古いとみなす」。Server Action の中でしか使えない（updateTag）
// 操作ごとに何を捨てるかの一覧は documents/2026-10-04-static-like-caching.md にまとめている

// 記事1件を保存・公開・アーカイブしたとき
export function revalidatePostPages(genre: Genre, slug: string) {
  // 記事一覧・件数（公開・非公開が変わると件数も変わる）
  updateTag(CACHE_TAGS.posts);
  // その記事のページ
  revalidatePath(`/${genre}/${slug}`);
  // サイトマップ（公開中の記事の URL と更新日時を載せている）
  revalidatePath('/sitemap.xml');
}

// タグの並び順・ジャンルへの追加/除外など、一覧の検索バーだけが変わるとき
export function revalidatePostLists() {
  updateTag(CACHE_TAGS.posts);
}

// タグの名前・画像の変更や削除など、どの記事ページに出ているタグも変わりうるとき
export function revalidateAllPostPages() {
  updateTag(CACHE_TAGS.posts);
  // '/' を 'layout' で指定すると、すべてのページの作り置きを捨てる
  // （記事ページの URL を1つずつ集めるより確実。タグの変更はまれなので、作り直しの回数も問題にならない）
  revalidatePath('/', 'layout');
}

// 年表の出来事・ラベルを保存・削除したとき
export function revalidateHistoryPages() {
  updateTag(CACHE_TAGS.history);
  // サイトマップ（詳細のある出来事の URL を載せている）
  revalidatePath('/sitemap.xml');
}
