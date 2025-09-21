-- Corrigir transações órfãs: vincular transações do WhatsApp aos usuários corretos
-- Primeiro, vamos tentar associar transações baseado no whatsapp_user_id
UPDATE public.transactions 
SET user_id = wu.client_id
FROM public.whatsapp_users wu
WHERE transactions.whatsapp_user_id = wu.id 
AND transactions.user_id IS NULL
AND wu.client_id IS NOT NULL;

-- Se ainda existem transações órfãs sem whatsapp_user_id, vamos marcá-las como do sistema/admin
-- para evitar que fiquem perdidas (apenas como backup - não deveria acontecer em produção)
UPDATE public.transactions 
SET user_id = (SELECT id FROM public.profiles WHERE role = 'admin' LIMIT 1)
WHERE user_id IS NULL 
AND EXISTS(SELECT 1 FROM public.profiles WHERE role = 'admin');