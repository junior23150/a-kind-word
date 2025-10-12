-- Add "Vence hoje" status and create proper status management

-- First, update existing transactions to ensure they have valid status
UPDATE transactions 
SET status = CASE 
  WHEN status IS NULL OR status = '' THEN
    CASE 
      WHEN date < CURRENT_DATE THEN 'Em Atraso'
      WHEN date = CURRENT_DATE THEN 'Vence hoje'
      ELSE 'Em Aberto'
    END
  ELSE status
END
WHERE status NOT IN ('Paga', 'Recebido');

-- Update transactions that should be "Em Atraso"
UPDATE transactions 
SET status = 'Em Atraso'
WHERE status = 'Em Aberto' 
AND date < CURRENT_DATE 
AND status NOT IN ('Paga', 'Recebido');

-- Update transactions that should be "Vence hoje"
UPDATE transactions 
SET status = 'Vence hoje'
WHERE status = 'Em Aberto' 
AND date = CURRENT_DATE 
AND status NOT IN ('Paga', 'Recebido');

-- Create function to set initial transaction status
CREATE OR REPLACE FUNCTION public.set_initial_transaction_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only calculate status if not already set to Paga or Recebido
  IF NEW.status IS NULL OR NEW.status NOT IN ('Paga', 'Recebido') THEN
    IF NEW.date < CURRENT_DATE THEN
      NEW.status := 'Em Atraso';
    ELSIF NEW.date = CURRENT_DATE THEN
      NEW.status := 'Vence hoje';
    ELSE
      NEW.status := 'Em Aberto';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to set initial status
DROP TRIGGER IF EXISTS trigger_set_initial_status ON public.transactions;
CREATE TRIGGER trigger_set_initial_status
BEFORE INSERT OR UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.set_initial_transaction_status();

-- Create function to update transaction statuses daily
CREATE OR REPLACE FUNCTION public.update_transaction_statuses()
RETURNS json AS $$
BEGIN
  -- Update transactions that should be "Em Atraso"
  UPDATE public.transactions 
  SET status = 'Em Atraso'
  WHERE status NOT IN ('Paga', 'Recebido')
  AND date < CURRENT_DATE
  AND status != 'Em Atraso';
  
  -- Update transactions that should be "Vence hoje"
  UPDATE public.transactions 
  SET status = 'Vence hoje'
  WHERE status NOT IN ('Paga', 'Recebido')
  AND date = CURRENT_DATE
  AND status != 'Vence hoje';
  
  -- Update transactions that should be "Em Aberto"
  UPDATE public.transactions 
  SET status = 'Em Aberto'
  WHERE status NOT IN ('Paga', 'Recebido')
  AND date > CURRENT_DATE
  AND status != 'Em Aberto';
  
  RETURN json_build_object(
    'success', true,
    'updated_at', now()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;