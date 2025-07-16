import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Users, Target, TrendingUp, Star, Zap } from "lucide-react";
import heroImage from "@/assets/hero-football.jpg";

const Hero = () => {
  const features = [
    {
      icon: Trophy,
      title: "Наградни фондове",
      description: "Печелете реални награди",
    },
    {
      icon: Users,
      title: "Виртуални стаи",
      description: "Играйте с приятели",
    },
    {
      icon: Target,
      title: "Прецизни прогнози",
      description: "Покажете знанията си",
    },
    {
      icon: TrendingUp,
      title: "Живи резултати",
      description: "Следете на живо",
    },
  ];

  const stats = [
    { value: "10K+", label: "Активни играчи" },
    { value: "500+", label: "Дневни мачове" },
    { value: "95%", label: "Доволни потребители" },
    { value: "24/7", label: "Поддръжка" },
  ];

  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Football prediction platform" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-background/80 to-secondary/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center space-y-8 animate-fade-in-up">
          {/* Main Hero Content */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-secondary/20 backdrop-blur-sm rounded-full px-4 py-2 text-secondary-foreground border border-secondary/30">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium">№1 Платформа за футболни прогнози</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="text-gradient">Glowter</span>
              <br />
              <span className="text-foreground">Вашите прогнози,</span>
              <br />
              <span className="text-secondary">Вашите награди</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Присъединете се към най-вълнуващата платформа за футболни прогнози. 
              Състезавайте се с играчи от цял свят и печелете от знанията си!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-delay-200">
              <Button variant="hero" size="lg" className="group">
                <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                Започни сега
              </Button>
              <Button variant="outline" size="lg" className="bg-background/10 backdrop-blur-sm border-white/20 text-foreground hover:bg-background/20">
                Виж как работи
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 animate-delay-300">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-white/10 card-hover">
                <div className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`bg-card/30 backdrop-blur-sm border-white/10 card-hover animate-fade-in-up animate-delay-${(index + 1) * 100}`}
            >
              <div className="p-6 text-center space-y-4">
                <div className="mx-auto w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 bg-secondary/20 rounded-full blur-xl animate-pulse" />
      <div className="absolute bottom-1/4 right-10 w-32 h-32 bg-accent/20 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
    </section>
  );
};

export default Hero;