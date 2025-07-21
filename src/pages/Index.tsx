import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import LiveScore from "@/components/LiveScore";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Features />
      <LiveScore />
      <Footer />
    </div>
  );
};

export default Index;
