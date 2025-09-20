import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { X, Calendar, Info, ArrowRight, DollarSign } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface TransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: Account[];
  selectedAccount: string;
}

export function TransferModal({
  open,
  onOpenChange,
  accounts,
  selectedAccount,
}: TransferModalProps) {
  const [destinationAccount, setDestinationAccount] = useState("");
  const [amount, setAmount] = useState("0,00");
  const [transferDate, setTransferDate] = useState<Date>(new Date());
  const [bankFloat, setBankFloat] = useState("0");

  const sourceAccount = accounts.find((acc) => acc.id === selectedAccount);
  const destinationAccountData = accounts.find(
    (acc) => acc.id === destinationAccount
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  };

  const handleAmountChange = (value: string) => {
    // Remove tudo exceto números
    const numbers = value.replace(/\D/g, "");

    if (numbers === "") {
      setAmount("0,00");
      return;
    }

    // Converte para centavos
    const cents = parseInt(numbers);
    const reais = cents / 100;

    // Formata como moeda brasileira
    const formatted = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(reais);

    setAmount(formatted);
  };

  const handleTransfer = () => {
    // Aqui você implementaria a lógica de transferência
    console.log("Transferência:", {
      sourceAccount: selectedAccount,
      destinationAccount,
      amount,
      transferDate,
      bankFloat,
    });

    // Fechar modal
    onOpenChange(false);

    // Resetar formulário
    setDestinationAccount("");
    setAmount("0,00");
    setTransferDate(new Date());
    setBankFloat("0");
  };

  const handleCancel = () => {
    onOpenChange(false);
    setDestinationAccount("");
    setAmount("0,00");
    setTransferDate(new Date());
    setBankFloat("0");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
      <div className="bg-white h-full w-full max-w-md shadow-2xl transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            Transferência entre contas
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto h-full">
          {/* Instruction */}
          <p className="text-sm text-muted-foreground">
            A transferência será realizada somente utilizando o saldo entre as
            contas financeiras cadastradas.
          </p>

          {/* Transfer Information */}
          <div>
            <h3 className="text-sm font-medium text-foreground mb-4">
              Insira as informações da transferência
            </h3>

            <div className="space-y-6">
              {/* Source Account */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Conta Origem
                </Label>
                <Select value={selectedAccount} disabled>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Saldo: {formatCurrency(sourceAccount?.balance || 0)}
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>

              {/* Destination Account */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Conta Destino
                </Label>
                <Select
                  value={destinationAccount}
                  onValueChange={setDestinationAccount}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter((account) => account.id !== selectedAccount)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-1">
                  Saldo: {formatCurrency(destinationAccountData?.balance || 0)}
                </p>
              </div>

              {/* Amount */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Valor (R$)
                </Label>
                <Input
                  type="text"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="mt-2"
                  placeholder="0,00"
                />
              </div>

              {/* Transfer Date */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Data da transferência
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-2",
                        !transferDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {transferDate
                        ? formatDate(transferDate)
                        : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={transferDate}
                      onSelect={(date) => date && setTransferDate(date)}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Bank Float */}
              <div>
                <Label className="text-sm font-medium text-foreground">
                  Float bancário (dias)
                </Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    value={bankFloat}
                    onChange={(e) => setBankFloat(e.target.value)}
                    className="flex-1"
                    min="0"
                  />
                  <Button variant="ghost" size="sm" className="p-2">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-800">
                  Todas as transações de transferência de entrada ou saída serão
                  categorizadas de forma automática
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="border-t border-border p-6">
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="border-knumbers-green text-knumbers-green hover:bg-knumbers-green/5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleTransfer}
              className="bg-gradient-to-r from-knumbers-green to-knumbers-purple text-white hover:opacity-90"
              disabled={!destinationAccount || amount === "0,00"}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Transferir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
