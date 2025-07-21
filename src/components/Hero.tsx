import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TrendingUp, Target, Users } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
            Футболни Прогнози
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Прави точни прогнози за любимите си мачове и състезавай се с други фенове
          </p>
        </div>

        {/* CTA Button */}
        <div className="mb-12">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold"
            onClick={() => navigate("/make-prediction")}
          >
            Направи Прогноза
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Точни Анализи</h3>
            <p className="text-sm text-muted-foreground">Подробни статистики за всеки мач</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Реални Прогнози</h3>
            <p className="text-sm text-muted-foreground">Следи резултатите в реално време</p>
          </div>
          
          <div className="flex flex-col items-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold">Общност</h3>
            <p className="text-sm text-muted-foreground">Състезавай се с други фенове</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;