import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminListLayout({ children }: { children: React.ReactNode }) {
  // print:overflow-visible: overflow-y-auto のままだと印刷プレビューにスクロールバーが表示されたり、
  // 用紙1枚ぶんの高さで内容が切れてしまうことがあるため、印刷時は制約を外す
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white print:overflow-visible">
      <Header variant="admin" />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-screen-2xl bg-white flex flex-col">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
