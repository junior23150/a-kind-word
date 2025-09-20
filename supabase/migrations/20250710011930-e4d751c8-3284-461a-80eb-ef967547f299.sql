-- Criar tabela de usuários do WhatsApp
CREATE TABLE public.whatsapp_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de transações financeiras
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.whatsapp_users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'whatsapp',
  original_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de conversas do WhatsApp
CREATE TABLE public.whatsapp_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.whatsapp_users(id) ON DELETE CASCADE,
  message_id TEXT,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'audio', 'image')),
  content TEXT,
  is_from_user BOOLEAN NOT NULL DEFAULT true,
  processed BOOLEAN NOT NULL DEFAULT false,
  ai_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);
CREATE INDEX idx_conversations_user_id ON public.whatsapp_conversations(user_id);
CREATE INDEX idx_conversations_created_at ON public.whatsapp_conversations(created_at);

-- Habilitar RLS
ALTER TABLE public.whatsapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_conversations ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS (acesso aberto para simplificar - ajustar depois conforme autenticação)
CREATE POLICY "Allow all operations on whatsapp_users" ON public.whatsapp_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on transactions" ON public.transactions FOR ALL USING (true);
CREATE POLICY "Allow all operations on conversations" ON public.whatsapp_conversations FOR ALL USING (true);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_whatsapp_users_updated_at
  BEFORE UPDATE ON public.whatsapp_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();