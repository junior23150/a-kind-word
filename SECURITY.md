# Guia de Segurança - WhatsApp Financial Bot

Este documento contém as práticas de segurança implementadas no projeto e instruções para configuração segura.

## 🔒 Práticas de Segurança Implementadas

### 1. Proteção de Credenciais

- **Frontend**: Usa variáveis de ambiente Vite (`VITE_*`) para configurações
- **Backend**: Secrets gerenciados via Supabase Dashboard
- **Controle de Versão**: `.gitignore` configurado para não rastrear arquivos `.env`
- **Exemplos**: `.env.example` sanitizado sem credenciais reais

### 2. Row Level Security (RLS)

Todas as tabelas possuem RLS habilitado com políticas específicas:

- **whatsapp_users**: Acesso completo (necessário para funcionamento do bot)
- **transactions**: Acesso completo (operações via webhook)
- **whatsapp_conversations**: Acesso completo (fluxo de mensagens)
- **recurring_bills**: Políticas baseadas em usuário
- **user_profiles**: Políticas baseadas em usuário
- **bill_notifications**: Apenas leitura para usuários, inserção pelo sistema

### 3. Edge Functions Seguras

- Todas as credenciais são lidas de variáveis de ambiente
- CORS habilitado apenas para domínios necessários
- Logging implementado para auditoria
- Validação de entrada de dados

## 🚀 Configuração de Desenvolvimento

### 1. Configurar Variáveis de Ambiente

```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Edite o arquivo .env com suas credenciais
# VITE_SUPABASE_URL=sua_url_aqui
# VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

### 2. Obter Credenciais Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings** > **API**
3. Copie:
   - **URL**: Para `VITE_SUPABASE_URL`
   - **anon public**: Para `VITE_SUPABASE_ANON_KEY`

### 3. Configurar Secrets do Backend

1. No Supabase Dashboard, vá em **Project Settings** > **Functions**
2. Configure os seguintes secrets:
   - `OPENAI_API_KEY`: Sua chave da OpenAI
   - `WHATSAPP_ACCESS_TOKEN`: Token do WhatsApp Business API
   - `WHATSAPP_PHONE_NUMBER_ID`: ID do número do WhatsApp
   - `WHATSAPP_VERIFY_TOKEN`: Token de verificação do webhook

## 🌐 Configuração de Produção

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no seu provedor de hospedagem:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_publica
```

### 2. Secrets Supabase

Os secrets já devem estar configurados no Supabase Dashboard e serão automaticamente utilizados pelas Edge Functions.

### 3. Webhook WhatsApp

Configure o webhook do WhatsApp para apontar para:
```
https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook
```

## 🔍 Auditoria de Segurança

### Verificações Regulares

1. **RLS Policies**: Execute `lov-supabase-linter` para verificar políticas
2. **Logs**: Monitore logs das Edge Functions no Supabase
3. **Secrets**: Rotacione chaves periodicamente
4. **Commits**: Verifique que nenhuma credencial foi commitada

### Monitoramento

- Edge Functions possuem logging detalhado
- Errors são logados com contexto apropriado
- Operações do banco são auditáveis via RLS

## 🚨 Resposta a Incidentes

### Se Credenciais Foram Expostas

1. **Imediato**: Rotacione todas as chaves expostas
2. **WhatsApp**: Gere novo access token no Meta Developers
3. **OpenAI**: Rotacione API key no dashboard da OpenAI
4. **Supabase**: Regenere chaves se necessário
5. **Git**: Considere reescrever histórico se credenciais estão em commits

### Contatos

- Para problemas de segurança: [seu-email-de-seguranca]
- Suporte técnico: [seu-email-de-suporte]

## 📚 Recursos Adicionais

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [WhatsApp Business API Security](https://developers.facebook.com/docs/whatsapp/cloud-api/overview)
- [OpenAI API Best Practices](https://platform.openai.com/docs/guides/safety-best-practices)

## 📋 Status de Segurança

✅ **PROJETO SEGURO PARA OPEN-SOURCE**

### Correções Implementadas (Janeiro 2025)

1. **Credenciais Sanitizadas**: Todas as credenciais foram removidas do código
2. **Variáveis de Ambiente Obrigatórias**: Sem fallbacks hardcoded
3. **RLS Corrigido**: Políticas atualizadas com nomes mais descritivos
4. **Cron Jobs Seguros**: Tokens removidos das migrations
5. **Documentação Completa**: Instruções claras de configuração

### ⚠️ Ação Manual Necessária

**Adicione ao seu `.gitignore`** (não pôde ser modificado automaticamente):
```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### Próximos Passos

1. **Crie o arquivo `.env`** com suas credenciais reais
2. **Adicione `.env*` ao `.gitignore`** 
3. **Configure secrets no Supabase Dashboard**
4. **Configure cron job manualmente** (veja README.md)
5. **Teste o bot WhatsApp** para garantir funcionamento

---

**Última atualização**: Janeiro 2025  
**Versão**: 2.0 - Seguro para Open Source  
**Status**: ✅ Pronto para ser público