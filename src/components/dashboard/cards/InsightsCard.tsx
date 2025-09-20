import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, AlertTriangle, TrendingUp, Sparkles } from "lucide-react";

interface InsightsCardProps {
  entradas: number;
  saidas: number;
  saldo: number;
  transactions: any[];
}

interface Insight {
  id: string;
  type: 'success' | 'warning' | 'info' | 'tip';
  icon: 'success' | 'warning' | 'info' | 'tip';
  title: string;
  message: string;
}

export function InsightsCard({ entradas, saidas, saldo, transactions }: InsightsCardProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate insights based on financial data
  const generateInsights = () => {
    const newInsights: Insight[] = [];

    // Saldo analysis
    if (saldo > 0) {
      const savingsRate = (saldo / entradas) * 100;
      if (savingsRate > 20) {
        newInsights.push({
          id: '1',
          type: 'success',
          icon: 'success',
          title: 'Excelente controle!',
          message: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Parabéns pelo ótimo controle financeiro!`
        });
      } else if (savingsRate > 10) {
        newInsights.push({
          id: '1',
          type: 'info',
          icon: 'info',
          title: 'Boa economia',
          message: `Você está economizando ${savingsRate.toFixed(1)}% da sua renda. Considere aumentar para 20% se possível.`
        });
      }
    } else {
      newInsights.push({
        id: '1',
        type: 'warning',
        icon: 'warning',
        title: 'Atenção ao orçamento',
        message: `Seus gastos estão R$ ${Math.abs(saldo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} acima das receitas. Revise seus gastos.`
      });
    }

    // Category analysis
    const categoryTotals: { [key: string]: number } = {};
    transactions
      .filter(t => t.transaction_type === 'despesa' && t.category)
      .forEach(transaction => {
        const category = transaction.category.toLowerCase();
        categoryTotals[category] = (categoryTotals[category] || 0) + Number(transaction.amount);
      });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([,a], [,b]) => b - a);

    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0];
      const percentage = saidas > 0 ? (topAmount / saidas) * 100 : 0;
      
      if (percentage > 40) {
        newInsights.push({
          id: '2',
          type: 'warning',
          icon: 'warning',
          title: 'Categoria dominante',
          message: `${percentage.toFixed(1)}% dos seus gastos são com ${topCategory}. Considere revisar esta categoria.`
        });
      } else if (percentage > 25) {
        newInsights.push({
          id: '2',
          type: 'info',
          icon: 'info',
          title: 'Maior gasto',
          message: `Sua maior categoria de gastos é ${topCategory} (${percentage.toFixed(1)}% do total).`
        });
      }
    }

    // Investment opportunity
    if (saldo > 1000) {
      newInsights.push({
        id: '3',
        type: 'tip',
        icon: 'tip',
        title: 'Oportunidade de investimento',
        message: `Com R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de saldo positivo, considere investir parte deste valor.`
      });
    }

    // If no specific insights, add a general one
    if (newInsights.length === 0) {
      newInsights.push({
        id: '0',
        type: 'info',
        icon: 'info',
        title: 'Continue registrando',
        message: 'Continue registrando suas transações para receber insights personalizados sobre suas finanças.'
      });
    }

    return newInsights;
  };

  useEffect(() => {
    if (transactions.length > 0) {
      setIsGenerating(true);
      setTimeout(() => {
        setInsights(generateInsights());
        setIsGenerating(false);
      }, 1000); // Simulate AI processing time
    }
  }, [entradas, saidas, saldo, transactions]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <TrendingUp className="h-4 w-4 text-knumbers-success" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-knumbers-warning" />;
      case 'tip':
        return <Lightbulb className="h-4 w-4 text-knumbers-purple" />;
      default:
        return <Sparkles className="h-4 w-4 text-knumbers-green" />;
    }
  };

  const getInsightBorderColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-l-knumbers-success';
      case 'warning':
        return 'border-l-knumbers-warning';
      case 'tip':
        return 'border-l-knumbers-purple';
      default:
        return 'border-l-knumbers-green';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Insights da IA
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            setIsGenerating(true);
            setTimeout(() => {
              setInsights(generateInsights());
              setIsGenerating(false);
            }, 1000);
          }}
          disabled={isGenerating}
        >
          {isGenerating ? 'Gerando...' : 'Atualizar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-6">
        {isGenerating ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : insights.length > 0 ? (
          <div className="space-y-4">
            {insights.map((insight) => (
              <div 
                key={insight.id}
                className={`p-4 border-l-4 ${getInsightBorderColor(insight.type)} bg-muted/30 rounded-r-lg`}
              >
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aguardando dados para gerar insights</p>
            <p className="text-sm text-muted-foreground mt-1">
              Registre suas transações para receber análises personalizadas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}