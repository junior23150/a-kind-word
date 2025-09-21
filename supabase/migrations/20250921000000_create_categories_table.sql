-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT DEFAULT 'circle',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, name, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Users can view their own categories" 
ON public.categories 
FOR SELECT 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update their own categories" 
ON public.categories 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can delete their own categories" 
ON public.categories 
FOR DELETE 
USING (auth.uid() = user_id OR public.is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories for income (receitas) - Lista completa
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
-- Using a placeholder UUID that will be replaced when users sign up
-- Trabalho e Renda Principal
('00000000-0000-0000-0000-000000000000', 'Salário', 'income', '#10b981', 'briefcase', true),
('00000000-0000-0000-0000-000000000000', 'Freelance', 'income', '#3b82f6', 'laptop', true),
('00000000-0000-0000-0000-000000000000', 'Consultoria', 'income', '#8b5cf6', 'users', true),
('00000000-0000-0000-0000-000000000000', 'Comissões', 'income', '#f59e0b', 'percent', true),
('00000000-0000-0000-0000-000000000000', 'Horas Extras', 'income', '#06b6d4', 'clock', true),
('00000000-0000-0000-0000-000000000000', '13º Salário', 'income', '#84cc16', 'gift', true),
('00000000-0000-0000-0000-000000000000', 'Férias', 'income', '#22c55e', 'sun', true),
('00000000-0000-0000-0000-000000000000', 'PLR/Bônus', 'income', '#eab308', 'award', true),

-- Investimentos e Rendimentos
('00000000-0000-0000-0000-000000000000', 'Dividendos', 'income', '#8b5cf6', 'trending-up', true),
('00000000-0000-0000-0000-000000000000', 'Juros/Rendimentos', 'income', '#14b8a6', 'piggy-bank', true),
('00000000-0000-0000-0000-000000000000', 'Venda de Investimentos', 'income', '#a855f7', 'bar-chart', true),
('00000000-0000-0000-0000-000000000000', 'Criptomoedas', 'income', '#d946ef', 'coins', true),

-- Negócios e Vendas
('00000000-0000-0000-0000-000000000000', 'Vendas de Produtos', 'income', '#f59e0b', 'shopping-bag', true),
('00000000-0000-0000-0000-000000000000', 'Prestação de Serviços', 'income', '#0ea5e9', 'wrench', true),
('00000000-0000-0000-0000-000000000000', 'Royalties', 'income', '#ec4899', 'crown', true),

-- Patrimônio e Aluguéis
('00000000-0000-0000-0000-000000000000', 'Aluguel Recebido', 'income', '#06b6d4', 'home', true),
('00000000-0000-0000-0000-000000000000', 'Venda de Bens', 'income', '#f43f5e', 'tag', true),

-- Outros Rendimentos
('00000000-0000-0000-0000-000000000000', 'Pensão/Aposentadoria', 'income', '#6b7280', 'heart-handshake', true),
('00000000-0000-0000-0000-000000000000', 'Auxílio/Benefício', 'income', '#84cc16', 'shield-check', true),
('00000000-0000-0000-0000-000000000000', 'Reembolsos', 'income', '#22c55e', 'rotate-ccw', true),
('00000000-0000-0000-0000-000000000000', 'Prêmios/Sorteios', 'income', '#f59e0b', 'trophy', true),
('00000000-0000-0000-0000-000000000000', 'Outros Rendimentos', 'income', '#6b7280', 'plus-circle', true);

-- Insert default categories for expenses (despesas) - Lista completa
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
-- Moradia
('00000000-0000-0000-0000-000000000000', 'Aluguel/Financiamento', 'expense', '#8b5cf6', 'home', true),
('00000000-0000-0000-0000-000000000000', 'Condomínio', 'expense', '#6366f1', 'building', true),
('00000000-0000-0000-0000-000000000000', 'IPTU', 'expense', '#7c3aed', 'file-text', true),
('00000000-0000-0000-0000-000000000000', 'Manutenção Casa', 'expense', '#a855f7', 'hammer', true),
('00000000-0000-0000-0000-000000000000', 'Móveis/Decoração', 'expense', '#c084fc', 'sofa', true),

-- Utilidades e Serviços
('00000000-0000-0000-0000-000000000000', 'Energia Elétrica', 'expense', '#eab308', 'zap', true),
('00000000-0000-0000-0000-000000000000', 'Água/Esgoto', 'expense', '#06b6d4', 'droplets', true),
('00000000-0000-0000-0000-000000000000', 'Gás', 'expense', '#f97316', 'flame', true),
('00000000-0000-0000-0000-000000000000', 'Internet/TV', 'expense', '#3b82f6', 'wifi', true),
('00000000-0000-0000-0000-000000000000', 'Telefone', 'expense', '#0ea5e9', 'phone', true),

-- Alimentação
('00000000-0000-0000-0000-000000000000', 'Supermercado', 'expense', '#ef4444', 'shopping-cart', true),
('00000000-0000-0000-0000-000000000000', 'Restaurantes', 'expense', '#f43f5e', 'utensils', true),
('00000000-0000-0000-0000-000000000000', 'Delivery/Lanches', 'expense', '#ec4899', 'truck', true),
('00000000-0000-0000-0000-000000000000', 'Padaria/Açougue', 'expense', '#dc2626', 'utensils', true),

-- Transporte
('00000000-0000-0000-0000-000000000000', 'Combustível', 'expense', '#f97316', 'fuel', true),
('00000000-0000-0000-0000-000000000000', 'Transporte Público', 'expense', '#0ea5e9', 'bus', true),
('00000000-0000-0000-0000-000000000000', 'Uber/Taxi', 'expense', '#06b6d4', 'car', true),
('00000000-0000-0000-0000-000000000000', 'Manutenção Veículo', 'expense', '#8b5cf6', 'wrench', true),
('00000000-0000-0000-0000-000000000000', 'Seguro Veículo', 'expense', '#6366f1', 'shield', true),
('00000000-0000-0000-0000-000000000000', 'IPVA/Licenciamento', 'expense', '#7c3aed', 'clipboard-check', true),
('00000000-0000-0000-0000-000000000000', 'Estacionamento', 'expense', '#a855f7', 'car', true),

-- Saúde
('00000000-0000-0000-0000-000000000000', 'Plano de Saúde', 'expense', '#ec4899', 'heart', true),
('00000000-0000-0000-0000-000000000000', 'Medicamentos', 'expense', '#f43f5e', 'pill', true),
('00000000-0000-0000-0000-000000000000', 'Consultas Médicas', 'expense', '#dc2626', 'stethoscope', true),
('00000000-0000-0000-0000-000000000000', 'Exames', 'expense', '#be185d', 'activity', true),
('00000000-0000-0000-0000-000000000000', 'Dentista', 'expense', '#db2777', 'smile', true),
('00000000-0000-0000-0000-000000000000', 'Academia/Esportes', 'expense', '#e11d48', 'dumbbell', true),

-- Educação
('00000000-0000-0000-0000-000000000000', 'Mensalidade Escolar', 'expense', '#3b82f6', 'graduation-cap', true),
('00000000-0000-0000-0000-000000000000', 'Cursos/Capacitação', 'expense', '#2563eb', 'book-open', true),
('00000000-0000-0000-0000-000000000000', 'Livros/Material', 'expense', '#1d4ed8', 'book', true),

-- Lazer e Entretenimento
('00000000-0000-0000-0000-000000000000', 'Cinema/Teatro', 'expense', '#10b981', 'film', true),
('00000000-0000-0000-0000-000000000000', 'Streaming/Assinaturas', 'expense', '#059669', 'play-circle', true),
('00000000-0000-0000-0000-000000000000', 'Viagens', 'expense', '#047857', 'plane', true),
('00000000-0000-0000-0000-000000000000', 'Hobbies', 'expense', '#065f46', 'palette', true),
('00000000-0000-0000-0000-000000000000', 'Festas/Eventos', 'expense', '#14b8a6', 'smile', true),

-- Vestuário e Cuidados Pessoais
('00000000-0000-0000-0000-000000000000', 'Roupas/Calçados', 'expense', '#f59e0b', 'shirt', true),
('00000000-0000-0000-0000-000000000000', 'Cabeleireiro/Estética', 'expense', '#d97706', 'scissors', true),
('00000000-0000-0000-0000-000000000000', 'Produtos de Higiene', 'expense', '#b45309', 'heart', true),

-- Investimentos e Poupança
('00000000-0000-0000-0000-000000000000', 'Poupança', 'expense', '#8b5cf6', 'piggy-bank', true),
('00000000-0000-0000-0000-000000000000', 'Investimentos', 'expense', '#7c3aed', 'trending-up', true),
('00000000-0000-0000-0000-000000000000', 'Previdência Privada', 'expense', '#6d28d9', 'shield-check', true),

-- Impostos e Taxas
('00000000-0000-0000-0000-000000000000', 'Imposto de Renda', 'expense', '#6b7280', 'receipt', true),
('00000000-0000-0000-0000-000000000000', 'Taxas Bancárias', 'expense', '#64748b', 'credit-card', true),
('00000000-0000-0000-0000-000000000000', 'Cartório/Documentos', 'expense', '#475569', 'file-text', true),

-- Empréstimos e Financiamentos
('00000000-0000-0000-0000-000000000000', 'Cartão de Crédito', 'expense', '#ef4444', 'credit-card', true),
('00000000-0000-0000-0000-000000000000', 'Empréstimos', 'expense', '#dc2626', 'banknote', true),
('00000000-0000-0000-0000-000000000000', 'Financiamentos', 'expense', '#b91c1c', 'calculator', true),

-- Família e Pets
('00000000-0000-0000-0000-000000000000', 'Cuidados com Pets', 'expense', '#22c55e', 'heart', true),
('00000000-0000-0000-0000-000000000000', 'Presentes', 'expense', '#16a34a', 'gift', true),
('00000000-0000-0000-0000-000000000000', 'Pensão Alimentícia', 'expense', '#15803d', 'users', true),

-- Outros
('00000000-0000-0000-0000-000000000000', 'Doações', 'expense', '#84cc16', 'heart-handshake', true),
('00000000-0000-0000-0000-000000000000', 'Multas', 'expense', '#ef4444', 'alert-triangle', true),
('00000000-0000-0000-0000-000000000000', 'Outros Gastos', 'expense', '#6b7280', 'more-horizontal', true);

-- Create function to copy default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Copy default categories for the new user
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default)
  SELECT _user_id, name, type, color, icon, true
  FROM public.categories 
  WHERE user_id = '00000000-0000-0000-0000-000000000000'
  AND is_default = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the handle_new_user function to include default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'personal'),
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'personal')
  );
  
  -- Create default categories for the new user
  PERFORM public.create_default_categories_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
