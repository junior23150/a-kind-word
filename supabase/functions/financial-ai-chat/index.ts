import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phoneNumber, message } = await req.json();
    
    // Buscar usuário pelo telefone
    const { data: user, error: userError } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (userError) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar transações do usuário
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Calcular estatísticas
    const totalGastos = transactions
      ?.filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    
    const totalReceitas = transactions
      ?.filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0) || 0;
    
    const saldo = totalReceitas - totalGastos;
    
    const gastosPorCategoria = transactions
      ?.filter(t => t.transaction_type === 'expense')
      .reduce((acc, t) => {
        const cat = t.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + parseFloat(t.amount.toString());
        return acc;
      }, {} as Record<string, number>) || {};

    // Criar prompt com dados financeiros
    const systemPrompt = `
Você é a IA do GranaZen, assistente financeiro pessoal do ${user.name}.

SITUAÇÃO FINANCEIRA ATUAL:
- Total de Receitas: R$ ${totalReceitas.toFixed(2)}
- Total de Gastos: R$ ${totalGastos.toFixed(2)}
- Saldo: R$ ${saldo.toFixed(2)} ${saldo >= 0 ? '(positivo ✅)' : '(negativo ⚠️)'}

GASTOS POR CATEGORIA:
${Object.entries(gastosPorCategoria).map(([cat, valor]) => `- ${cat}: R$ ${valor.toFixed(2)}`).join('\n')}

ÚLTIMAS 5 TRANSAÇÕES:
${transactions?.slice(0, 5).map(t => 
  `- ${t.date} | ${t.transaction_type === 'expense' ? '💸' : '💰'} R$ ${t.amount} | ${t.description} ${t.category ? `(${t.category})` : ''}`
).join('\n') || 'Nenhuma transação encontrada'}

SUAS CAPACIDADES:
1. Analisar gastos e padrões financeiros
2. Dar dicas personalizadas de economia
3. Sugerir orçamentos e metas
4. Ajudar com planejamento financeiro
5. Alertar sobre gastos excessivos
6. Motivar bons hábitos financeiros

Responda sempre:
- De forma amigável e encorajadora
- Com base nos dados reais do usuário
- Com dicas práticas e acionáveis
- Em português brasileiro
- Use emojis para deixar mais amigável

Se o usuário perguntar sobre gastos específicos, consulte os dados acima.
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const aiResponse = await response.json();
    const reply = aiResponse.choices[0].message.content;

    // Salvar conversa
    await supabase
      .from('whatsapp_conversations')
      .insert([
        {
          user_id: user.id,
          content: message,
          is_from_user: true,
          message_type: 'text'
        },
        {
          user_id: user.id,
          content: reply,
          is_from_user: false,
          message_type: 'text',
          ai_response: reply
        }
      ]);

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no chat financeiro:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});