export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // print:h-auto print:overflow-visible: h-screen + overflow-hidden は画面表示用の制約で、
  // 印刷時にこれが残っていると1画面ぶん（用紙1枚ぶん）で内容が切れてしまい、以降のページが印刷されない
  return (
    <div className="h-screen overflow-hidden bg-white flex flex-col print:h-auto print:overflow-visible">
      {children}
    </div>
  );
}
