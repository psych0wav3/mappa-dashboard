import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import RegisterPageClient from "./RegisterPageClient";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />
      <RegisterPageClient />
      <Footer />
    </div>
  );
}
