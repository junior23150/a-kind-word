
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar, X, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";

interface TransferSlideInProps {
  onClose: () => void;
}

// Dados mockados removidos - usando apenas dados reais do Supabase

export function TransferSlideIn({ onClose }: TransferSlideInProps) {
  const [sourceAccount, setSourceAccount] = useState("");
  const [destinationAccount, setDestinationAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [dateInput, setDateInput] = useState(format(new Date(), "dd/MM/yyyy"));
  const [showCalendar, setShowCalendar] = useState(false);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleAmountChange = (value: string) => {
    // Remove tudo exceto números e vírgula/ponto
    const numericValue = value.replace(/[^\d,.-]/g, '');
    setAmount(numericValue);
  };

  const handleDateInputChange = (value: string) => {
    // Remove tudo exceto números
    let numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara DD/MM/AAAA
    if (numericValue.length >= 2) {
      numericValue = numericValue.slice(0, 2) + '/' + numericValue.slice(2);
    }
    if (numericValue.length >= 5) {
      numericValue = numericValue.slice(0, 5) + '/' + numericValue.slice(5, 9);
    }
    
    setDateInput(numericValue);
    
    // Se a data estiver completa, tenta converter para Date
    if (numericValue.length === 10) {
      const [day, month, year] = numericValue.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        setTransferDate(date);
      }
    }
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      setTransferDate(date);
      setDateInput(format(date, "dd/MM/yyyy"));
      setShowCalendar(false);
    }
  };

  const handleTransfer = () => {
    if (!sourceAccount || !destinationAccount || !amount) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (sourceAccount === destinationAccount) {
      toast({
        title: "Erro",
        description: "A conta de origem deve ser diferente da conta de destino",
        variant: "destructive",
      });
      return;
    }

    // Simular transferência
    console.log("Transfer details:", {
      sourceAccount,
      destinationAccount,
      amount,
      transferDate,
    });

    toast({
      title: "Transferência realizada",
      description: "A transferência foi realizada com sucesso",
    });

    onClose();
  };

  const getAccountBalance = (accountId: string) => {
    // TODO: Implementar busca de saldo real do Supabase
    return 0;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Slide-in Panel */}
      <div className="fixed right-0 top-0 w-full max-w-md bg-white h-full shadow-xl z-50 transform transition-transform duration-300 ease-in-out translate-x-0 animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-white">
            <h2 className="text-lg font-semibold text-black">
              Transferência entre contas
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0 text-black hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            <p className="text-sm text-muted-foreground">
              A transferência será realizada somente utilizando o saldo entre as contas financeiras cadastradas.
            </p>

            <div className="text-sm font-medium text-foreground">
              Insira as informações da transferência
            </div>

            {/* Account Selection - Side by side */}
            <div className="grid grid-cols-2 gap-4 items-start">
              <div className="space-y-2">
                <Label htmlFor="source-account" className="text-sm font-medium text-black">
                  Conta Origem *
                </Label>
                <Select value={sourceAccount} onValueChange={setSourceAccount}>
                  <SelectTrigger className="rounded-xl border-knumbers-green/30 focus:border-knumbers-green">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Carregar contas reais do Supabase */}
                  </SelectContent>
                </Select>
                {sourceAccount && (
                  <div className="text-xs text-knumbers-green font-medium bg-knumbers-green/10 p-2 rounded-lg">
                    Saldo: {formatCurrency(getAccountBalance(sourceAccount))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="destination-account" className="text-sm font-medium text-black">
                  Conta Destino *
                </Label>
                <Select value={destinationAccount} onValueChange={setDestinationAccount}>
                  <SelectTrigger className="rounded-xl border-knumbers-purple/30 focus:border-knumbers-purple">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* TODO: Carregar contas reais do Supabase */}
                  </SelectContent>
                </Select>
                {destinationAccount && (
                  <div className="text-xs text-knumbers-purple font-medium bg-knumbers-purple/10 p-2 rounded-lg">
                    Saldo: {formatCurrency(getAccountBalance(destinationAccount))}
                  </div>
                )}
              </div>
            </div>

            {/* Arrow indicator */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-knumbers-green to-knumbers-purple p-2 rounded-full">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Valor (R$) *
                </Label>
                <Input
                  id="amount"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transfer-date" className="text-sm font-medium">
                  Data da transferência *
                </Label>
                <div className="relative">
                  <Input
                    id="transfer-date"
                    placeholder="DD/MM/AAAA"
                    value={dateInput}
                    onChange={(e) => handleDateInputChange(e.target.value)}
                    className="rounded-xl pr-10"
                    maxLength={10}
                  />
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={transferDate}
                        onSelect={handleCalendarSelect}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-knumbers-green/10 to-knumbers-purple/10 border border-knumbers-green/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-gradient-to-r from-knumbers-green to-knumbers-purple rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <p className="text-sm text-foreground">
                  Todas as transações de transferência de entrada ou saída serão categorizadas de forma automática
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-border">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-xl border-knumbers-green text-knumbers-green hover:bg-knumbers-green/10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleTransfer}
                className="flex-1 bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white hover:opacity-90 rounded-xl"
              >
                Transferir
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
