import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-2">
      <div className="min-h-screen bg-background rounded-2xl shadow-2xl overflow-hidden relative">
        <Header />
        <LiveScore />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
