import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { goal, type } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Fetch user's financial profile
    const [transactionsResult, goalsResult] = await Promise.all([
      supabase
        .from('transactions')
        .select('amount, transaction_type, date')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false }),
      supabase
        .from('savings_goals')
        .select('target_amount, current_amount')
        .eq('user_id', user.id)
        .eq('is_active', true)
    ]);

    const transactions = transactionsResult.data || [];
    const activeGoals = goalsResult.data || [];

    // Calculate financial metrics
    const monthlyIncome = transactions
      .filter(t => t.transaction_type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) / 3;

    const monthlyExpenses = transactions
      .filter(t => t.transaction_type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0) / 3;

    const otherGoalsTotal = activeGoals
      .filter(g => g.id !== goal.id)
      .reduce((sum, g) => sum + (parseFloat(g.target_amount) - parseFloat(g.current_amount)), 0);

    const financialProfile = {
      receitas_mensais: monthlyIncome,
      despesas_mensais: monthlyExpenses,
      saldo_disponivel: monthlyIncome - monthlyExpenses,
      outros_objetivos_total: otherGoalsTotal,
      numero_objetivos_ativos: activeGoals.length
    };

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'creation') {
      systemPrompt = `Você é um assistente financeiro especializado em planejamento de objetivos. 
Analise o perfil financeiro do usuário e forneça recomendações práticas e realistas.
Seja direto, empático e use linguagem brasileira informal.`;

      userPrompt = `Objetivo: ${goal.name}
Valor alvo: R$ ${goal.target_amount.toLocaleString('pt-BR')}
Valor atual: R$ ${(goal.current_amount || 0).toLocaleString('pt-BR')}
${goal.target_date ? `Data limite: ${new Date(goal.target_date).toLocaleDateString('pt-BR')}` : 'Sem prazo definido'}

Perfil Financeiro:
- Receita mensal média: R$ ${financialProfile.receitas_mensais.toLocaleString('pt-BR')}
- Despesas mensais médias: R$ ${financialProfile.despesas_mensais.toLocaleString('pt-BR')}
- Saldo disponível: R$ ${financialProfile.saldo_disponivel.toLocaleString('pt-BR')}
- Total em outros objetivos: R$ ${financialProfile.outros_objetivos_total.toLocaleString('pt-BR')}
- Outros objetivos ativos: ${financialProfile.numero_objetivos_ativos}

Forneça uma resposta em JSON com esta estrutura exata:
{
  "valor_mensal_sugerido": número (valor realista mensal em R$),
  "prazo_estimado_meses": número (meses até completar),
  "viabilidade": "alta" | "média" | "baixa",
  "conselhos": [array de 2-3 strings com dicas práticas],
  "alternativas": [
    {"valor_mensal": número, "prazo_meses": número, "descricao": "string"}
  ]
}`;
    } else if (type === 'insights') {
      const remaining = goal.target_amount - goal.current_amount;
      const monthsToTarget = goal.target_date 
        ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000))
        : null;

      systemPrompt = `Você é um assistente financeiro que fornece insights específicos sobre o progresso de objetivos de economia.
Analise o objetivo atual e forneça recomendações práticas e motivacionais.`;

      userPrompt = `Objetivo: ${goal.name}
Progresso: R$ ${goal.current_amount.toLocaleString('pt-BR')} de R$ ${goal.target_amount.toLocaleString('pt-BR')}
Faltam: R$ ${remaining.toLocaleString('pt-BR')}
${monthsToTarget ? `Prazo: ${monthsToTarget} meses` : 'Sem prazo definido'}

Perfil Financeiro:
- Receita mensal: R$ ${financialProfile.receitas_mensais.toLocaleString('pt-BR')}
- Despesas mensais: R$ ${financialProfile.despesas_mensais.toLocaleString('pt-BR')}
- Capacidade de poupança: R$ ${financialProfile.saldo_disponivel.toLocaleString('pt-BR')}

Forneça uma resposta em JSON com esta estrutura:
{
  "status": "no_prazo" | "atrasado" | "adiantado",
  "valor_mensal_necessario": número (para atingir no prazo),
  "economia_sugerida": número (valor mensal recomendado),
  "insights": [array de 2-3 strings com análises e dicas],
  "motivacao": "string com mensagem motivacional"
}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response format');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in goals-ai-advisor function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
