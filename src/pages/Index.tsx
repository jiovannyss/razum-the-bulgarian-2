import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-2 overflow-hidden">
      <Header />
      <div className="bg-background rounded-b-2xl shadow-2xl overflow-hidden relative -mt-px">
        <div className="overflow-hidden">
          <LiveScore />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
