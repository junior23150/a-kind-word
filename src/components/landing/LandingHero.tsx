import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, BarChart3, Zap, Sparkles, ArrowRight, PlayCircle } from "lucide-react";

interface LandingHeroProps {
  onSignupClick: () => void;
}

export const LandingHero = ({ onSignupClick }: LandingHeroProps) => {
  return (
    <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5"></div>
      <div className="absolute top-20 left-10 w-48 sm:w-72 h-48 sm:h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-secondary/10 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto text-center max-w-5xl relative z-10">
        <Badge variant="secondary" className="mb-6 sm:mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 px-4 sm:px-6 py-2 text-sm sm:text-base">
          <Sparkles className="w-4 h-4 mr-2" />
          IA Financeira Revolucionária
        </Badge>
        
        <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight">
          Transforme Suas 
          <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            {" "}Finanças{" "}
          </span>
          com Inteligência
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
          A assistente financeira mais avançada do Brasil. Registre gastos por 
          <strong className="text-primary"> voz, foto ou texto</strong> e receba insights personalizados 
          direto no seu WhatsApp.
        </p>
        
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-2xl p-4 sm:p-6 max-w-2xl mx-auto mb-8 sm:mb-12">
          <p className="text-base sm:text-lg text-primary font-semibold mb-2">💜 Experimente o Knumbers gratuitamente</p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
            Descubra como é fácil organizar suas finanças de forma inteligente. Transforme sua relação com o dinheiro hoje mesmo!
          </p>
          <p className="text-xs sm:text-sm text-primary/80 italic">
            ✨ Sua vida financeira organizada está a poucos cliques de distância
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
          <Button 
            size="lg" 
            className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-xl group w-full sm:w-auto"
            onClick={onSignupClick}
          >
            <span className="hidden sm:inline">Conheça o Knumbers</span>
            <span className="sm:hidden">Começar Agora</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-4 sm:py-5 md:py-6 border-2 group w-full sm:w-auto">
            <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Ver Demonstração</span>
            <span className="sm:hidden">Ver Demo</span>
          </Button>
        </div>

        {/* Feature cards preview */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4 sm:px-0">
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">WhatsApp Nativo</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Registre gastos naturalmente conversando</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-secondary/5 border-secondary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-secondary to-primary rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">IA Avançada</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Categorização automática e insights inteligentes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-card to-primary/5 border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 sm:col-span-2 md:col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-xl mx-auto mb-3 sm:mb-4 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="font-bold mb-2 text-sm sm:text-base">Dashboard Completo</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Visualizações avançadas e relatórios detalhados</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};