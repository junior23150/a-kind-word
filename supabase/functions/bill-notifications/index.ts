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
  console.log(`=== Bill Notifications - ${req.method} request received ===`);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const today = new Date();
    const currentDay = today.getDate();
    
    console.log(`Verificando contas que vencem hoje (dia ${currentDay})`);

    // Buscar contas que vencem hoje
    const { data: billsDueToday, error: billsError } = await supabase
      .from('recurring_bills')
      .select(`
        *,
        whatsapp_users!inner (
          phone_number,
          name,
          user_profiles (*)
        )
      `)
      .eq('due_day', currentDay)
      .eq('is_active', true);

    if (billsError) {
      console.error('Erro ao buscar contas:', billsError);
      throw billsError;
    }

    console.log(`Encontradas ${billsDueToday?.length || 0} contas para notificar`);

    if (!billsDueToday || billsDueToday.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Nenhuma conta para notificar hoje' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let notificationsSent = 0;
    let errors = 0;

    for (const bill of billsDueToday) {
      try {
        // Verificar se já foi enviada notificação hoje
        const { data: existingNotification } = await supabase
          .from('bill_notifications')
          .select('id')
          .eq('recurring_bill_id', bill.id)
          .eq('notification_date', today.toISOString().split('T')[0])
          .single();

        if (existingNotification) {
          console.log(`Notificação já enviada para conta ${bill.name} hoje`);
          continue;
        }

        // Verificar se o usuário está registrado
        const user = bill.whatsapp_users;
        if (!user || !user.user_profiles || user.user_profiles.length === 0) {
          console.log(`Usuário não registrado para conta ${bill.name}`);
          continue;
        }

        // Criar mensagem de notificação
        const message = `🔔 *Lembrete de Vencimento*\n\n📋 ${bill.name}\n📅 Vence hoje (${currentDay}/${today.getMonth() + 1})\n${bill.amount ? `💰 Valor: R$ ${bill.amount}\n` : ''}${bill.description ? `📝 ${bill.description}\n` : ''}\n✅ Não esqueça de pagar!`;

        // Enviar notificação via WhatsApp
        const sendResponse = await fetch(
          'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phoneNumber: user.phone_number,
              message: message
            })
          }
        );

        if (sendResponse.ok) {
          // Auto-lançar como despesa se tiver valor
          if (bill.amount && Number(bill.amount) > 0) {
            const { error: transactionError } = await supabase
              .from('transactions')
              .insert({
                user_id: bill.user_id,
                client_id: bill.client_id,
                description: `${bill.name} - Vencimento ${currentDay}/${today.getMonth() + 1}`,
                amount: Number(bill.amount),
                date: today.toISOString().split('T')[0],
                category: bill.category || 'Contas Fixas',
                transaction_type: 'expense',
                source: 'recurring_bill',
                original_message: `Conta recorrente: ${bill.name}`
              });

            if (transactionError) {
              console.error('Erro ao criar transação automática:', transactionError);
            } else {
              console.log(`Transação automática criada para ${bill.name}`);
            }
          }

          // Salvar notificação no histórico
          await supabase
            .from('bill_notifications')
            .insert({
              recurring_bill_id: bill.id,
              user_id: bill.user_id,
              notification_date: today.toISOString().split('T')[0],
              status: 'sent'
            });

          // Atualizar last_notification_sent na conta
          await supabase
            .from('recurring_bills')
            .update({ last_notification_sent: new Date().toISOString() })
            .eq('id', bill.id);

          notificationsSent++;
          console.log(`Notificação enviada para ${user.phone_number} - ${bill.name}`);
        } else {
          console.error(`Erro ao enviar notificação para ${user.phone_number}:`, await sendResponse.text());
          errors++;
        }

      } catch (error) {
        console.error(`Erro ao processar conta ${bill.name}:`, error);
        errors++;
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      notificationsSent,
      errors,
      message: `${notificationsSent} notificações enviadas, ${errors} erros`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro geral nas notificações:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});