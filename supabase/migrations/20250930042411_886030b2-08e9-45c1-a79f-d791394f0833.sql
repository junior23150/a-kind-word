-- Add status column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Em Aberto';

-- Add comment to explain the status values
COMMENT ON COLUMN public.transactions.status IS 'Status do pagamento: Em Aberto, Paga, Em Atraso';

-- Create index for better query performance on status
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);

-- Create index for status and date combination (for overdue check)
CREATE INDEX IF NOT EXISTS idx_transactions_status_date ON public.transactions(status, date);