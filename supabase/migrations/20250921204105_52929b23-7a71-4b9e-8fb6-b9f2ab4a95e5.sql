-- CORREÇÃO URGENTE DE SEGURANÇA: Políticas RLS para tabela transactions
-- Remover política insegura atual
DROP POLICY IF EXISTS "Bot can access transactions" ON public.transactions;

-- Criar políticas RLS seguras para transactions
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
ON public.transactions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
ON public.transactions
FOR DELETE
USING (auth.uid() = user_id);

-- Política para admins terem acesso total (apenas quando necessário)
CREATE POLICY "Admins can access all transactions"
ON public.transactions
FOR ALL
USING (public.get_current_user_role() = 'admin');

-- Atualizar transações órfãs do WhatsApp para seus usuários corretos
-- Vincular transações dos usuários WhatsApp aos seus perfis
UPDATE public.transactions 
SET user_id = wu.client_id
FROM public.whatsapp_users wu
WHERE transactions.whatsapp_user_id = wu.id 
AND transactions.user_id IS NULL
AND wu.client_id IS NOT NULL;