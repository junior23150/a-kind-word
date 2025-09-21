-- CORREÇÃO CRÍTICA: Foreign key incorreta na tabela transactions
-- Remover foreign key incorreta para user_id
ALTER TABLE public.transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;

-- Criar foreign key correta apontando para profiles
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Limpar transações órfãs que não têm usuário válido no sistema
-- Estas são transações de teste do WhatsApp que não devem aparecer para usuários reais
DELETE FROM public.transactions 
WHERE user_id IS NULL;