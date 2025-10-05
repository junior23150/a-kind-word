import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useGoalAI, AIGoalInsights } from '@/hooks/useGoalAI';
import { cn } from '@/lib/utils';

interface GoalAIInsightsProps {
  goal: {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
  };
}

export function GoalAIInsights({ goal }: GoalAIInsightsProps) {
  const [expanded, setExpanded] = useState(false);
  const [insights, setInsights] = useState<AIGoalInsights | null>(null);
  const { getGoalInsights, loading } = useGoalAI();

  const handleToggle = async () => {
    if (!expanded && !insights) {
      const result = await getGoalInsights(goal);
      if (result) {
        setInsights(result);
      }
    }
    setExpanded(!expanded);
  };

  const statusColors = {
    'no_prazo': 'text-success border-success/20 bg-success/5',
    'adiantado': 'text-primary border-primary/20 bg-primary/5',
    'atrasado': 'text-destructive border-destructive/20 bg-destructive/5'
  };

  const statusLabels = {
    'no_prazo': 'No Prazo',
    'adiantado': 'Adiantado',
    'atrasado': 'Atenção Necessária'
  };

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleToggle}
        className="w-full justify-between text-sm hover:bg-accent/50"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          Insights da IA
        </span>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : expanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </Button>

      {expanded && insights && (
        <Card className="mt-2 p-4 space-y-4 border-accent/50 bg-accent/20">
          {/* Status Badge */}
          <div className={cn(
            "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
            statusColors[insights.status]
          )}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {statusLabels[insights.status]}
          </div>

          {/* Financial Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Guardar por mês</p>
              <p className="text-lg font-semibold text-primary">
                R$ {insights.economia_sugerida.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Necessário/mês</p>
              <p className="text-lg font-semibold">
                R$ {insights.valor_mensal_necessario.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Análise:</p>
            <ul className="space-y-2">
              {insights.insights.map((insight, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-primary">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Motivation */}
          <div className="pt-3 border-t border-border/50">
            <p className="text-sm text-primary/80 italic">
              {insights.motivacao}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
