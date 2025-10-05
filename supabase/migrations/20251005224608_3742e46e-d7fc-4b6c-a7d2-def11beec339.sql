-- Add new columns to recurring_bills table for installment-based recurrence
ALTER TABLE recurring_bills 
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS total_installments INTEGER,
ADD COLUMN IF NOT EXISTS recurrence_type TEXT DEFAULT 'monthly';

-- Update existing recurring_bills to use created_at as start_date
UPDATE recurring_bills 
SET start_date = created_at::DATE 
WHERE start_date IS NULL;