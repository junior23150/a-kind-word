import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface FinalStepProps {
  onSignup: () => void;
  isLoading: boolean;
}

export const FinalStep = ({ onSignup, isLoading }: FinalStepProps) => {
  return (
    <div className="text-center space-y-3 sm:space-y-6 px-2 sm:px-0">
      <div className="mb-2 sm:mb-6">
        <div className="w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto flex items-center justify-center">
          <Crown className="w-6 h-6 sm:w-10 sm:h-10 text-white" />
        </div>
      </div>
      
      <div className="space-y-1 sm:space-y-4">
        <h2 className="text-xl sm:text-3xl md:text-4xl font-bold">
          Bem-vindo ao Knumbers
        </h2>
        <p className="text-xs sm:text-base text-muted-foreground px-2">
          Sua jornada financeira começa agora
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl p-3 sm:p-6">
        <div className="space-y-2 sm:space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-sm sm:text-lg font-semibold text-primary">5 Dias Gratuitos</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Teste todas as funcionalidades sem compromisso
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span>Controle total de gastos</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span>Relatórios detalhados</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span>IA financeira</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-3 h-3 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
              <span>Suporte especializado</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-4">
        <Button 
          onClick={onSignup}
          disabled={isLoading}
          className="w-full h-10 sm:h-14 text-xs sm:text-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 font-semibold"
        >
          {isLoading ? "Cadastrando..." : "Começar Período Gratuito"}
        </Button>
        
        <Button variant="outline" className="w-full h-8 sm:h-12 text-xs sm:text-sm">
          Ver Planos
        </Button>
      </div>

      <p className="text-xs text-muted-foreground px-2 pb-2">
        Após o período, planos a partir de R$ 9,90/mês
      </p>
    </div>
  );
};