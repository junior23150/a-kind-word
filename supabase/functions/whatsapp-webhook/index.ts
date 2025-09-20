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
  console.log(`=== WhatsApp Webhook - ${req.method} request received ===`);
  console.log('Request URL:', req.url);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  // Verificação do webhook (GET request do WhatsApp)
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');

    const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verificado com sucesso!');
      return new Response(challenge, { status: 200 });
    } else {
      console.log('Falha na verificação do webhook');
      return new Response('Forbidden', { status: 403 });
    }
  }

  try {
    const body = await req.json();
    console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

    // Verificar se é uma mensagem de entrada
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.messages) {
      const messages = body.entry[0].changes[0].value.messages;
      const contacts = body.entry[0].changes[0].value.contacts || [];
      
      for (const message of messages) {
        const contact = contacts.find(c => c.wa_id === message.from);
        const phoneNumber = `+${message.from}`;
        const userName = contact?.profile?.name || 'Usuário';
        
        console.log(`Processing message from ${phoneNumber}: ${message.type}`);

        // Get default client (Knumbers)
        const { data: defaultClient } = await supabase
          .from('clients')
          .select('*')
          .eq('slug', 'knumbers')
          .single();

        // Criar ou buscar usuário
        let { data: user, error: userError } = await supabase
          .from('whatsapp_users')
          .select('*, user_profiles(*)')
          .eq('phone_number', phoneNumber)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // Usuário não existe, criar novo
          const { data: newUser, error: createError } = await supabase
            .from('whatsapp_users')
            .insert({
              phone_number: phoneNumber,
              name: userName,
              client_id: defaultClient?.id,
              is_registered: false
            })
            .select('*, user_profiles(*)')
            .single();

          if (createError) {
            throw createError;
          }
          user = newUser;
        } else if (userError) {
          throw userError;
        }

        // Verificar se é um usuário registrado (tem perfil)
        const isRegistered = user.user_profiles && user.user_profiles.length > 0;
        console.log('Usuário registrado:', isRegistered);
        
        // Salvar conversa no banco
        let content = '';
        if (message.type === 'text') {
          content = message.text.body;
        } else if (message.type === 'audio') {
          content = 'Mensagem de áudio recebida';
        } else if (message.type === 'image') {
          content = 'Imagem recebida';
          console.log('=== PROCESSAMENTO DE IMAGEM EM BACKGROUND ===');
          console.log('Usuário registrado?', isRegistered);
          
          // Processar imagem em background para evitar duplicação
          if (message.image && message.image.id) {
            EdgeRuntime.waitUntil(processImageForFinancialData(user, message, defaultClient));
          } else {
            console.error('Imagem não possui ID válido');
            EdgeRuntime.waitUntil(sendWhatsAppMessage(phoneNumber, '❌ Imagem inválida. Tente enviar novamente.'));
          }
        }

        const { error: conversationError } = await supabase
          .from('whatsapp_conversations')
          .insert({
            user_id: user.id,
            client_id: defaultClient?.id,
            message_id: message.id,
            message_type: message.type,
            content: content,
            is_from_user: true,
            processed: false
          });

        if (conversationError) {
          console.error('Erro ao salvar conversa:', conversationError);
        }

        if (!isRegistered) {
          // Enviar mensagem de cadastro para usuários não registrados
          const registrationMessage = `Olá! Eu sou a assistente Knumbers 😄💜, sua assistente financeira inteligente.

Estou aqui para te ajudar a organizar e melhorar sua vida financeira! Comigo, você pode registrar facilmente suas transações e acompanhar suas finanças de forma prática. 

Para começar a usar nossos serviços, por favor, cadastre-se no link abaixo:

https://zen-bot-finance-friend.lovable.app

Sinta-se à vontade para me usar quando precisar! Vou te acompanhar em cada passo para garantir que suas finanças estejam sempre em ordem!💜`;
          
          // Enviar via função whatsapp-send
          try {
            const sendResponse = await fetch(
              'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumber: phoneNumber,
                  message: registrationMessage
                })
              }
            );
            
            if (!sendResponse.ok) {
              console.error('Erro ao enviar mensagem de boas-vindas:', await sendResponse.text());
            } else {
              console.log('Mensagem de boas-vindas enviada com sucesso');
            }
          } catch (error) {
            console.error('Erro ao chamar whatsapp-send:', error);
          }

          // Salvar mensagem de boas-vindas na conversa
          await supabase
            .from('whatsapp_conversations')
            .insert({
              user_id: user.id,
              message_type: 'text',
              content: registrationMessage,
              is_from_user: false,
              processed: true
            });
        } else {
          // Processar mensagem com IA em background para usuários existentes
          EdgeRuntime.waitUntil(processMessageWithAI(user, message));
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no webhook WhatsApp:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function processMessageWithAI(user: any, message: any) {
  try {
    console.log('Iniciando processamento da mensagem:', message);
    let messageContent = '';
    
    if (message.type === 'text') {
      messageContent = message.text.body;
      console.log('Mensagem de texto recebida:', messageContent);
    } else if (message.type === 'audio') {
      // Processar áudio com Whisper
      messageContent = await processAudioMessage(message);
      console.log('Áudio processado:', messageContent);
    } else if (message.type === 'image') {
      // Processar imagem com Vision API
      messageContent = await processImageMessage(message);
      console.log('Imagem processada:', messageContent);
    }
    
    if (!messageContent) {
      console.log('Nenhum conteúdo da mensagem encontrado');
      return;
    }

    // Verificar se OpenAI API Key está configurada
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    console.log('OpenAI API Key configurada:', !!openaiKey);
    
    if (!openaiKey) {
      console.error('OPENAI_API_KEY não configurada! Enviando resposta padrão...');
      
      // Resposta padrão quando não há OpenAI configurada
      const defaultReply = `Olá! Recebi sua mensagem: "${messageContent}". O sistema está em configuração e em breve responderei com análises financeiras inteligentes! 🚀`;
      
      // Enviar resposta padrão
      const sendResponse = await fetch(
        'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: user.phone_number,
            message: defaultReply
          })
        }
      );
      
      console.log('Resposta padrão enviada:', sendResponse.status);
      
      // Marcar como processada mesmo sem IA
      await supabase
        .from('whatsapp_conversations')
        .update({ processed: true, ai_response: defaultReply })
        .eq('user_id', user.id)
        .eq('message_id', message.id);
      
      return;
    }

    // Buscar histórico de transações do usuário
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    // Buscar contas recorrentes do usuário
    const { data: recurringBills } = await supabase
      .from('recurring_bills')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true);

    // Criar prompt para IA
    const systemPrompt = `
Você é a IA do GranaZen, um assistente financeiro via WhatsApp.

DADOS DO USUÁRIO:
- Nome: ${user.name}
- Telefone: ${user.phone_number}

ÚLTIMAS TRANSAÇÕES:
${transactions?.map(t => `- ${t.transaction_type === 'expense' ? 'Gasto' : 'Receita'}: R$ ${t.amount} - ${t.description} (${t.date})`).join('\n') || 'Nenhuma transação encontrada'}

CONTAS RECORRENTES CADASTRADAS:
${recurringBills?.map(b => `- ${b.name}: vencimento dia ${b.due_day}${b.amount ? ` - R$ ${b.amount}` : ''}`).join('\n') || 'Nenhuma conta recorrente cadastrada'}

SUAS FUNÇÕES:
1. Extrair dados financeiros de mensagens e cadastrar automaticamente
2. Cadastrar contas recorrentes (luz, água, internet, aluguel, etc.)
3. Dar dicas financeiras personalizadas
4. Responder perguntas sobre gastos e planejamento
5. Ser amigável e útil

INSTRUÇÕES PARA CONTAS RECORRENTES:
- Quando o usuário mencionar cadastrar contas como luz, água, internet, aluguel, use register_recurring_bill
- SEMPRE pergunte o dia de vencimento se não foi informado
- Exemplos: "conta de luz", "internet", "aluguel", "água", "telefone"

Se a mensagem contém informação financeira (gasto, receita), extraia:
- Valor (obrigatório)
- Descrição/local (obrigatório) 
- Categoria (opcional: alimentação, transporte, saúde, etc.)
- Tipo: "expense" ou "income"

Responda sempre em português brasileiro de forma amigável e útil.
`;

    console.log('Chamando OpenAI API...');
    console.log('OpenAI API Key configurada:', !!openaiKey);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: messageContent }
        ],
        functions: [
          {
            name: 'register_transaction',
            description: 'Registrar uma transação financeira',
            parameters: {
              type: 'object',
              properties: {
                amount: { type: 'number', description: 'Valor da transação' },
                description: { type: 'string', description: 'Descrição da transação' },
                category: { type: 'string', description: 'Categoria da transação' },
                transaction_type: { type: 'string', enum: ['income', 'expense'], description: 'Tipo: receita ou gasto' }
              },
              required: ['amount', 'description', 'transaction_type']
            }
          },
          {
            name: 'register_recurring_bill',
            description: 'Cadastrar uma conta recorrente (luz, água, internet, aluguel, etc.)',
            parameters: {
              type: 'object',
              properties: {
                name: { type: 'string', description: 'Nome da conta (ex: Conta de Luz, Internet)' },
                description: { type: 'string', description: 'Descrição adicional da conta' },
                amount: { type: 'number', description: 'Valor da conta (opcional)' },
                due_day: { type: 'number', description: 'Dia de vencimento (1-31)' },
                category: { type: 'string', description: 'Categoria (ex: utilidades, moradia)' }
              },
              required: ['name', 'due_day']
            }
          }
        ],
        function_call: 'auto'
      }),
    });

    console.log('OpenAI Response Status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da OpenAI API:', errorText);
      
      // Resposta específica para limite excedido (429)
      let fallbackReply = '';
      if (response.status === 429) {
        fallbackReply = `Olá! Recebi sua mensagem: "${messageContent}". 

🤖 O serviço de IA está temporariamente indisponível (quota excedida). 

💡 Enquanto isso, você pode:
• Anotar seus gastos manualmente
• Voltar mais tarde para análises inteligentes
• Enviar relatórios simples como "resumo do mês"

Em breve voltaremos com análises completas! 🚀`;
      } else {
        fallbackReply = `Olá! Recebi sua mensagem: "${messageContent}". O sistema de IA está temporariamente indisponível. Tente novamente em alguns minutos! 🤖`;
      }
      
      // Enviar resposta de fallback
      const sendResponse = await fetch(
        'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: user.phone_number,
            message: fallbackReply
          })
        }
      );
      
      console.log('Resposta de fallback enviada:', sendResponse.status);
      
      // Marcar como processada com resposta de erro
      await supabase
        .from('whatsapp_conversations')
        .update({ processed: true, ai_response: fallbackReply })
        .eq('user_id', user.id)
        .eq('message_id', message.id);
      
      return;
    }

    const aiResponse = await response.json();
    let reply = '';

    // Verificar se IA quer chamar uma função
    if (aiResponse.choices[0].message.function_call) {
      const functionName = aiResponse.choices[0].message.function_call.name;
      const functionArgs = JSON.parse(aiResponse.choices[0].message.function_call.arguments);
      
      if (functionName === 'register_transaction') {
        // Registrar transação no banco
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            amount: functionArgs.amount,
            description: functionArgs.description,
            category: functionArgs.category || null,
            transaction_type: functionArgs.transaction_type,
            original_message: messageContent
          });

        if (transactionError) {
          console.error('Erro ao registrar transação:', transactionError);
          reply = 'Ops! Tive um problema ao registrar sua transação. Tente novamente.';
        } else {
          reply = `✅ Transação registrada!\n\n💰 ${functionArgs.transaction_type === 'expense' ? 'Gasto' : 'Receita'}: R$ ${functionArgs.amount}\n📝 ${functionArgs.description}\n${functionArgs.category ? `🏷️ Categoria: ${functionArgs.category}\n` : ''}\n📅 Data: ${new Date().toLocaleDateString('pt-BR')}`;
        }
      } else if (functionName === 'register_recurring_bill') {
        // Cadastrar conta recorrente no banco
        const { error: billError } = await supabase
          .from('recurring_bills')
          .insert({
            user_id: user.id,
            name: functionArgs.name,
            description: functionArgs.description || null,
            amount: functionArgs.amount || null,
            due_day: functionArgs.due_day,
            category: functionArgs.category || null
          });

        if (billError) {
          console.error('Erro ao cadastrar conta recorrente:', billError);
          reply = 'Ops! Tive um problema ao cadastrar sua conta recorrente. Tente novamente.';
        } else {
          reply = `✅ Conta recorrente cadastrada!\n\n📋 ${functionArgs.name}\n📅 Vencimento: Todo dia ${functionArgs.due_day}\n${functionArgs.amount ? `💰 Valor: R$ ${functionArgs.amount}\n` : ''}${functionArgs.category ? `🏷️ Categoria: ${functionArgs.category}\n` : ''}${functionArgs.description ? `📝 ${functionArgs.description}\n` : ''}\n🔔 Você receberá um lembrete no dia do vencimento!`;
        }
      }
    } else {
      reply = aiResponse.choices[0].message.content;
    }

    // Salvar resposta da IA na conversa
    const { error: insertError } = await supabase
      .from('whatsapp_conversations')
      .insert({
        user_id: user.id,
        message_type: 'text', // Adicionar o message_type obrigatório
        content: reply,
        is_from_user: false,
        processed: true
      });

    if (insertError) {
      console.error('Erro ao salvar resposta da IA:', insertError);
    }

    // Marcar mensagem original como processada
    const { error: updateError } = await supabase
      .from('whatsapp_conversations')
      .update({ processed: true })
      .eq('user_id', user.id)
      .eq('message_id', message.id);

    if (updateError) {
      console.error('Erro ao marcar mensagem como processada:', updateError);
    } else {
      console.log('Mensagem marcada como processada com sucesso');
    }

    // Enviar resposta via WhatsApp
    try {
      const sendResponse = await fetch(
        'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: user.phone_number,
            message: reply,
          }),
        },
      );

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        console.error('Erro ao enviar mensagem via WhatsApp:', errorText);
      } else {
        console.log(`Mensagem enviada para ${user.phone_number}`);
      }
    } catch (sendError) {
      console.error('Erro ao chamar whatsapp-send:', sendError);
    }

  } catch (error) {
    console.error('Erro ao processar mensagem com IA:', error);
  }
}

async function processAudioMessage(message: any): Promise<string> {
  try {
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    if (!whatsappToken) {
      throw new Error('WhatsApp token não configurado');
    }

    const mediaId = message.audio.id;
    const mediaInfoRes = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${whatsappToken}` } },
    );

    if (!mediaInfoRes.ok) {
      throw new Error(`Erro ao buscar mídia: ${await mediaInfoRes.text()}`);
    }

    const mediaInfo = await mediaInfoRes.json();
    const audioRes = await fetch(mediaInfo.url, {
      headers: { Authorization: `Bearer ${whatsappToken}` },
    });

    if (!audioRes.ok) {
      throw new Error(`Erro ao baixar áudio: ${await audioRes.text()}`);
    }

    const arrayBuffer = await audioRes.arrayBuffer();
    const file = new File(
      [arrayBuffer],
      'audio.ogg',
      { type: message.audio.mime_type || 'audio/ogg' },
    );

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const transcriptionRes = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
        body: formData,
      },
    );

    if (!transcriptionRes.ok) {
      throw new Error(`Erro ao transcrever áudio: ${await transcriptionRes.text()}`);
    }

    const transcription = await transcriptionRes.json();
    return transcription.text as string;
  } catch (err) {
    console.error('Erro ao processar mensagem de áudio:', err);
    return '';
  }
}

// Função utilitária para conversão segura de ArrayBuffer para base64
function arrayBufferToBase64Safe(buffer: ArrayBuffer): string {
  const uint8Array = new Uint8Array(buffer);
  let binaryString = '';
  const chunkSize = 8192; // Processar 8KB por vez para evitar stack overflow
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.subarray(i, i + chunkSize);
    binaryString += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binaryString);
}

async function processImageMessage(message: any): Promise<string> {
  try {
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    if (!whatsappToken) {
      throw new Error('WhatsApp token não configurado');
    }

    const mediaId = message.image.id;
    const mediaInfoRes = await fetch(
      `https://graph.facebook.com/v18.0/${mediaId}`,
      { headers: { Authorization: `Bearer ${whatsappToken}` } },
    );

    if (!mediaInfoRes.ok) {
      throw new Error(`Erro ao buscar mídia: ${await mediaInfoRes.text()}`);
    }

    const mediaInfo = await mediaInfoRes.json();
    const imageRes = await fetch(mediaInfo.url, {
      headers: { Authorization: `Bearer ${whatsappToken}` },
    });

    if (!imageRes.ok) {
      throw new Error(`Erro ao baixar imagem: ${await imageRes.text()}`);
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    // Usar função segura para conversão base64
    const base64 = arrayBufferToBase64Safe(arrayBuffer);

    const visionRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extraia todo o texto da imagem a seguir:' },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${message.image.mime_type || 'image/jpeg'};base64,${base64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!visionRes.ok) {
      throw new Error(`Erro na Vision API: ${await visionRes.text()}`);
    }

    const visionData = await visionRes.json();
    return visionData.choices?.[0]?.message?.content?.trim() ?? '';
  } catch (err) {
    console.error('Erro ao processar mensagem de imagem:', err);
    return '';
  }
}

// Função auxiliar para enviar mensagens WhatsApp
async function sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
  try {
    const sendResponse = await fetch(
      'https://gzitpxtmvakgebbpqiuh.supabase.co/functions/v1/whatsapp-send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          message: message
        })
      }
    );
    
    if (!sendResponse.ok) {
      console.error('Erro ao enviar mensagem via WhatsApp:', await sendResponse.text());
    } else {
      console.log(`Mensagem enviada para ${phoneNumber}`);
    }
  } catch (error) {
    console.error('Erro ao chamar whatsapp-send:', error);
  }
}

// Nova função para processar imagens financeiras sem duplicação
async function processImageForFinancialData(user: any, message: any, defaultClient: any): Promise<void> {
  try {
    console.log('=== PROCESSAMENTO DE IMAGEM FINANCEIRA INICIADO ===');
    console.log('Image ID:', message.image.id);
    
    const whatsappToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
    if (!whatsappToken) {
      throw new Error('WHATSAPP_ACCESS_TOKEN não configurado');
    }
    
    const openaiToken = Deno.env.get('OPENAI_API_KEY');
    if (!openaiToken) {
      throw new Error('OPENAI_API_KEY não configurado');
    }
    
    // Baixar a imagem do WhatsApp
    const mediaUrl = `https://graph.facebook.com/v18.0/${message.image.id}`;
    console.log('Fazendo request para:', mediaUrl);
    
    const mediaResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });
    
    console.log('Media response status:', mediaResponse.status);
    
    if (!mediaResponse.ok) {
      const errorText = await mediaResponse.text();
      console.error('Erro ao obter metadata da mídia:', errorText);
      throw new Error(`Erro ao obter metadata: ${mediaResponse.status}`);
    }
    
    const mediaData = await mediaResponse.json();
    console.log('Media data URL disponível:', !!mediaData.url);
    
    if (!mediaData.url) {
      throw new Error('URL da mídia não encontrada');
    }
    
    const imageResponse = await fetch(mediaData.url, {
      headers: {
        'Authorization': `Bearer ${whatsappToken}`
      }
    });
    
    console.log('Image response status:', imageResponse.status);
    
    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Erro ao baixar imagem:', errorText);
      throw new Error(`Erro ao baixar imagem: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Usar função segura para conversão base64
    const base64Image = arrayBufferToBase64Safe(imageBuffer);
    
    console.log('Imagem convertida para base64, tamanho:', base64Image.length);
    
    // Processar com OpenAI Vision
    console.log('Enviando para OpenAI Vision...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Você é um assistente que extrai dados financeiros de comprovantes, notas fiscais e extratos bancários. 
            Analise a imagem e extraia as seguintes informações quando disponíveis:
            - Valor da transação (apenas números, sem R$ ou outros símbolos)
            - Data da transação (formato DD/MM/AAAA)
            - Descrição/Estabelecimento
            - Tipo (receita ou despesa)
            - Categoria (OBRIGATÓRIO: alimentação, transporte, saúde, moradia, educação, lazer, vestuário, tecnologia, serviços, outros)
            
            IMPORTANTE: SEMPRE defina uma categoria baseada no estabelecimento/descrição. Exemplos:
            - Supermercados, restaurantes, delivery = "alimentação"
            - Uber, posto, ônibus = "transporte"  
            - Farmácia, hospital, médico = "saúde"
            - Aluguel, condomínio, água, luz = "moradia"
            - Escola, curso, livros = "educação"
            - Cinema, shopping, viagem = "lazer"
            - Roupas, calçados = "vestuário"
            - Celular, computador, internet = "tecnologia"
            - Salão, oficina, conserto = "serviços"
            
            Responda APENAS em formato JSON válido SEM marcações de código:
            {
              "valor": "123.45",
              "data": "15/01/2024",
              "descricao": "Supermercado XYZ",
              "tipo": "despesa",
              "categoria": "alimentação"
            }
            
            Se não conseguir extrair alguma informação específica, use null APENAS para valor, data e descrição. SEMPRE defina uma categoria apropriada.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extraia os dados financeiros desta imagem:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.1
      }),
    });
    
    console.log('OpenAI response status:', openaiResponse.status);
    
    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('Erro na API do OpenAI:', errorText);
      throw new Error(`Erro no OpenAI: ${openaiResponse.status}`);
    }
    
    const aiResult = await openaiResponse.json();
    console.log('OpenAI result:', aiResult.choices[0].message.content);
    
    try {
      // Limpar resposta do OpenAI (remover ```json se existir)
      let responseContent = aiResult.choices[0].message.content.trim();
      if (responseContent.startsWith('```json')) {
        responseContent = responseContent.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      }
      
      const extractedData = JSON.parse(responseContent);
      console.log('Dados extraídos:', extractedData);
    
      if (extractedData.valor && extractedData.valor !== null) {
        console.log('Criando transação automática...');
        // Criar transação automaticamente
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            client_id: defaultClient?.id,
            description: extractedData.descricao || 'Transação extraída de imagem',
            amount: parseFloat(extractedData.valor),
            date: extractedData.data ? 
              extractedData.data.split('/').reverse().join('-') : 
              new Date().toISOString().split('T')[0],
            category: extractedData.categoria || 'Outros',
            transaction_type: extractedData.tipo === 'receita' ? 'income' : 'expense',
            source: 'whatsapp_image',
            original_message: `Dados extraídos: ${JSON.stringify(extractedData)}`
          });
        
        if (!transactionError) {
          console.log('Transação criada com sucesso!');
          const responseMessage = `✅ *Transação extraída e cadastrada!*

💰 Valor: R$ ${parseFloat(extractedData.valor).toFixed(2)}
📝 Descrição: ${extractedData.descricao || 'N/A'}
📅 Data: ${extractedData.data || 'Hoje'}
📂 Categoria: ${extractedData.categoria || 'Outros'}
🔄 Tipo: ${extractedData.tipo === 'receita' ? 'Receita' : 'Despesa'}

Transação salva automaticamente! 💜`;
          
          await sendWhatsAppMessage(user.phone_number, responseMessage);
        } else {
          console.error('Erro ao criar transação:', transactionError);
          await sendWhatsAppMessage(user.phone_number, '❌ Erro ao salvar transação no banco de dados.');
        }
      } else {
        console.log('Dados extraídos incompletos ou inválidos');
        await sendWhatsAppMessage(user.phone_number, '❌ Não consegui extrair dados financeiros válidos desta imagem. Tente enviar uma foto mais clara do comprovante ou nota fiscal.');
      }
    } catch (jsonError) {
      console.error('Erro ao fazer parse do JSON:', jsonError);
      console.log('Resposta do OpenAI que causou erro:', aiResult.choices[0].message.content);
      
      await sendWhatsAppMessage(user.phone_number, '❌ Erro ao interpretar os dados extraídos da imagem. Tente uma foto mais clara.');
    }
    
  } catch (error) {
    console.error('=== ERRO DETALHADO NO PROCESSAMENTO DE IMAGEM ===');
    console.error('Tipo do erro:', error.name);
    console.error('Mensagem do erro:', error.message);
    console.error('Stack trace:', error.stack);
    
    await sendWhatsAppMessage(user.phone_number, `❌ Erro ao processar a imagem: ${error.message}. Tente novamente ou digite os dados manualmente.`);
  }
}