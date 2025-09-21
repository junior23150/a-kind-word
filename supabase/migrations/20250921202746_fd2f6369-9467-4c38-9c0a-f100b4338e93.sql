-- Adicionar campo inactive_since nas tabelas de usuários
ALTER TABLE public.profiles ADD COLUMN inactive_since timestamp with time zone DEFAULT NULL;
ALTER TABLE public.whatsapp_users ADD COLUMN inactive_since timestamp with time zone DEFAULT NULL;
ALTER TABLE public.user_profiles ADD COLUMN inactive_since timestamp with time zone DEFAULT NULL;

-- Criar função para inativar usuário
CREATE OR REPLACE FUNCTION public.inactivate_user(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inativar na tabela profiles
  UPDATE public.profiles 
  SET inactive_since = now(), is_active = false
  WHERE id = user_uuid;
  
  -- Inativar nas outras tabelas relacionadas se existirem
  UPDATE public.whatsapp_users 
  SET inactive_since = now()
  WHERE client_id = user_uuid;
  
  UPDATE public.user_profiles 
  SET inactive_since = now(), is_active = false
  WHERE client_id = user_uuid;
END;
$$;

-- Criar função para reativar usuário
CREATE OR REPLACE FUNCTION public.reactivate_user(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reativar na tabela profiles
  UPDATE public.profiles 
  SET inactive_since = NULL, is_active = true
  WHERE id = user_uuid;
  
  -- Reativar nas outras tabelas relacionadas se existirem
  UPDATE public.whatsapp_users 
  SET inactive_since = NULL
  WHERE client_id = user_uuid;
  
  UPDATE public.user_profiles 
  SET inactive_since = NULL, is_active = true
  WHERE client_id = user_uuid;
END;
$$;

-- Criar função para limpeza automática de usuários inativos há mais de 60 dias
CREATE OR REPLACE FUNCTION public.cleanup_inactive_users()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer := 0;
  user_record record;
  result_json json;
BEGIN
  -- Buscar usuários inativos há mais de 60 dias
  FOR user_record IN 
    SELECT id, email, full_name 
    FROM public.profiles 
    WHERE inactive_since IS NOT NULL 
    AND inactive_since < (now() - interval '60 days')
  LOOP
    -- Deletar em cascata: conversas, transações, contas bancárias, categorias, metas, contas recorrentes
    DELETE FROM public.whatsapp_conversations WHERE user_id = user_record.id;
    DELETE FROM public.transactions WHERE user_id = user_record.id;
    DELETE FROM public.bank_accounts WHERE user_id = user_record.id;
    DELETE FROM public.categories WHERE user_id = user_record.id;
    DELETE FROM public.category_goals WHERE user_id = user_record.id;
    DELETE FROM public.recurring_bills WHERE user_id = user_record.id;
    DELETE FROM public.bill_notifications WHERE user_id = user_record.id;
    
    -- Deletar usuário das tabelas auxiliares
    DELETE FROM public.whatsapp_users WHERE client_id = user_record.id;
    DELETE FROM public.user_profiles WHERE client_id = user_record.id;
    
    -- Deletar perfil principal
    DELETE FROM public.profiles WHERE id = user_record.id;
    
    deleted_count := deleted_count + 1;
  END LOOP;
  
  result_json := json_build_object(
    'deleted_users', deleted_count,
    'cleanup_date', now()
  );
  
  RETURN result_json;
END;
$$;

-- Atualizar RLS policies para considerar usuários inativos
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id AND (inactive_since IS NULL OR is_active = true));

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id AND (inactive_since IS NULL OR is_active = true));

-- Inativar usuários específicos (Aluizio Junior e Camila)
SELECT public.inactivate_user(id) 
FROM public.profiles 
WHERE email IN ('aluizio.junior.pro@gmail.com', 'cami.rodriguesz@gmail.com');