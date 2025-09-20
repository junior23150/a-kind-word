import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface PlanSelectionStepProps {
  selectedPlan: string;
  onPlanSelect: (plan: string) => void;
}

const plans = [
  {
    id: 'personal',
    name: 'Plano Pessoal',
    price: 'R$ 19,90/mês',
    description: 'Para controle das suas finanças pessoais',
    features: [
      'Controle de gastos pessoais',
      'Metas de economia',
      'Relatórios financeiros',
      'Integração com WhatsApp',
      'Dashboard personalizado'
    ]
  },
  {
    id: 'business',
    name: 'Plano Empresarial',
    price: 'R$ 49,90/mês',
    description: 'Para empresas e empreendedores',
    features: [
      'Tudo do plano pessoal',
      'Controle financeiro empresarial',
      'Gestão de múltiplas contas',
      'Relatórios avançados',
      'Suporte prioritário'
    ],
    popular: true
  }
];

export function PlanSelectionStep({ selectedPlan, onPlanSelect }: PlanSelectionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold">Escolha seu plano</h3>
        <p className="text-muted-foreground">
          Selecione o plano que melhor atende às suas necessidades
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <Card 
            key={plan.id}
            className={`relative cursor-pointer transition-all hover:shadow-lg ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-knumbers-green border-knumbers-green' 
                : 'hover:border-knumbers-green/50'
            }`}
            onClick={() => onPlanSelect(plan.id)}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-knumbers-green text-white px-3 py-1 rounded-full text-sm font-medium">
                  Mais Popular
                </span>
              </div>
            )}
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold text-knumbers-green">{plan.price}</div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-knumbers-green flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                variant={selectedPlan === plan.id ? "default" : "outline"}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlanSelect(plan.id);
                }}
              >
                {selectedPlan === plan.id ? 'Selecionado' : 'Selecionar'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}