import Footer from "@/components/Footer";
import Header from "@/components/header";
import RelevanceAgentsPage from "@/components/RelevanceAgentsPage";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
        <Header />
      <main className="flex-grow">
        <RelevanceAgentsPage />
      </main>
      <Footer />
    </div>
  );
}