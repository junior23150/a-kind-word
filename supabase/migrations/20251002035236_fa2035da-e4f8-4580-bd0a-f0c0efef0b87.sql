-- Fix recurrence_type constraint to accept Portuguese values
ALTER TABLE public.budget_items 
DROP CONSTRAINT IF EXISTS budget_items_recurrence_type_check;

ALTER TABLE public.budget_items
ADD CONSTRAINT budget_items_recurrence_type_check 
CHECK (recurrence_type IN ('mensal', 'trimestral', 'semestral', 'anual', 'parcelada'));