-- 1. Remover todas as constraints existentes
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- 2. Adicionar a nova coluna whatsapp_user_id
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS whatsapp_user_id uuid;

-- 3. Atualizar a tabela para mover os IDs que não existem em profiles para whatsapp_user_id
UPDATE public.transactions 
SET whatsapp_user_id = user_id
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 4. Limpar user_id para registros que foram movidos para whatsapp_user_id  
UPDATE public.transactions 
SET user_id = NULL
WHERE whatsapp_user_id IS NOT NULL;