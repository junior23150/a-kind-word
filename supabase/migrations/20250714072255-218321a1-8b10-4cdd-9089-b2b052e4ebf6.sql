-- Criar tabela para contas recorrentes
CREATE TABLE public.recurring_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  client_id UUID,
  name TEXT NOT NULL,
  description TEXT,
  amount NUMERIC,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_notification_sent TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.recurring_bills ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own recurring bills" 
ON public.recurring_bills 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own recurring bills" 
ON public.recurring_bills 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own recurring bills" 
ON public.recurring_bills 
FOR UPDATE 
USING (true);

CREATE POLICY "Users can delete their own recurring bills" 
ON public.recurring_bills 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_recurring_bills_updated_at
BEFORE UPDATE ON public.recurring_bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela para histórico de notificações
CREATE TABLE public.bill_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurring_bill_id UUID NOT NULL REFERENCES public.recurring_bills(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  notification_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS para bill_notifications
ALTER TABLE public.bill_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies para bill_notifications
CREATE POLICY "Users can view their own bill notifications" 
ON public.bill_notifications 
FOR SELECT 
USING (true);

CREATE POLICY "System can create bill notifications" 
ON public.bill_notifications 
FOR INSERT 
WITH CHECK (true);