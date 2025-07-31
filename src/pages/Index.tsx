import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-2">
      {/* МАСТЪР контейнер */}
      <div className="h-[calc(100vh-1rem)] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ХЕДЪР част - sticky с заоблени горни ъгли */}
        <div className="sticky top-0 z-10 bg-background rounded-t-2xl">
          <Header />
        </div>
        
        {/* БЛОК част - скролиращ с заоблени долни ъгли */}
        <div className="flex-1 overflow-y-auto bg-background rounded-b-2xl">
          <LiveScore />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
