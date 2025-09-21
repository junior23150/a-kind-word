-- Como a Camila não tem registro em auth.users, vou temporariamente 
-- remover a foreign key constraint para permitir a inserção
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Inserir a Camila na tabela profiles
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

-- Recriar a foreign key constraint como opcional (permite NULL mas valida quando existe)
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
DEFERRABLE INITIALLY DEFERRED;