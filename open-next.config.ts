import { defineCloudflareConfig } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import d1NextTagCache from '@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache';

// 公開ページを「作り置き」にして、アクセスのたびに Neon（DB）へ問い合わせないようにする設定
// 仕組みと理由は documents/2026-10-04-static-like-caching.md
export default defineCloudflareConfig({
  // 作ったページ・DB の結果の保存先（wrangler.jsonc の NEXT_INC_CACHE_R2_BUCKET）
  incrementalCache: r2IncrementalCache,
  // revalidatePath / updateTag の「古くなった」記録の保存先（wrangler.jsonc の NEXT_TAG_CACHE_D1）
  tagCache: d1NextTagCache,
  // 時間で作り直す ISR（export const revalidate = 秒数）は使わず、保存・公開したときだけ作り直すので、
  // 作り直しの順番待ち（queue）は設定しない
  //
  // 作り置きのあるページは、Next.js に渡す前に OpenNext が返す
  // これがないと、記事ページ（最初のアクセスで作るページ）の「有効期限なし」を Next.js は Worker のメモリにしか持たず、
  // 新しい Worker が受けたときに期限を「1秒」とみなして「古い」と判定し、その場で作り直して Neon を読んでいた。
  // OpenNext が返す場合は、作り置きに保存された期限（なし）で判定するので、古いと判定されない
  // （PPR を使う場合は false にする必要があるが、このサイトでは使っていない）
  enableCacheInterception: true,
});
