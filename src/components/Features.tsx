import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, 
  Shield, 
  Globe, 
  Users, 
  TrendingUp, 
  Zap, 
  Target, 
  Trophy,
  Clock,
  Heart
} from "lucide-react";

const Features = () => {
  const mainFeatures = [
    {
      icon: Brain,
      title: "Интелигентна система за точкообразуване",
      description: "Уникален алгоритъм - знаещите взимат точки от незнаещите. Колкото по-добре познавате футбола, толкова повече печелите!",
      color: "from-blue-500 to-purple-600"
    },
    {
      icon: Globe,
      title: "Глобални и частни стаи",
      description: "Играйте с хиляди играчи от цял свят или създайте частна стая само с вашите приятели и колеги.",
      color: "from-green-500 to-teal-600"
    },
    {
      icon: Shield,
      title: "Сигурност и справедливост",
      description: "Най-високи стандарти за сигурност. Всички прогнози се записват преди началото на мачовете.",
      color: "from-orange-500 to-red-600"
    }
  ];

  const additionalFeatures = [
    {
      icon: Clock,
      title: "Резултати на живо",
      description: "Следете резултатите в реално време"
    },
    {
      icon: Trophy,
      title: "Наградни фондове",
      description: "Редовни турнири с атрактивни награди"
    },
    {
      icon: Target,
      title: "Прецизни статистики",
      description: "Подробна аналитика на вашите прогнози"
    },
    {
      icon: Users,
      title: "Социални функции",
      description: "Чатове, приятели и групи"
    },
    {
      icon: TrendingUp,
      title: "Класирания",
      description: "Съревновавайте се за топ позициите"
    },
    {
      icon: Heart,
      title: "Лесна употреба",
      description: "Интуитивен и приятелски интерфейс"
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold">
            Защо да изберете <span className="text-gradient">Glowter?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Иновативна платформа, която превръща футболните ви знания в реални награди
          </p>
        </div>

        {/* Main Features */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {mainFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-white/10 card-hover group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity" style={{
                background: `linear-gradient(135deg, var(--primary), var(--secondary))`
              }} />
              
              <div className="relative p-8 space-y-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Additional Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {additionalFeatures.map((feature, index) => (
            <Card 
              key={index}
              className="bg-card/30 backdrop-blur-sm border-white/10 card-hover group p-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <div className="p-8 space-y-6">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-foreground">
                  Готови ли сте да започнете?
                </h3>
                <p className="text-muted-foreground">
                  Регистрирайте се сега и получете бонус от 100 точки за първите си прогнози!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="hero" size="lg" className="group">
                  <Zap className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                  Безплатна регистрация
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-white/20 text-foreground hover:bg-white/10">
                  Научете повече
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;