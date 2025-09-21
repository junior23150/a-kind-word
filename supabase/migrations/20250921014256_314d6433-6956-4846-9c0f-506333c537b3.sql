-- Criar registros na tabela profiles para usuários que existem apenas em user_profiles
-- Primeiro, vamos inserir os usuários Aluizio Junior e Camila na tabela profiles

-- Inserir Aluizio Junior baseado nos dados de user_profiles
INSERT INTO public.profiles (id, email, full_name, role, plan_type)
SELECT 
  gen_random_uuid() as id,
  'aluizio.m.s.jr21@gmail.com' as email,
  'Aluizio Junior' as full_name,
  'personal'::user_role as role,
  'trial' as plan_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'aluizio.m.s.jr21@gmail.com' AND full_name = 'Aluizio Junior'
);

-- Inserir Camila baseada nos dados de user_profiles  
INSERT INTO public.profiles (id, email, full_name, role, plan_type)
SELECT 
  gen_random_uuid() as id,
  'cami.rodriguesz@gmail.com' as email,
  'Camila' as full_name,
  'personal'::user_role as role,
  'trial' as plan_type
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE email = 'cami.rodriguesz@gmail.com'
);