-- 1. Remover constraint NOT NULL do user_id primeiro
ALTER TABLE public.transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- 2. Adicionar coluna whatsapp_user_id se não existir
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS whatsapp_user_id uuid;

-- 3. Mover IDs que não existem em profiles para whatsapp_user_id
UPDATE public.transactions 
SET whatsapp_user_id = user_id, user_id = NULL
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 4. Criar Admin no whatsapp_users
INSERT INTO public.whatsapp_users (id, phone_number, name, client_id, is_registered)
VALUES (
  gen_random_uuid(),
  '+55419999999',
  'Admin User', 
  'ae50af2d-412f-496a-9dac-781744cc78da',
  true
);

-- 5. Criar Admin no user_profiles
INSERT INTO public.user_profiles (id, client_id, whatsapp_user_id, email, full_name, subscription_plan)
VALUES (
  gen_random_uuid(),
  'ae50af2d-412f-496a-9dac-781744cc78da',
  (SELECT id FROM public.whatsapp_users WHERE phone_number = '+55419999999' LIMIT 1),
  'aluizio.m.s.jr21@gmail.com',
  'Admin User',
  'business'
);

-- 6. Adicionar foreign keys
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_whatsapp_user_id_fkey 
FOREIGN KEY (whatsapp_user_id) REFERENCES public.whatsapp_users(id) ON DELETE SET NULL;

-- 7. Garantir que pelo menos um ID seja preenchido
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_check 
CHECK ((user_id IS NOT NULL) OR (whatsapp_user_id IS NOT NULL));