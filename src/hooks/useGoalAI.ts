import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export interface AICreationSuggestion {
  valor_mensal_sugerido: number;
  prazo_estimado_meses: number;
  viabilidade: 'alta' | 'média' | 'baixa';
  conselhos: string[];
  alternativas: Array<{
    valor_mensal: number;
    prazo_meses: number;
    descricao: string;
  }>;
}

export interface AIGoalInsights {
  status: 'no_prazo' | 'atrasado' | 'adiantado';
  valor_mensal_necessario: number;
  economia_sugerida: number;
  insights: string[];
  motivacao: string;
}

export function useGoalAI() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getCreationAdvice = async (goal: {
    name: string;
    target_amount: number;
    current_amount?: number;
    target_date?: string;
  }): Promise<AICreationSuggestion | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('goals-ai-advisor', {
        body: { 
          goal: {
            ...goal,
            current_amount: goal.current_amount || 0
          },
          type: 'creation' 
        }
      });

      if (error) throw error;

      return data as AICreationSuggestion;
    } catch (error) {
      console.error('Error getting AI advice:', error);
      toast({
        title: 'Erro ao buscar sugestões',
        description: 'Não foi possível conectar com o assistente de IA.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getGoalInsights = async (goal: {
    id: string;
    name: string;
    target_amount: number;
    current_amount: number;
    target_date?: string;
  }): Promise<AIGoalInsights | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('goals-ai-advisor', {
        body: { goal, type: 'insights' }
      });

      if (error) throw error;

      return data as AIGoalInsights;
    } catch (error) {
      console.error('Error getting AI insights:', error);
      toast({
        title: 'Erro ao buscar insights',
        description: 'Não foi possível conectar com o assistente de IA.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { getCreationAdvice, getGoalInsights, loading };
}
