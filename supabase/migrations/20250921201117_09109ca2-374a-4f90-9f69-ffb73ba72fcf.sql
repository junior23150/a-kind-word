-- Verificar se as correções já foram aplicadas e aplicar apenas o que falta

-- 1. Verificar se whatsapp_user_id existe, se não, adicionar
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'whatsapp_user_id') THEN
        ALTER TABLE public.transactions ADD COLUMN whatsapp_user_id uuid;
    END IF;
END $$;

-- 2. Mover dados se necessário
UPDATE public.transactions 
SET whatsapp_user_id = user_id, user_id = NULL
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM public.profiles)
  AND whatsapp_user_id IS NULL;

-- 3. Criar Admin no whatsapp_users apenas se não existir
INSERT INTO public.whatsapp_users (id, phone_number, name, client_id, is_registered)
SELECT gen_random_uuid(), '+55419999999', 'Admin User', 'ae50af2d-412f-496a-9dac-781744cc78da', true
WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_users WHERE phone_number = '+55419999999');

-- 4. Criar Admin no user_profiles apenas se não existir
INSERT INTO public.user_profiles (id, client_id, whatsapp_user_id, email, full_name, subscription_plan)
SELECT 
  gen_random_uuid(),
  'ae50af2d-412f-496a-9dac-781744cc78da',
  (SELECT id FROM public.whatsapp_users WHERE phone_number = '+55419999999' LIMIT 1),
  'aluizio.m.s.jr21@gmail.com',
  'Admin User',
  'business'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_profiles 
  WHERE email = 'aluizio.m.s.jr21@gmail.com' 
  AND full_name = 'Admin User'
);

-- 5. Adicionar foreign key para whatsapp_users se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'transactions_whatsapp_user_id_fkey' 
                   AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions 
        ADD CONSTRAINT transactions_whatsapp_user_id_fkey 
        FOREIGN KEY (whatsapp_user_id) REFERENCES public.whatsapp_users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Adicionar check constraint se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'transactions_user_check' 
                   AND table_name = 'transactions') THEN
        ALTER TABLE public.transactions 
        ADD CONSTRAINT transactions_user_check 
        CHECK ((user_id IS NOT NULL) OR (whatsapp_user_id IS NOT NULL));
    END IF;
END $$;