-- Habilitar extensões necessárias para cron jobs
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- IMPORTANTE: Este cron job deve ser reconfigurado com suas credenciais
-- Para configurar o cron job, use o SQL Editor do Supabase com suas credenciais reais:
-- 
-- SELECT cron.schedule(
--   'daily-bill-notifications',
--   '0 9 * * *',
--   $$
--   SELECT
--     net.http_post(
--         url:='https://SEU_PROJETO.supabase.co/functions/v1/bill-notifications',
--         headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUA_CHAVE_ANON"}'::jsonb,
--         body:='{"automated": true}'::jsonb
--     ) as request_id;
--   $$
-- );

SELECT 'Cron job deve ser configurado manualmente com credenciais reais via SQL Editor' as nota;