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

-- Insert default categories for income (receitas)
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
-- Using a placeholder UUID that will be replaced when users sign up
('00000000-0000-0000-0000-000000000000', 'Salário', 'income', '#10b981', 'briefcase', true),
('00000000-0000-0000-0000-000000000000', 'Freelance', 'income', '#3b82f6', 'laptop', true),
('00000000-0000-0000-0000-000000000000', 'Investimentos', 'income', '#8b5cf6', 'trending-up', true),
('00000000-0000-0000-0000-000000000000', 'Vendas', 'income', '#f59e0b', 'shopping-bag', true),
('00000000-0000-0000-0000-000000000000', 'Aluguel Recebido', 'income', '#06b6d4', 'home', true),
('00000000-0000-0000-0000-000000000000', 'Outros Rendimentos', 'income', '#84cc16', 'plus-circle', true);

-- Insert default categories for expenses (despesas)  
INSERT INTO public.categories (user_id, name, type, color, icon, is_default) VALUES
('00000000-0000-0000-0000-000000000000', 'Alimentação', 'expense', '#ef4444', 'utensils', true),
('00000000-0000-0000-0000-000000000000', 'Transporte', 'expense', '#f97316', 'car', true),
('00000000-0000-0000-0000-000000000000', 'Moradia', 'expense', '#8b5cf6', 'home', true),
('00000000-0000-0000-0000-000000000000', 'Saúde', 'expense', '#ec4899', 'heart', true),
('00000000-0000-0000-0000-000000000000', 'Educação', 'expense', '#3b82f6', 'graduation-cap', true),
('00000000-0000-0000-0000-000000000000', 'Lazer', 'expense', '#10b981', 'smile', true),
('00000000-0000-0000-0000-000000000000', 'Compras', 'expense', '#f59e0b', 'shopping-cart', true),
('00000000-0000-0000-0000-000000000000', 'Contas', 'expense', '#6b7280', 'file-text', true),
('00000000-0000-0000-0000-000000000000', 'Investimentos', 'expense', '#8b5cf6', 'trending-up', true),
('00000000-0000-0000-0000-000000000000', 'Outros', 'expense', '#6b7280', 'more-horizontal', true);

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
