import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-screen-2xl bg-white flex flex-col">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
