import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MessageCircle, Send, Mic, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'audio' | 'image';
}

export function WhatsAppSimulator() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const simulateAIResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let aiResponse = '';
      
      // Simula processamento de IA baseado na mensagem
      if (userMessage.toLowerCase().includes('gastei') || userMessage.toLowerCase().includes('r$')) {
        const expense = userMessage.match(/r?\$?\s?(\d+(?:,\d{2})?)/i);
        const amount = expense ? expense[1] : '0';
        aiResponse = `✅ Gasto registrado!\n\n💰 Valor: R$ ${amount}\n📅 Data: ${new Date().toLocaleDateString('pt-BR')}\n🏷️ Categoria: Alimentação\n\n📊 Seu saldo atual: R$ 1.247,50\n📈 Total gasto hoje: R$ ${amount}`;
      } else if (userMessage.toLowerCase().includes('recebi') || userMessage.toLowerCase().includes('salário')) {
        aiResponse = '💰 Receita registrada com sucesso!\n\n✨ Parabéns! Sua situação financeira melhorou.\n📊 Saldo atualizado no dashboard.';
      } else if (userMessage.toLowerCase().includes('relatório') || userMessage.toLowerCase().includes('resumo')) {
        aiResponse = '📊 Resumo Financeiro - Janeiro 2024\n\n💰 Receitas: R$ 3.500,00\n💸 Gastos: R$ 2.252,50\n💚 Saldo: R$ 1.247,50\n\n🏆 Você está economizando 35% da renda!\n\n📈 Ver detalhes no dashboard →';
      } else {
        aiResponse = 'Entendi! Para registrar gastos, me diga:\n\n💰 Valor gasto\n🏪 Local/descrição\n📅 Data (opcional)\n\nOu pergunte sobre:\n📊 Relatórios\n💡 Dicas financeiras\n🎯 Metas de economia';
      }
      
      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    
    // Simula resposta da IA
    simulateAIResponse(inputMessage);
  };

  const simulateAudioMessage = () => {
    const audioMessage: Message = {
      id: Date.now().toString(),
      text: '🎵 Áudio: "Oi, gastei quarenta reais na farmácia comprando remédio"',
      isUser: true,
      timestamp: new Date(),
      type: 'audio'
    };
    
    setMessages(prev => [...prev, audioMessage]);
    simulateAIResponse('Gastei R$ 40 na farmácia');
    
    toast({
      title: "Áudio processado!",
      description: "IA converteu seu áudio em texto automaticamente"
    });
  };

  const simulatePhotoMessage = () => {
    const photoMessage: Message = {
      id: Date.now().toString(),
      text: '📷 Foto: Nota fiscal - Supermercado Extra',
      isUser: true,
      timestamp: new Date(),
      type: 'image'
    };
    
    setMessages(prev => [...prev, photoMessage]);
    simulateAIResponse('Gastei R$ 127 no supermercado');
    
    toast({
      title: "Foto analisada!",
      description: "IA extraiu dados da nota fiscal automaticamente"
    });
  };

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-gradient-to-b from-green-50 to-white rounded-lg border border-green-200 shadow-whatsapp">
      {/* Header do WhatsApp */}
      <div className="bg-financial-primary text-white p-4 rounded-t-lg flex items-center gap-3">
        <MessageCircle className="w-6 h-6" />
        <div>
          <h3 className="font-semibold">GranaZen IA</h3>
          <p className="text-sm text-green-100">Online - Assistente Financeiro</p>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.isUser
                  ? 'bg-financial-primary text-white rounded-br-sm'
                  : 'bg-white text-gray-800 rounded-bl-sm border'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.text}</p>
              <span className="text-xs opacity-70 block mt-1">
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-sm border p-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            size="sm"
            className="bg-financial-primary hover:bg-financial-primary-light"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={simulateAudioMessage}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <Mic className="w-3 h-3 mr-1" />
            Áudio
          </Button>
          <Button
            onClick={simulatePhotoMessage}
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
          >
            <Camera className="w-3 h-3 mr-1" />
            Foto
          </Button>
        </div>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          🤖 Simulação da IA - Teste enviando: "Gastei R$ 50 no restaurante"
        </p>
      </div>
    </div>
  );
}