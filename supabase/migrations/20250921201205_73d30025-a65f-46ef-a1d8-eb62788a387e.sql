-- Primeiro, remover a constraint NOT NULL do user_id
ALTER TABLE public.transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- Depois adicionar a coluna whatsapp_user_id
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS whatsapp_user_id uuid;