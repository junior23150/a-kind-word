-- Inserir Camila na tabela profiles usando o ID correto da user_profiles
INSERT INTO public.profiles (id, email, full_name, phone_number, role, plan_type)
VALUES (
  'c9947388-0ec2-4592-b5e8-aa203fd2df73',
  'cami.rodriguesz@gmail.com', 
  'Camila',
  '+554196227490',
  'business',
  'trial'
)
ON CONFLICT (id) DO NOTHING;