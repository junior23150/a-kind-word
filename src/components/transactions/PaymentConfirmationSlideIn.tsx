import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import { Calendar, X, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string | null;
  transaction_type: "income" | "expense";
  date: string;
  bank_account_id: string | null;
}

interface BankAccount {
  id: string;
  bank_name: string;
  account_type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
  color: string;
  icon: string;
}

interface PaymentConfirmationSlideInProps {
  onClose: () => void;
  onPaymentConfirmed?: () => void;
  transactions: Transaction[];
}

export function PaymentConfirmationSlideIn({
  onClose,
  onPaymentConfirmed,
  transactions,
}: PaymentConfirmationSlideInProps) {
  const [groupedLaunch, setGroupedLaunch] = useState(false);
  const [singleCategory, setSingleCategory] = useState(false);
  const [useDueDate, setUseDueDate] = useState(false);
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("");
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [showPaymentDateCalendar, setShowPaymentDateCalendar] = useState(false);
  const [history, setHistory] = useState("");
  const [expandedTransactions, setExpandedTransactions] = useState(true);
  const [loading, setLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Estados para cada transação individual
  const [transactionDetails, setTransactionDetails] = useState<{
    [key: string]: {
      bankAccountId: string;
      categoryId: string;
      interest: string;
      discount: string;
      penalty: string;
      fee: string;
      paidValue: string;
    };
  }>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;

      try {
        const [accountsData, categoriesData] = await Promise.all([
          supabase
            .from("bank_accounts")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("bank_name"),
          supabase
            .from("categories")
            .select("*")
            .eq("user_id", user.id)
            .eq("is_active", true)
            .order("name"),
        ]);

        if (accountsData.data) setBankAccounts(accountsData.data);
        if (categoriesData.data) setCategories(categoriesData.data);

        // Inicializar detalhes de cada transação
        const initialDetails: typeof transactionDetails = {};
        transactions.forEach((t) => {
          initialDetails[t.id] = {
            bankAccountId: t.bank_account_id || "",
            categoryId: t.category || "",
            interest: "0,00",
            discount: "0,00",
            penalty: "0,00",
            fee: "0,00",
            paidValue: t.amount.toFixed(2).replace(".", ","),
          };
        });
        setTransactionDetails(initialDetails);

        // Preencher histórico com primeira transação
        if (transactions.length > 0) {
          setHistory(transactions[0].description);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };

    fetchData();
  }, [user?.id, transactions]);

  const handlePaymentDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setPaymentDate(selectedDate);
      setShowPaymentDateCalendar(false);
    }
  };

  const updateTransactionDetail = (
    transactionId: string,
    field: string,
    value: string
  ) => {
    setTransactionDetails((prev) => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        [field]: value,
      },
    }));
  };

  const calculateTotal = () => {
    return transactions.reduce((total, t) => total + t.amount, 0);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);

    try {
      // Atualizar status de todas as transações selecionadas para "Paga"
      const updatePromises = transactions.map((transaction) =>
        supabase
          .from("transactions")
          .update({ status: "Paga" })
          .eq("id", transaction.id)
      );

      await Promise.all(updatePromises);

      toast({
        title: "Sucesso",
        description: "Pagamento confirmado com sucesso!",
      });

      onPaymentConfirmed?.();
      onClose();
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      toast({
        title: "Erro",
        description: "Erro ao confirmar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide In Panel - 85% width */}
      <div className="fixed top-0 right-0 h-full w-[85%] bg-white shadow-2xl z-50 animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Baixa de lançamentos
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Inclua as informações necessárias para a baixa dos lançamentos.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-1 hover:bg-accent"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Form Fields Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Data do pagamento */}
              <div className="space-y-2">
                <Label className="text-sm text-foreground">
                  Data do pagamento
                </Label>
                <div className="relative">
                  <Input
                    value={format(paymentDate, "dd/MM/yyyy", { locale: pt })}
                    readOnly
                    className="pr-10 cursor-pointer rounded-lg"
                    onClick={() => setShowPaymentDateCalendar(true)}
                  />
                  <Popover
                    open={showPaymentDateCalendar}
                    onOpenChange={setShowPaymentDateCalendar}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                      >
                        <Calendar className="h-4 w-4 text-primary" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <CalendarComponent
                        mode="single"
                        selected={paymentDate}
                        onSelect={handlePaymentDateSelect}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                        locale={pt}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Valor total */}
              <div className="space-y-2">
                <Label htmlFor="total" className="text-sm text-foreground">
                  Valor total
                </Label>
                <Input
                  id="total"
                  value={`R$ ${calculateTotal().toFixed(2).replace(".", ",")}`}
                  readOnly
                  className="rounded-lg bg-muted"
                />
              </div>
            </div>

            {/* Histórico */}
            <div className="space-y-2">
              <Label htmlFor="history" className="text-sm text-foreground">
                Histórico
              </Label>
              <Textarea
                id="history"
                value={history}
                onChange={(e) => setHistory(e.target.value)}
                className="rounded-lg min-h-[80px] resize-none"
                placeholder="Digite o histórico do pagamento..."
              />
            </div>

            {/* Lançamentos selecionados */}
            <div className="border border-border rounded-lg">
              <div
                className="flex items-center justify-between p-4 cursor-pointer bg-accent/50"
                onClick={() => setExpandedTransactions(!expandedTransactions)}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">
                    Lançamentos selecionados
                  </h3>
                  {expandedTransactions ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </div>

              {expandedTransactions && (
                <div className="p-4 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      i
                    </div>
                    <p className="text-sm text-blue-900">
                      Os cálculos de juros e multa são realizados automaticamente
                      caso haja valores fornecidos na inclusão da conta
                    </p>
                  </div>

                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction.id}
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      {/* Transaction Summary */}
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Cliente:</span>
                          <p className="font-medium">{transaction.description}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Nº do documento:
                          </span>
                          <p className="font-medium">-</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Vencimento:
                          </span>
                          <p className="font-medium">
                            {format(new Date(transaction.date), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Valor original:
                          </span>
                          <p className="font-medium">
                            R$ {transaction.amount.toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      <div className="grid grid-cols-7 gap-3">
                        <div className="col-span-2 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Conta financeira
                          </Label>
                          <Select
                            value={transactionDetails[transaction.id]?.bankAccountId || ""}
                            onValueChange={(value) =>
                              updateTransactionDetail(
                                transaction.id,
                                "bankAccountId",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="rounded-lg text-sm h-9">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {bankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.bank_name} - {account.account_type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Categoria
                          </Label>
                          <Select
                            value={transactionDetails[transaction.id]?.categoryId || ""}
                            onValueChange={(value) =>
                              updateTransactionDetail(
                                transaction.id,
                                "categoryId",
                                value
                              )
                            }
                          >
                            <SelectTrigger className="rounded-lg text-sm h-9">
                              <SelectValue placeholder="Sem categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                  {cat.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Juros
                          </Label>
                          <Input
                            value={transactionDetails[transaction.id]?.interest || "0,00"}
                            onChange={(e) =>
                              updateTransactionDetail(
                                transaction.id,
                                "interest",
                                e.target.value
                              )
                            }
                            className="rounded-lg text-sm h-9 text-center"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Desconto
                          </Label>
                          <Input
                            value={transactionDetails[transaction.id]?.discount || "0,00"}
                            onChange={(e) =>
                              updateTransactionDetail(
                                transaction.id,
                                "discount",
                                e.target.value
                              )
                            }
                            className="rounded-lg text-sm h-9 text-center"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Multa
                          </Label>
                          <Input
                            value={transactionDetails[transaction.id]?.penalty || "0,00"}
                            onChange={(e) =>
                              updateTransactionDetail(
                                transaction.id,
                                "penalty",
                                e.target.value
                              )
                            }
                            className="rounded-lg text-sm h-9 text-center"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Tarifa
                          </Label>
                          <Input
                            value={transactionDetails[transaction.id]?.fee || "0,00"}
                            onChange={(e) =>
                              updateTransactionDetail(
                                transaction.id,
                                "fee",
                                e.target.value
                              )
                            }
                            className="rounded-lg text-sm h-9 text-center"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Valor pago
                          </Label>
                          <Input
                            value={transactionDetails[transaction.id]?.paidValue || ""}
                            onChange={(e) =>
                              updateTransactionDetail(
                                transaction.id,
                                "paidValue",
                                e.target.value
                              )
                            }
                            className="rounded-lg text-sm h-9 text-center font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border p-6 flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="px-6"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              {loading ? "Processando..." : "Baixar pagamento"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
