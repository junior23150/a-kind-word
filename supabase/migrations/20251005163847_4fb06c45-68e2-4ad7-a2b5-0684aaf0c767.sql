-- Adicionar coluna payment_method na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN payment_method TEXT;

-- Adicionar índice para melhor performance em consultas
CREATE INDEX idx_transactions_payment_method ON public.transactions(payment_method);