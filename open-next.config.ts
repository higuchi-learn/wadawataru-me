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
});
