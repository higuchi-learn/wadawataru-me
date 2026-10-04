// ページのデータを読み込んでいる間に表示する、共通の読み込み中表示
// 記事の詳細ページ・年表・管理画面の loading.tsx から使う（一覧ページは、カードの形をした専用の骨組み PostListSkeleton を使う）
//
// なぜ必要か:
//   これらのページは毎回サーバーで DB を引いて描画するため、DB やサーバーの休止明けは数秒かかることがある
//   loading.tsx がないと、リンクを押してからデータが届くまで画面が一切変わらず、固まったように見える
//   loading.tsx があると、Next.js はそれを Suspense の fallback として即座に表示し、データが届いたら差し替える
export default function PageLoading() {
  return (
    // role="status": 読み込み中であることを読み上げソフトにも伝える
    <div role="status" className="flex-1 flex flex-col items-center justify-center gap-3 py-24 text-[var(--lighttext)]">
      {/* 回転する輪。motion-safe: OS で「視差効果を減らす」を設定している人には回転させない（輪は表示したまま） */}
      <span
        aria-hidden="true"
        className="size-8 rounded-full border-[3px] border-[var(--enableorange)] border-t-[var(--ogangetext)] motion-safe:animate-spin"
      />
      <p className="text-sm">読み込み中です…</p>
    </div>
  );
}
