-- Configurar cron job para limpeza automática diária (executa às 2:00 AM)
SELECT cron.schedule(
  'cleanup-inactive-users-daily',
  '0 2 * * *', -- todos os dias às 2:00 AM
  $$
  SELECT
    net.http_post(
        url:='https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/user-cleanup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6aXRweHRtdmFrZ2ViYnBxaXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDkxNzgsImV4cCI6MjA2NzY4NTE3OH0.Zr2ht9gpWDg00HWeJE1kTJMJwWV1LOOeISIeelejReE"}'::jsonb,
        body:='{"scheduled": true}'::jsonb
    ) as request_id;
  $$
);