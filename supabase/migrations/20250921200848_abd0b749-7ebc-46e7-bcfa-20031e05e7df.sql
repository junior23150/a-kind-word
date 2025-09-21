-- 1. Primeiro, vamos temporariamente remover todas as constraints da tabela transactions
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- 2. Adicionar coluna whatsapp_user_id na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS whatsapp_user_id uuid;

-- 3. Atualizar transações existentes para mover user_id para whatsapp_user_id quando o user_id não existe na tabela profiles
UPDATE public.transactions 
SET whatsapp_user_id = user_id, user_id = NULL
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 4. Tornar user_id nullable
ALTER TABLE public.transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- 5. Criar o Admin no whatsapp_users
INSERT INTO public.whatsapp_users (id, phone_number, name, client_id, is_registered)
VALUES (
  gen_random_uuid(),
  '+55419999999',
  'Admin User', 
  'ae50af2d-412f-496a-9dac-781744cc78da',
  true
);

-- 6. Inserir o Admin no user_profiles
INSERT INTO public.user_profiles (id, client_id, whatsapp_user_id, email, full_name, subscription_plan)
VALUES (
  gen_random_uuid(),
  'ae50af2d-412f-496a-9dac-781744cc78da',
  (SELECT id FROM public.whatsapp_users WHERE phone_number = '+55419999999' LIMIT 1),
  'aluizio.m.s.jr21@gmail.com',
  'Admin User',
  'business'
);

-- 7. Adicionar as foreign keys opcionais
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_whatsapp_user_id_fkey 
FOREIGN KEY (whatsapp_user_id) REFERENCES public.whatsapp_users(id) ON DELETE SET NULL;

-- 8. Garantir que pelo menos um ID seja preenchido
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_check 
CHECK ((user_id IS NOT NULL) OR (whatsapp_user_id IS NOT NULL));