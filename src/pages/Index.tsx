import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen p-0 sm:p-2">
      {/* МАСТЪР контейнер */}
      <div className="h-screen sm:h-[calc(100vh-1rem)] bg-background rounded-none sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* ХЕДЪР част - sticky с заоблени горни ъгли */}
        <div className="sticky top-0 z-10 bg-background rounded-t-none sm:rounded-t-2xl">
          <Header />
        </div>
        
        {/* БЛОК част - скролиращ с заоблени долни ъгли */}
        <div className="flex-1 overflow-y-auto bg-background rounded-b-none sm:rounded-b-2xl">
          {/* Advertisement Space */}
          <div className="h-16 sm:h-20 lg:h-24 bg-muted/20 border-b border-purple-700/30 flex items-center justify-center">
            <div className="text-muted-foreground text-xs sm:text-sm">Advertisement Space</div>
          </div>
          <LiveScore />
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Index;
