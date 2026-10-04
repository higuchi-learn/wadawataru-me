// 管理画面は常に最新の内容が必要なので、すべてのページをリクエストごとに作る（作り置きしない）
// これがないと、DB を読むだけのページ（タグ管理・日記一覧・年表の作成など）はビルド時に作られ、
// 公開ページの作り置き（R2）を有効にしたことで、ビルド時の内容のまま固まってしまう
export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // print:h-auto print:overflow-visible: h-screen + overflow-hidden は画面表示用の制約で、
  // 印刷時にこれが残っていると1画面ぶん（用紙1枚ぶん）で内容が切れてしまい、以降のページが印刷されない
  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col print:h-auto print:overflow-visible">
      {children}
    </div>
  );
}
