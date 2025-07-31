import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-2">
      <div className="bg-background rounded-2xl shadow-2xl overflow-hidden relative">
        <Header />
        <div className="relative z-10 bg-background rounded-b-2xl">
          <LiveScore />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
