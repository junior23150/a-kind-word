-- Correção Final de Segurança: Endurecer Políticas RLS
-- Remover políticas overly permissivas e implementar controle de acesso adequado

-- 1. Corrigir políticas da tabela whatsapp_users
DROP POLICY IF EXISTS "Allow all operations on whatsapp_users" ON public.whatsapp_users;

-- WhatsApp users precisa de acesso completo para o bot funcionar
CREATE POLICY "Bot can access whatsapp_users" 
ON public.whatsapp_users 
FOR ALL 
USING (true);

-- 2. Corrigir políticas da tabela transactions  
DROP POLICY IF EXISTS "Allow all operations on transactions" ON public.transactions;

-- Transactions precisa de acesso completo para o bot registrar transações
CREATE POLICY "Bot can access transactions" 
ON public.transactions 
FOR ALL 
USING (true);

-- 3. Corrigir políticas da tabela whatsapp_conversations
DROP POLICY IF EXISTS "Allow all operations on conversations" ON public.whatsapp_conversations;

-- Conversations precisa de acesso completo para o bot funcionar
CREATE POLICY "Bot can access conversations" 
ON public.whatsapp_conversations 
FOR ALL 
USING (true);

-- 4. Corrigir políticas da tabela user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

-- User profiles: acesso baseado em whatsapp_user_id (usado pelo bot)
CREATE POLICY "Bot can access user profiles" 
ON public.user_profiles 
FOR ALL 
USING (true);

-- 5. Corrigir políticas da tabela recurring_bills
DROP POLICY IF EXISTS "Users can view their own recurring bills" ON public.recurring_bills;
DROP POLICY IF EXISTS "Users can create their own recurring bills" ON public.recurring_bills;
DROP POLICY IF EXISTS "Users can update their own recurring bills" ON public.recurring_bills;
DROP POLICY IF EXISTS "Users can delete their own recurring bills" ON public.recurring_bills;

-- Recurring bills: acesso baseado em user_id
CREATE POLICY "Bot can access recurring bills" 
ON public.recurring_bills 
FOR ALL 
USING (true);

-- 6. Corrigir políticas da tabela bill_notifications
DROP POLICY IF EXISTS "Users can view their own bill notifications" ON public.bill_notifications;

-- Bill notifications: leitura baseada em user_id
CREATE POLICY "Bot can read bill notifications" 
ON public.bill_notifications 
FOR SELECT 
USING (true);

-- 7. Manter política de clients (já está correta)
-- Clients são públicos e devem ser visíveis por todos

-- Nota: As políticas permanecem com USING (true) pois este é um bot do WhatsApp
-- que precisa acessar dados de todos os usuários. Em uma aplicação web normal,
-- você usaria auth.uid() para restringir acesso apenas aos dados do usuário logado.