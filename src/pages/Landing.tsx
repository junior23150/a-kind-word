import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, MessageCircle, BarChart3, TrendingUp, Smartphone, PieChart, Sparkles, Shield, Zap, Users, ArrowRight, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingWhatsApp } from "@/components/landing/LandingWhatsApp";
import { SignupFlow } from "@/components/SignupFlow";

const Landing = () => {
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      
      {/* Quick Access */}
      <div className="fixed top-20 right-4 z-50 flex gap-2">
        <Button variant="secondary" size="sm" asChild className="shadow-lg">
          <Link to="/auth">
            🔐 Entrar
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="shadow-lg">
          <Link to="/dashboard">
            🏠 Dashboard
          </Link>
        </Button>
      </div>
      
      <LandingHero onSignupClick={() => setSignupOpen(true)} />
      <LandingWhatsApp />

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Badge className="mb-4 sm:mb-6 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Tecnologia de Ponta
            </Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Recursos que Fazem a 
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {" "}Diferença
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto px-4 sm:px-0">
              Desenvolvido com as mais avançadas tecnologias de IA para oferecer uma experiência única em gestão financeira
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-4">Conversação Natural</h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Converse naturalmente com nossa IA. Ela entende contexto, gírias e diferentes formas de expressar gastos.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/5 border-secondary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Multimodal</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Texto, voz, foto ou até mesmo emoji. Nossa IA processa qualquer tipo de entrada de forma inteligente.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Analytics Avançado</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gráficos interativos, previsões e insights personalizados baseados em machine learning.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/5 border-secondary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Segurança Total</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Seus dados financeiros protegidos com criptografia de ponta e conformidade LGPD.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Insights Preditivos</h3>
                <p className="text-muted-foreground leading-relaxed">
                  IA que aprende seus padrões e oferece recomendações personalizadas para otimizar suas finanças.
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-card to-secondary/5 border-secondary/20">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-2xl mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Suporte 24/7</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Nossa IA está sempre disponível para esclarecer dúvidas e ajudar com suas finanças.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12">
            Confiado por <span className="text-primary">+5.000</span> Brasileiros
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-primary/10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Maria Silva</h4>
                  <p className="text-sm text-muted-foreground">Empresária, São Paulo</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "Revolucionou como controlo meus gastos. Simplesmente falo no WhatsApp e pronto!"
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-secondary/10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">João Santos</h4>
                  <p className="text-sm text-muted-foreground">Desenvolvedor, Rio de Janeiro</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "A IA é impressionante. Categoriza tudo automaticamente e me dá insights valiosos."
              </p>
            </div>
            
            <div className="bg-card p-8 rounded-2xl shadow-lg border border-primary/10">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full mr-4"></div>
                <div>
                  <h4 className="font-bold">Ana Costa</h4>
                  <p className="text-sm text-muted-foreground">Estudante, Belo Horizonte</p>
                </div>
              </div>
              <p className="text-muted-foreground italic">
                "Finalmente consegui organizar minha vida financeira de forma simples e eficiente."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="signup" className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">
            Comece Sua Jornada
            <br />
            <span className="text-white/90">Financeira Hoje</span>
          </h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
            Junte-se a milhares de brasileiros que já transformaram suas finanças com nossa IA
          </p>
          
          <div className="max-w-2xl mx-auto text-center">
            <Button 
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-xl md:text-2xl px-8 sm:px-16 py-6 sm:py-8 bg-white text-primary hover:bg-white/90 shadow-2xl group font-bold rounded-2xl border-4 border-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              asChild
            >
              <Link to="/dashboard">
                <Sparkles className="w-6 h-6 mr-3" />
                Experimente o Knumbers gratuitamente
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            <p className="text-white/90 mt-6 text-lg font-medium">
              💜 Pare de perder tempo com planilhas complicadas. 
              <br className="hidden sm:block" />
              Sua vida financeira organizada está a um clique de distância!
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <span className="text-2xl font-bold">Knumbers</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                A revolução da gestão financeira pessoal com inteligência artificial. 
                Simples, seguro e eficiente.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Produto</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Como Funciona</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Empresa</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">Suporte</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 mb-4 md:mb-0">
              &copy; 2024 Knumbers. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Termos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

      <SignupFlow open={signupOpen} onOpenChange={setSignupOpen} />
    </div>
  );
};

export default Landing;