import Header from "@/components/Header";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";
import { APIFootballTest } from "@/components/APIFootballTest";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* API-Football Test Component */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <APIFootballTest />
        </div>
      </div>
      
      <LiveScore />
      <Footer />
    </div>
  );
};

export default Index;
