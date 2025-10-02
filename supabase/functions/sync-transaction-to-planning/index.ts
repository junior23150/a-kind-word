import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  try {
    const { transaction } = await req.json();
    
    if (!transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction data is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Criar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Extrair data da transação
    const transactionDate = new Date(transaction.date);
    const month = transactionDate.getMonth() + 1;
    const year = transactionDate.getFullYear();

    // Verificar se já existe budget_item para esta categoria/mês/ano
    const { data: existingBudget } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', transaction.user_id)
      .eq('category', transaction.category)
      .eq('type', transaction.transaction_type)
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    // Se não existir, criar automaticamente
    if (!existingBudget) {
      const { error: insertError } = await supabase
        .from('budget_items')
        .insert({
          user_id: transaction.user_id,
          category: transaction.category,
          type: transaction.transaction_type,
          planned_amount: transaction.amount,
          description: `${transaction.description} (automático)`,
          month: month,
          year: year,
          is_recurring: false,
        });

      if (insertError) {
        console.error('Error creating budget item:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create budget item' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Budget item created automatically',
          created: true 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Budget item already exists',
        created: false 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-transaction-to-planning:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
