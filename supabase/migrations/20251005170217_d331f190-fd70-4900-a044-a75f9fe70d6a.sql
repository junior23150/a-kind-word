-- Criar tabela de objetivos financeiros
CREATE TABLE public.savings_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_amount NUMERIC NOT NULL,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  target_date DATE,
  color TEXT NOT NULL DEFAULT '#22c55e',
  icon TEXT NOT NULL DEFAULT 'target',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Users can view their own goals"
ON public.savings_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.savings_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.savings_goals FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.savings_goals FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_savings_goals_updated_at
BEFORE UPDATE ON public.savings_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_savings_goals_user_id ON public.savings_goals(user_id);
CREATE INDEX idx_savings_goals_is_active ON public.savings_goals(is_active);