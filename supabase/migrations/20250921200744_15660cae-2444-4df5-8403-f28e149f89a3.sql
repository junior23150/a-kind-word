-- 1. Primeiro, criar o Admin no whatsapp_users e user_profiles
INSERT INTO public.whatsapp_users (id, phone_number, name, client_id, is_registered)
VALUES (
  gen_random_uuid(),
  '+55419999999',
  'Admin User', 
  'ae50af2d-412f-496a-9dac-781744cc78da',
  true
);

-- 2. Inserir o Admin no user_profiles
INSERT INTO public.user_profiles (id, client_id, whatsapp_user_id, email, full_name, subscription_plan)
VALUES (
  gen_random_uuid(),
  'ae50af2d-412f-496a-9dac-781744cc78da',
  (SELECT id FROM public.whatsapp_users WHERE phone_number = '+55419999999'),
  'aluizio.m.s.jr21@gmail.com',
  'Admin User',
  'business'
);

-- 3. Remover a foreign key atual da tabela transactions
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- 4. Adicionar coluna whatsapp_user_id na tabela transactions (opcional)
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS whatsapp_user_id uuid;

-- 5. Tornar user_id nullable para permitir transações do WhatsApp
ALTER TABLE public.transactions 
ALTER COLUMN user_id DROP NOT NULL;

-- 6. Adicionar foreign keys opcionais
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_whatsapp_user_id_fkey 
FOREIGN KEY (whatsapp_user_id) REFERENCES public.whatsapp_users(id) ON DELETE SET NULL;

-- 7. Adicionar constraint para garantir que pelo menos um dos IDs seja preenchido
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_check 
CHECK ((user_id IS NOT NULL) OR (whatsapp_user_id IS NOT NULL));