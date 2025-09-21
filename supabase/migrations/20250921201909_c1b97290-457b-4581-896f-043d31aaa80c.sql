-- Verificar constraints existentes
SELECT tc.constraint_name, tc.constraint_type, kcu.column_name
FROM information_schema.table_constraints tc 
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
  AND tc.table_schema = 'public';

-- Inserir a Camila com um novo UUID na tabela profiles 
-- (mantendo a referência correta nas outras tabelas)
INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
VALUES (
  gen_random_uuid(),  -- Novo UUID para evitar conflitos
  'cami.rodriguesz@gmail.com', 
  'Camila',
  '+554196227490',
  'business',
  'trial'
);

-- Verificar se foi inserido
SELECT id, email, full_name, role FROM public.profiles WHERE email = 'cami.rodriguesz@gmail.com';