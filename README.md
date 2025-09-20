# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d192a44a-2f40-41e0-9507-a15e4da9220c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d192a44a-2f40-41e0-9507-a15e4da9220c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment Variables

⚠️ **IMPORTANTE**: Este projeto requer variáveis de ambiente obrigatórias para funcionar.

### Frontend (obrigatório)
Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Obtenha estas credenciais em**: [Supabase Dashboard](https://supabase.com/dashboard) > Settings > API

### Backend (Supabase Secrets)
Configure via Supabase Dashboard > Project Settings > Functions:
- `OPENAI_API_KEY`: Sua chave da OpenAI
- `WHATSAPP_ACCESS_TOKEN`: Token do WhatsApp Business API
- `WHATSAPP_PHONE_NUMBER_ID`: ID do número do WhatsApp
- `WHATSAPP_VERIFY_TOKEN`: Token de verificação do webhook

### Cron Job (configuração manual)
Para habilitar notificações automáticas, execute no SQL Editor do Supabase:
```sql
SELECT cron.schedule(
  'daily-bill-notifications',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
        url:='https://SEU_PROJETO.supabase.co/functions/v1/bill-notifications',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer SUA_CHAVE_ANON"}'::jsonb,
        body:='{"automated": true}'::jsonb
    ) as request_id;
  $$
);
```

## Security

✅ **Projeto seguro para open-source**:
- Todas as credenciais removidas do código
- Variáveis de ambiente obrigatórias (sem fallbacks)
- RLS habilitado em todas as tabelas
- Cron jobs sem tokens hardcoded
- Documentação de segurança completa

⚠️ **IMPORTANTE**: Adicione `*.env*` ao seu `.gitignore` para prevenir commits acidentais de credenciais.

Veja [SECURITY.md](./SECURITY.md) para documentação completa de segurança.

## Supabase setup

This repository uses Supabase for its database and edge functions. Install the
Supabase CLI, link the project and apply the migrations before running the
backend services.

### 1. Install the CLI

```sh
npm install -g supabase
```

Log in and link the project using the ID from `supabase/config.toml`:

```sh
supabase login
supabase link --project-ref gzitpxtmvakgebbpqiuh
```

### 2. Run migrations

Apply the SQL files inside `supabase/migrations/` to your linked project:

```sh
supabase db push
```

### 3. Deploy edge functions

The directory `supabase/functions/` contains three edge functions that can be
deployed individually:

```sh
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-send
supabase functions deploy financial-ai-chat
```

Use `supabase secrets set --env-file .env` to provide environment variables for
these functions, including your `OPENAI_API_KEY`.

### 4. Link the WhatsApp webhook

After deploying `whatsapp-webhook`, run `supabase functions list` to obtain its
public URL. Add this URL in the WhatsApp Business webhook settings and use the
same value as your `WHATSAPP_VERIFY_TOKEN` when verifying the webhook.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d192a44a-2f40-41e0-9507-a15e4da9220c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
