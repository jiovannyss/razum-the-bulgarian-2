import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, BarChart3, Clock, Star, Shield, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Турнирни Прогнози",
      description: "Прави прогнози за всички популярни турнири - Шампионска лига, Премиер лига, Серия А и още",
      badge: "Популярно"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Детайлни Статистики",
      description: "Следи точността на прогнозите си с подробни статистики и анализи на представянето",
      badge: "Аналитика"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Live Резултати",
      description: "Получавай моментални уведомления за резултатите и виж как се развиват прогнозите ти",
      badge: "Реално време"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Рейтинг Система",
      description: "Качвай се в класирането с точни прогнози и спечели признание сред другите играчи",
      badge: "Състезание"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Експертни Анализи",
      description: "Използвай нашите експертни анализи и статистики за по-точни прогнози",
      badge: "Експертно"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Бързи Прогнози",
      description: "Интуитивен интерфейс, който ти позволява да правиш прогнози за секунди",
      badge: "Лесно"
    }
  ];

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Защо да избереш нашата платформа?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Всичко което ти трябва за успешни футболни прогнози на едно място
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {feature.icon}
                  </div>
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;