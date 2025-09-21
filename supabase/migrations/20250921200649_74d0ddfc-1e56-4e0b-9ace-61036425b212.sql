-- 1. Inserir Aluizio Junior na tabela profiles
INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
VALUES (
  'f89368f1-6bee-4004-8c30-09916c093620',
  'aluizio.m.s.jr21@gmail.com',
  'Aluizio Junior',
  '+554196990362',
  'business',
  'trial'
);

-- 2. Inserir Camila na tabela profiles  
INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
VALUES (
  'c9947388-0ec2-4592-b5e8-aa203fd2df73',
  'cami.rodriguesz@gmail.com', 
  'Camila',
  '+554196227490',
  'business',
  'trial'
);

-- 3. Inserir o Admin no user_profiles
INSERT INTO public.user_profiles (id, client_id, whatsapp_user_id, email, full_name, subscription_plan)
VALUES (
  gen_random_uuid(),
  'ae50af2d-412f-496a-9dac-781744cc78da',
  gen_random_uuid(), -- Será usado para o whatsapp_users também
  'aluizio.m.s.jr21@gmail.com',
  'Admin User',
  'business'
);

-- 4. Inserir o Admin no whatsapp_users (usando o mesmo UUID gerado)
INSERT INTO public.whatsapp_users (id, phone_number, name, client_id, is_registered)
VALUES (
  (SELECT whatsapp_user_id FROM public.user_profiles WHERE email = 'aluizio.m.s.jr21@gmail.com' AND full_name = 'Admin User' LIMIT 1),
  '+55419999999', -- Número administrativo
  'Admin User',
  'ae50af2d-412f-496a-9dac-781744cc78da',
  true
);

-- 5. Remover a foreign key atual da tabela transactions que referencia whatsapp_users
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- 6. Adicionar nova foreign key que referencia profiles
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;