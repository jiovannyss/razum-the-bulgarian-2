import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-2">
      <Header />
      <div className="bg-background rounded-b-2xl shadow-2xl overflow-hidden relative -mt-px" 
           style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <div className="overflow-y-auto h-full">
          <LiveScore />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
