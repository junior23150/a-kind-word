-- Create the categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'circle',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to insert default categories for a user
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert default income categories
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default, is_active) VALUES
  (user_uuid, 'Salário', 'income', '#22c55e', 'briefcase', true, true),
  (user_uuid, 'Freelance', 'income', '#3b82f6', 'laptop', true, true),
  (user_uuid, '13º Salário', 'income', '#10b981', 'gift', true, true),
  (user_uuid, 'Férias', 'income', '#06b6d4', 'sun', true, true),
  (user_uuid, 'PLR/Bônus', 'income', '#8b5cf6', 'award', true, true),
  (user_uuid, 'Dividendos', 'income', '#22c55e', 'trending-up', true, true),
  (user_uuid, 'Juros/Rendimentos', 'income', '#eab308', 'coins', true, true),
  (user_uuid, 'Aluguel Recebido', 'income', '#f59e0b', 'home', true, true),
  (user_uuid, 'Vendas', 'income', '#84cc16', 'tag', true, true),
  (user_uuid, 'Reembolsos', 'income', '#14b8a6', 'rotate-ccw', true, true),

  -- Insert default expense categories
  (user_uuid, 'Aluguel/Financiamento', 'expense', '#ef4444', 'home', true, true),
  (user_uuid, 'Supermercado', 'expense', '#f97316', 'shopping-cart', true, true),
  (user_uuid, 'Restaurantes', 'expense', '#f59e0b', 'utensils', true, true),
  (user_uuid, 'Transporte', 'expense', '#eab308', 'car', true, true),
  (user_uuid, 'Combustível', 'expense', '#84cc16', 'fuel', true, true),
  (user_uuid, 'Energia Elétrica', 'expense', '#22c55e', 'zap', true, true),
  (user_uuid, 'Água/Esgoto', 'expense', '#10b981', 'droplets', true, true),
  (user_uuid, 'Internet/TV', 'expense', '#14b8a6', 'wifi', true, true),
  (user_uuid, 'Telefone', 'expense', '#06b6d4', 'phone', true, true),
  (user_uuid, 'Plano de Saúde', 'expense', '#0ea5e9', 'heart', true, true),
  (user_uuid, 'Medicamentos', 'expense', '#3b82f6', 'pill', true, true),
  (user_uuid, 'Academia', 'expense', '#6366f1', 'dumbbell', true, true),
  (user_uuid, 'Educação', 'expense', '#8b5cf6', 'graduation-cap', true, true),
  (user_uuid, 'Lazer', 'expense', '#a855f7', 'smile', true, true),
  (user_uuid, 'Roupas/Calçados', 'expense', '#d946ef', 'shirt', true, true),
  (user_uuid, 'Cabeleireiro', 'expense', '#ec4899', 'scissors', true, true),
  (user_uuid, 'Cartão de Crédito', 'expense', '#f43f5e', 'credit-card', true, true),
  (user_uuid, 'Impostos', 'expense', '#6b7280', 'receipt', true, true),
  (user_uuid, 'Seguros', 'expense', '#64748b', 'shield', true, true),
  (user_uuid, 'Outros', 'expense', '#475569', 'more-horizontal', true, true);
  
END;
$$;