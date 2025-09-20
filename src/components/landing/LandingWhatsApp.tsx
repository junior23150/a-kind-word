import { Badge } from "@/components/ui/badge";
import { CheckCircle, Smartphone, Sparkles } from "lucide-react";

export const LandingWhatsApp = () => {
  return (
    <section className="py-16 sm:py-20 px-4 bg-gradient-to-br from-muted/30 to-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div className="space-y-6 sm:space-y-8 order-2 lg:order-1">
            <div>
              <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 text-sm">
                <Smartphone className="w-4 h-4 mr-2" />
                Interface Revolucionária
              </Badge>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
                Simplesmente 
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {" "}Fale{" "}
                </span>
                Seus Gastos
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Esqueça planilhas complicadas. Nossa IA entende linguagem natural e 
                categoriza automaticamente seus gastos, seja por texto, áudio ou foto.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border border-primary/10">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Reconhecimento de Voz</p>
                  <p className="text-sm text-muted-foreground">Fale naturalmente: "gastei 30 reais no almoço"</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border border-secondary/10">
                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold">Análise de Imagens</p>
                  <p className="text-sm text-muted-foreground">Envie foto do cupom fiscal e deixe a IA extrair os dados</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-card rounded-xl border border-primary/10">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Categorização Inteligente</p>
                  <p className="text-sm text-muted-foreground">IA aprende seus padrões e sugere categorias</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative order-1 lg:order-2">
            <div className="bg-gradient-to-br from-[#075E54] to-[#128C7E] rounded-2xl sm:rounded-3xl p-1 shadow-2xl">
              <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden">
                <div className="bg-[#075E54] text-white p-4 sm:p-6 flex items-center space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-base">K</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">Knumbers IA</h3>
                    <p className="text-xs sm:text-sm opacity-90">Sua assistente financeira</p>
                  </div>
                </div>
                
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 min-h-[300px] sm:min-h-[400px] bg-gradient-to-b from-gray-50 to-white">
                  <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm mr-8 sm:mr-12 border-l-4 border-primary">
                    <p className="text-xs sm:text-sm">🎤 "Gastei 50 reais no supermercado"</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-primary to-secondary text-white p-3 sm:p-4 rounded-2xl ml-8 sm:ml-12 shadow-lg">
                    <p className="text-xs sm:text-sm">✅ <strong>Transação registrada!</strong><br/>💰 Despesa: R$ 50,00<br/>🛒 Categoria: Alimentação<br/>📅 Hoje, 14:30</p>
                  </div>
                  
                  <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm mr-8 sm:mr-12 border-l-4 border-secondary">
                    <p className="text-xs sm:text-sm">📊 "Como estão meus gastos este mês?"</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-secondary to-primary text-white p-3 sm:p-4 rounded-2xl ml-8 sm:ml-12 shadow-lg">
                    <p className="text-xs sm:text-sm">📈 <strong>Resumo de Julho:</strong><br/>💸 Total gasto: R$ 1.245,00<br/>🏆 Categoria principal: Alimentação (45%)<br/>💡 Dica: Você gastou 20% menos que junho!</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg animate-bounce">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};