-- Create bank_accounts table
CREATE TABLE public.bank_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  balance NUMERIC NOT NULL DEFAULT 0,
  due_day INTEGER,
  closing_day INTEGER,
  color TEXT NOT NULL DEFAULT '#22c55e',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policies for bank accounts
CREATE POLICY "Users can view their own bank accounts" 
ON public.bank_accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bank accounts" 
ON public.bank_accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bank accounts" 
ON public.bank_accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bank accounts" 
ON public.bank_accounts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create category_goals table
CREATE TABLE public.category_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  goal_amount NUMERIC NOT NULL,
  color TEXT NOT NULL DEFAULT '#ef4444',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category)
);

-- Enable RLS
ALTER TABLE public.category_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for category goals
CREATE POLICY "Users can view their own category goals" 
ON public.category_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category goals" 
ON public.category_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category goals" 
ON public.category_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category goals" 
ON public.category_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for bank_accounts updated_at
CREATE TRIGGER update_bank_accounts_updated_at
BEFORE UPDATE ON public.bank_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for category_goals updated_at
CREATE TRIGGER update_category_goals_updated_at
BEFORE UPDATE ON public.category_goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add foreign key constraint to transactions for bank_account_id
ALTER TABLE public.transactions 
ADD COLUMN bank_account_id UUID REFERENCES public.bank_accounts(id);