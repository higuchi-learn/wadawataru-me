import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AdminListLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-white">
      <Header variant="admin" />
      <div className="flex-1 flex justify-center">
        <div className="w-full bg-white flex flex-col">
          {children}
        </div>
      </div>
      <Footer />
    </div>
  );
}
