-- Create categories table (v2 - ensuring it gets applied)
DO $$ 
BEGIN
    -- Check if categories table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'categories') THEN
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

        -- Add trigger for updated_at
        CREATE TRIGGER update_categories_updated_at
          BEFORE UPDATE ON public.categories
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Create or replace function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user(_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Insert default categories for income (receitas) - Lista completa
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
  -- Trabalho e Renda Principal
  (_user_id, 'Salário', 'income', '#10b981', 'briefcase', true),
  (_user_id, 'Freelance', 'income', '#3b82f6', 'laptop', true),
  (_user_id, 'Consultoria', 'income', '#8b5cf6', 'users', true),
  (_user_id, 'Comissões', 'income', '#f59e0b', 'percent', true),
  (_user_id, 'Horas Extras', 'income', '#06b6d4', 'clock', true),
  (_user_id, '13º Salário', 'income', '#84cc16', 'gift', true),
  (_user_id, 'Férias', 'income', '#22c55e', 'sun', true),
  (_user_id, 'PLR/Bônus', 'income', '#eab308', 'award', true),

  -- Investimentos e Rendimentos
  (_user_id, 'Dividendos', 'income', '#8b5cf6', 'trending-up', true),
  (_user_id, 'Juros/Rendimentos', 'income', '#14b8a6', 'piggy-bank', true),
  (_user_id, 'Venda de Investimentos', 'income', '#a855f7', 'bar-chart', true),
  (_user_id, 'Criptomoedas', 'income', '#d946ef', 'coins', true),

  -- Negócios e Vendas
  (_user_id, 'Vendas de Produtos', 'income', '#f59e0b', 'shopping-bag', true),
  (_user_id, 'Prestação de Serviços', 'income', '#0ea5e9', 'wrench', true),
  (_user_id, 'Royalties', 'income', '#ec4899', 'crown', true),

  -- Patrimônio e Aluguéis
  (_user_id, 'Aluguel Recebido', 'income', '#06b6d4', 'home', true),
  (_user_id, 'Venda de Bens', 'income', '#f43f5e', 'tag', true),

  -- Outros Rendimentos
  (_user_id, 'Pensão/Aposentadoria', 'income', '#6b7280', 'heart-handshake', true),
  (_user_id, 'Auxílio/Benefício', 'income', '#84cc16', 'shield-check', true),
  (_user_id, 'Reembolsos', 'income', '#22c55e', 'rotate-ccw', true),
  (_user_id, 'Prêmios/Sorteios', 'income', '#f59e0b', 'trophy', true),
  (_user_id, 'Outros Rendimentos', 'income', '#6b7280', 'plus-circle', true)
  ON CONFLICT (user_id, name, type) DO NOTHING;

  -- Insert default categories for expenses (despesas) - Lista completa
  INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
  -- Moradia
  (_user_id, 'Aluguel/Financiamento', 'expense', '#8b5cf6', 'home', true),
  (_user_id, 'Condomínio', 'expense', '#6366f1', 'building', true),
  (_user_id, 'IPTU', 'expense', '#7c3aed', 'file-text', true),
  (_user_id, 'Manutenção Casa', 'expense', '#a855f7', 'hammer', true),
  (_user_id, 'Móveis/Decoração', 'expense', '#c084fc', 'sofa', true),

  -- Utilidades e Serviços
  (_user_id, 'Energia Elétrica', 'expense', '#eab308', 'zap', true),
  (_user_id, 'Água/Esgoto', 'expense', '#06b6d4', 'droplets', true),
  (_user_id, 'Gás', 'expense', '#f97316', 'flame', true),
  (_user_id, 'Internet/TV', 'expense', '#3b82f6', 'wifi', true),
  (_user_id, 'Telefone', 'expense', '#0ea5e9', 'phone', true),

  -- Alimentação
  (_user_id, 'Supermercado', 'expense', '#ef4444', 'shopping-cart', true),
  (_user_id, 'Restaurantes', 'expense', '#f43f5e', 'utensils', true),
  (_user_id, 'Delivery/Lanches', 'expense', '#ec4899', 'truck', true),
  (_user_id, 'Padaria/Açougue', 'expense', '#dc2626', 'utensils', true),

  -- Transporte
  (_user_id, 'Combustível', 'expense', '#f97316', 'fuel', true),
  (_user_id, 'Transporte Público', 'expense', '#0ea5e9', 'bus', true),
  (_user_id, 'Uber/Taxi', 'expense', '#06b6d4', 'car', true),
  (_user_id, 'Manutenção Veículo', 'expense', '#8b5cf6', 'wrench', true),
  (_user_id, 'Seguro Veículo', 'expense', '#6366f1', 'shield', true),
  (_user_id, 'IPVA/Licenciamento', 'expense', '#7c3aed', 'clipboard-check', true),
  (_user_id, 'Estacionamento', 'expense', '#a855f7', 'car', true),

  -- Saúde
  (_user_id, 'Plano de Saúde', 'expense', '#ec4899', 'heart', true),
  (_user_id, 'Medicamentos', 'expense', '#f43f5e', 'pill', true),
  (_user_id, 'Consultas Médicas', 'expense', '#dc2626', 'stethoscope', true),
  (_user_id, 'Exames', 'expense', '#be185d', 'activity', true),
  (_user_id, 'Dentista', 'expense', '#db2777', 'smile', true),
  (_user_id, 'Academia/Esportes', 'expense', '#e11d48', 'dumbbell', true),

  -- Educação
  (_user_id, 'Mensalidade Escolar', 'expense', '#3b82f6', 'graduation-cap', true),
  (_user_id, 'Cursos/Capacitação', 'expense', '#2563eb', 'book-open', true),
  (_user_id, 'Livros/Material', 'expense', '#1d4ed8', 'book', true),

  -- Lazer e Entretenimento
  (_user_id, 'Cinema/Teatro', 'expense', '#10b981', 'film', true),
  (_user_id, 'Streaming/Assinaturas', 'expense', '#059669', 'play-circle', true),
  (_user_id, 'Viagens', 'expense', '#047857', 'plane', true),
  (_user_id, 'Hobbies', 'expense', '#065f46', 'palette', true),
  (_user_id, 'Festas/Eventos', 'expense', '#14b8a6', 'smile', true),

  -- Vestuário e Cuidados Pessoais
  (_user_id, 'Roupas/Calçados', 'expense', '#f59e0b', 'shirt', true),
  (_user_id, 'Cabeleireiro/Estética', 'expense', '#d97706', 'scissors', true),
  (_user_id, 'Produtos de Higiene', 'expense', '#b45309', 'heart', true),

  -- Investimentos e Poupança
  (_user_id, 'Poupança', 'expense', '#8b5cf6', 'piggy-bank', true),
  (_user_id, 'Investimentos', 'expense', '#7c3aed', 'trending-up', true),
  (_user_id, 'Previdência Privada', 'expense', '#6d28d9', 'shield-check', true),

  -- Impostos e Taxas
  (_user_id, 'Imposto de Renda', 'expense', '#6b7280', 'receipt', true),
  (_user_id, 'Taxas Bancárias', 'expense', '#64748b', 'credit-card', true),
  (_user_id, 'Cartório/Documentos', 'expense', '#475569', 'file-text', true),

  -- Empréstimos e Financiamentos
  (_user_id, 'Cartão de Crédito', 'expense', '#ef4444', 'credit-card', true),
  (_user_id, 'Empréstimos', 'expense', '#dc2626', 'banknote', true),
  (_user_id, 'Financiamentos', 'expense', '#b91c1c', 'calculator', true),

  -- Família e Pets
  (_user_id, 'Cuidados com Pets', 'expense', '#22c55e', 'heart', true),
  (_user_id, 'Presentes', 'expense', '#16a34a', 'gift', true),
  (_user_id, 'Pensão Alimentícia', 'expense', '#15803d', 'users', true),

  -- Outros
  (_user_id, 'Doações', 'expense', '#84cc16', 'heart-handshake', true),
  (_user_id, 'Multas', 'expense', '#ef4444', 'alert-triangle', true),
  (_user_id, 'Outros Gastos', 'expense', '#6b7280', 'more-horizontal', true)
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update or create the handle_new_user function to include default categories
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile first
  INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'phone_number',
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'personal'),
    COALESCE(NEW.raw_user_meta_data->>'plan_type', 'personal')
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Create default categories for the new user
  PERFORM public.create_default_categories_for_user(NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure trigger exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END $$;

-- Create default categories for existing users who don't have any
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN 
        SELECT id FROM auth.users 
        WHERE id NOT IN (SELECT DISTINCT user_id FROM public.categories WHERE user_id IS NOT NULL)
    LOOP
        PERFORM public.create_default_categories_for_user(user_record.id);
    END LOOP;
END $$;
